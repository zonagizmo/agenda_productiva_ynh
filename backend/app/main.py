import os
import json
import asyncio
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from .routers import storage, providers, prompt, backup as backup_router
from .backup import run_backup
from .version import get_version_info

logging.basicConfig(
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger("agenda")

PATH_PREFIX = os.environ.get("APP_PATH", "").rstrip("/")
_default_dist = Path(__file__).parent.parent.parent / "sources" / "dist"
DIST_DIR      = Path(os.environ.get("AGENDA_DIST_DIR", str(_default_dist)))

BACKUP_INTERVAL_H = int(os.environ.get("AGENDA_BACKUP_INTERVAL_H", "24"))


async def _backup_loop():
    await asyncio.sleep(300)  # wait 5 min after startup before first auto-backup
    while True:
        try:
            run_backup()
        except Exception as exc:
            logger.error("auto-backup error: %s", exc)
        await asyncio.sleep(BACKUP_INTERVAL_H * 3600)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    task = asyncio.create_task(_backup_loop())
    logger.info("Backup scheduler started — interval=%dh", BACKUP_INTERVAL_H)
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(docs_url=None, redoc_url=None, lifespan=lifespan)
logger.info("Agenda Productiva backend starting — dist=%s", DIST_DIR)

# ── API routers ────────────────────────────────────────────
app.include_router(storage.router)
app.include_router(providers.router)
app.include_router(prompt.router)
app.include_router(backup_router.router)


@app.get("/api/version")
def version():
    return get_version_info()


# ── PWA ───────────────────────────────────────────────────
@app.get("/manifest.json")
def manifest():
    base = PATH_PREFIX
    data = {
        "name": "Agenda Productiva",
        "short_name": "Agenda",
        "description": "Planificación diaria con IA",
        "start_url": base + "/",
        "scope": base + "/",
        "display": "standalone",
        "orientation": "portrait-primary",
        "background_color": "#080810",
        "theme_color": "#4d96ff",
        "icons": [
            {"src": base + "/icons/icon-192.png",          "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": base + "/icons/icon-512.png",          "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": base + "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
            {"src": base + "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    return Response(json.dumps(data), media_type="application/manifest+json")


@app.get("/sw.js")
def service_worker():
    sw_path = DIST_DIR / "sw.js"
    if not sw_path.exists():
        return Response("", media_type="application/javascript")
    return FileResponse(
        sw_path,
        media_type="application/javascript",
        headers={
            "Service-Worker-Allowed": (PATH_PREFIX or "") + "/",
            "Cache-Control": "no-cache",
        },
    )


# ── Static files (built Vue dist) ─────────────────────────
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")
    app.mount("/icons",  StaticFiles(directory=str(DIST_DIR / "icons")),  name="icons")


@app.get("/")
@app.get("/{path:path}")
async def spa(request: Request, path: str = ""):
    index = DIST_DIR / "index.html"
    if index.exists():
        return FileResponse(index)
    logger.error("Frontend not found at %s — serving 503", DIST_DIR)
    return Response("App not built", status_code=503)
