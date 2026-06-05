import logging
from fastapi import APIRouter, Request
from ..auth import current_user
from ..backup import run_backup, get_backup_status

router = APIRouter(prefix="/api/backup")
logger = logging.getLogger("agenda.backup.api")


@router.get("/status")
def backup_status(request: Request):
    current_user(request)
    return get_backup_status()


@router.post("/run")
def backup_run(request: Request):
    user   = current_user(request)
    result = run_backup()
    logger.info("manual backup triggered by %s", user)
    return result
