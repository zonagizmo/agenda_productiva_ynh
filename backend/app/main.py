import os
import json
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from .routers import storage, providers, prompt
from .version import get_version_info

PATH_PREFIX = os.environ.get("APP_PATH", "").rstrip("/")
DIST_DIR    = Path(__file__).parent.parent.parent / "sources" / "dist"

app = FastAPI(docs_url=None, redoc_url=None)

# ── API routers ────────────────────────────────────────────
app.include_router(storage.router)
app.include_router(providers.router)
app.include_router(prompt.router)


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
    # API and manifest routes are already handled above
    index = DIST_DIR / "index.html"
    if index.exists():
        return FileResponse(index)
    return Response("App not built", status_code=503)
