import shutil
import logging
from datetime import datetime, timezone
from pathlib import Path

logger = logging.getLogger("agenda.backup")

KEEP_BACKUPS = 7


def _data_dir() -> Path:
    from .database import DATA_DIR
    return Path(DATA_DIR)


def _backup_dir() -> Path:
    d = _data_dir() / "_backups"
    d.mkdir(exist_ok=True)
    return d


def run_backup() -> dict:
    stamp   = datetime.now(tz=timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    bdir    = _backup_dir()
    backed  = []
    errors  = []

    for user_dir in _data_dir().iterdir():
        if not user_dir.is_dir() or user_dir.name.startswith("_"):
            continue
        db = user_dir / "agenda.db"
        if not db.exists():
            continue
        try:
            shutil.copy2(db, bdir / f"{user_dir.name}_{stamp}.db")
            backed.append(user_dir.name)
        except Exception as exc:
            errors.append(f"{user_dir.name}: {exc}")
            logger.error("backup failed for %s: %s", user_dir.name, exc)

    # Prune old backups — keep only the last KEEP_BACKUPS per user
    for user in backed:
        old_files = sorted(bdir.glob(f"{user}_*.db"))
        for f in old_files[:-KEEP_BACKUPS]:
            try:
                f.unlink()
            except Exception as exc:
                logger.warning("could not prune %s: %s", f, exc)

    logger.info("backup done — %d user(s), stamp=%s", len(backed), stamp)
    return {"timestamp": stamp, "users": backed, "errors": errors}


def get_backup_status() -> dict:
    bdir = _backup_dir()
    all_files = sorted(bdir.glob("*.db"))
    if not all_files:
        return {"last_backup": None, "file_count": 0}
    latest = all_files[-1]
    mtime  = datetime.fromtimestamp(latest.stat().st_mtime, tz=timezone.utc).isoformat()
    return {"last_backup": mtime, "file_count": len(all_files)}
