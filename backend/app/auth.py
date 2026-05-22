import base64
from fastapi import Request, HTTPException


def current_user(request: Request) -> str:
    """Extract authenticated user from SSOwat-injected Basic Auth header."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Basic "):
        try:
            decoded = base64.b64decode(auth[6:]).decode("utf-8", errors="replace")
            username = decoded.split(":")[0]
            if username:
                return username
        except Exception:
            pass
    # Fallback for newer YunoHost
    user = request.headers.get("X-Remote-User", "")
    if user:
        return user
    raise HTTPException(status_code=401, detail="Unauthorized")
