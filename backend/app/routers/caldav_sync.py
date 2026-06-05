import json
import logging
from datetime import date, datetime, timedelta, timezone
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from ..auth import current_user
from ..database import init_db, get_value, set_value

router = APIRouter(prefix="/api/caldav")
logger = logging.getLogger("agenda.caldav")

STORAGE_KEY = "caldav-config"
PW_MASK     = "••••••••"


# ── Config model ──────────────────────────────────────────

class CaldavConfig(BaseModel):
    server_url:      str  = ""
    nc_username:     str  = ""
    nc_password:     str  = ""
    calendar_name:   str  = "personal"
    sync_reuniones:  bool = True
    sync_plazos:     bool = True


# ── Storage helpers ───────────────────────────────────────

def _load(user: str) -> dict:
    init_db(user)
    raw = get_value(user, STORAGE_KEY)
    return json.loads(raw) if raw else {}


def _save(user: str, cfg: dict) -> None:
    set_value(user, STORAGE_KEY, json.dumps(cfg, ensure_ascii=False))


# ── CalDAV helpers ────────────────────────────────────────

def _cal_url(server: str, nc_user: str, cal_name: str) -> str:
    return f"{server.rstrip('/')}/remote.php/dav/calendars/{nc_user}/{cal_name}/"


def _make_ics(uid: str, summary: str, day: str, hora: str | None) -> bytes:
    safe = (summary
            .replace("\\", "\\\\").replace(",", "\\,")
            .replace(";", "\\;").replace("\n", "\\n"))
    day_compact = day.replace("-", "")
    if hora:
        hh, mm = hora.split(":")
        end_hh  = str((int(hh) + 1) % 24).zfill(2)
        dtstart = f"DTSTART:{day_compact}T{hh}{mm}00"
        dtend   = f"DTEND:{day_compact}T{end_hh}{mm}00"
    else:
        d_end   = (date.fromisoformat(day) + timedelta(days=1)).strftime("%Y%m%d")
        dtstart = f"DTSTART;VALUE=DATE:{day_compact}"
        dtend   = f"DTEND;VALUE=DATE:{d_end}"

    lines = [
        "BEGIN:VCALENDAR", "VERSION:2.0",
        "PRODID:-//Agenda Productiva//ES",
        "BEGIN:VEVENT",
        f"UID:{uid}@agenda-productiva",
        f"SUMMARY:{safe}",
        dtstart, dtend,
        "DESCRIPTION:Agenda Productiva",
        "END:VEVENT", "END:VCALENDAR",
    ]
    return "\r\n".join(lines).encode("utf-8")


def _propfind(url: str, auth: tuple) -> int:
    import requests as req
    body = (
        '<?xml version="1.0"?>'
        '<d:propfind xmlns:d="DAV:">'
        "<d:prop><d:resourcetype/></d:prop>"
        "</d:propfind>"
    )
    r = req.request(
        "PROPFIND", url, auth=auth,
        headers={"Depth": "0", "Content-Type": "application/xml"},
        data=body, timeout=10,
    )
    return r.status_code


# ── Endpoints ─────────────────────────────────────────────

@router.get("/config")
def get_config(request: Request):
    user = current_user(request)
    cfg  = _load(user)
    out  = dict(cfg)
    if out.get("nc_password"):
        out["nc_password"] = PW_MASK
    return out


@router.post("/config")
def save_config(body: CaldavConfig, request: Request):
    user     = current_user(request)
    existing = _load(user)
    update   = body.model_dump()
    if update.get("nc_password") == PW_MASK:
        update["nc_password"] = existing.get("nc_password", "")
    existing.update(update)
    _save(user, existing)
    return {"ok": True}


@router.post("/test")
def test_connection(request: Request):
    user = current_user(request)
    cfg  = _load(user)
    if not cfg.get("server_url") or not cfg.get("nc_username") or not cfg.get("nc_password"):
        raise HTTPException(400, "Configuración incompleta")
    url  = _cal_url(cfg["server_url"], cfg["nc_username"], cfg.get("calendar_name", "personal"))
    auth = (cfg["nc_username"], cfg["nc_password"])
    try:
        status = _propfind(url, auth)
        if status in (207, 200):
            return {"ok": True}
        return {"ok": False, "status": status}
    except Exception as exc:
        raise HTTPException(502, str(exc))


@router.post("/sync")
def sync_calendar(request: Request):
    import requests as req
    user = current_user(request)
    cfg  = _load(user)
    if not cfg.get("server_url") or not cfg.get("nc_username") or not cfg.get("nc_password"):
        raise HTTPException(400, "Configuración incompleta")

    raw_agenda = get_value(user, "agenda-v3")
    if not raw_agenda:
        return {"synced": 0, "deleted": 0, "errors": []}
    agenda_data: dict = json.loads(raw_agenda)

    base_url = _cal_url(cfg["server_url"], cfg["nc_username"], cfg.get("calendar_name", "personal"))
    auth     = (cfg["nc_username"], cfg["nc_password"])
    today    = date.today().isoformat()

    prev_uids: set[str] = set(cfg.get("synced_uids", []))
    curr_uids: set[str] = set()
    synced  = 0
    errors  = []

    for day_key, day_data in agenda_data.items():
        if day_key < today:
            continue  # sólo hoy y futuro

        sections: list[tuple[str, list]] = []
        if cfg.get("sync_reuniones", True):
            sections.append(("reuniones", day_data.get("reuniones", [])))
        if cfg.get("sync_plazos", True):
            sections.append(("plazos", day_data.get("plazos", [])))

        for _, items in sections:
            for item in items:
                texto = item.get("texto", "").strip()
                if not texto or item.get("done"):
                    continue
                uid = item["id"]
                curr_uids.add(uid)
                avisos = item.get("avisos", [])
                hora   = avisos[0].get("hora") if avisos else None
                ics    = _make_ics(uid, texto, day_key, hora)
                try:
                    r = req.put(
                        f"{base_url}{uid}.ics", auth=auth,
                        headers={"Content-Type": "text/calendar; charset=utf-8"},
                        data=ics, timeout=10,
                    )
                    if r.status_code in (200, 201, 204):
                        synced += 1
                    else:
                        errors.append(f"{uid}: HTTP {r.status_code}")
                except Exception as exc:
                    errors.append(f"{uid}: {exc}")

    # Borrar eventos que ya no existen en la agenda
    deleted = 0
    for uid in prev_uids - curr_uids:
        try:
            r = req.delete(f"{base_url}{uid}.ics", auth=auth, timeout=10)
            if r.status_code in (200, 204, 404):
                deleted += 1
        except Exception as exc:
            errors.append(f"del {uid}: {exc}")

    cfg["synced_uids"] = list(curr_uids)
    cfg["last_sync"]   = datetime.now(tz=timezone.utc).isoformat()
    _save(user, cfg)

    logger.info("sync user=%s synced=%d deleted=%d errors=%d", user, synced, deleted, len(errors))
    return {"synced": synced, "deleted": deleted, "errors": errors, "last_sync": cfg["last_sync"]}
