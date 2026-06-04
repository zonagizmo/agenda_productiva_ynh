import logging
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from ..auth import current_user
from ..database import init_db, get_value, set_value, delete_value

router  = APIRouter(prefix="/api/storage")
logger  = logging.getLogger("agenda.storage")


class SetBody(BaseModel):
    value: str


@router.get("/{key}")
def storage_get(key: str, request: Request):
    user = current_user(request)
    init_db(user)
    return {"value": get_value(user, key)}


@router.post("/{key}")
def storage_set(key: str, body: SetBody, request: Request):
    user = current_user(request)
    init_db(user)
    set_value(user, key, body.value)
    logger.debug("storage set [%s] %s (%d bytes)", user, key, len(body.value))
    return {"ok": True}


@router.delete("/{key}")
def storage_delete(key: str, request: Request):
    user = current_user(request)
    init_db(user)
    delete_value(user, key)
    return {"ok": True}
