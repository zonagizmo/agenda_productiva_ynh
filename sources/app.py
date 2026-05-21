import os
from flask import Flask, jsonify, request, render_template, abort
from database import init_db, get_value, set_value, delete_value
from version import get_version_info, VERSION_LABEL

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", os.urandom(32))

PATH_PREFIX = os.environ.get("APP_PATH", "").rstrip("/")

# ── Autenticación SSO ──────────────────────────────────────
def current_user() -> str:
    """Lee el usuario autenticado desde el header que inyecta SSOwat de YunoHost."""
    user = request.headers.get("X-Remote-User")
    if not user:
        abort(401)
    return user


@app.before_request
def ensure_user_db():
    """Crea la BD SQLite del usuario la primera vez que accede."""
    if request.endpoint and request.endpoint != "static":
        user = request.headers.get("X-Remote-User")
        if user:
            init_db(user)


# ── AI Providers ──────────────────────────────────────────
PROVIDERS = {
    "anthropic": {
        "name": "Anthropic (Claude)",
        "free": False,
        "url": "https://api.anthropic.com/v1/messages",
        "models": ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-opus-4-7"],
        "default_model": "claude-haiku-4-5-20251001",
        "key_url": "https://console.anthropic.com",
        "key_hint": "sk-ant-...",
        "mode": "anthropic",
    },
    "groq": {
        "name": "Groq (Gratis)",
        "free": True,
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "models": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
        "default_model": "llama-3.3-70b-versatile",
        "key_url": "https://console.groq.com",
        "key_hint": "gsk_...",
        "mode": "openai",
    },
    "gemini": {
        "name": "Google Gemini (Gratis)",
        "free": True,
        "url": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        "models": ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
        "default_model": "gemini-2.0-flash",
        "key_url": "https://aistudio.google.com/apikey",
        "key_hint": "AIza...",
        "mode": "openai",
    },
    "openai": {
        "name": "OpenAI (ChatGPT)",
        "free": False,
        "url": "https://api.openai.com/v1/chat/completions",
        "models": ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
        "default_model": "gpt-4o-mini",
        "key_url": "https://platform.openai.com/api-keys",
        "key_hint": "sk-...",
        "mode": "openai",
    },
    "openrouter": {
        "name": "OpenRouter (Gratis)",
        "free": True,
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "models": [
            "meta-llama/llama-3.3-70b-instruct:free",
            "mistralai/mistral-7b-instruct:free",
            "google/gemma-2-9b-it:free",
        ],
        "default_model": "meta-llama/llama-3.3-70b-instruct:free",
        "key_url": "https://openrouter.ai/keys",
        "key_hint": "sk-or-...",
        "mode": "openai",
    },
}

# ── Routes ────────────────────────────────────────────────
@app.route("/")
def index():
    current_user()
    return render_template("index.html", version=VERSION_LABEL, path_prefix=PATH_PREFIX)


@app.route("/api/version")
def version():
    return jsonify(get_version_info())


@app.route("/api/providers", methods=["GET"])
def get_providers():
    return jsonify(PROVIDERS)


# Storage — aislado por usuario
@app.route("/api/storage/<key>", methods=["GET"])
def storage_get(key):
    user = current_user()
    return jsonify({"value": get_value(user, key)})


@app.route("/api/storage/<key>", methods=["POST"])
def storage_set(key):
    user = current_user()
    data = request.get_json()
    if data is None or "value" not in data:
        return jsonify({"error": "Missing 'value'"}), 400
    set_value(user, key, data["value"])
    return jsonify({"ok": True})


@app.route("/api/storage/<key>", methods=["DELETE"])
def storage_delete(key):
    user = current_user()
    delete_value(user, key)
    return jsonify({"ok": True})


# Build prompt — Flask construye el prompt, el navegador llama a la IA
@app.route("/api/build-prompt", methods=["POST"])
def build_prompt():
    current_user()
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data"}), 400

    lang           = data.get("lang", "es")
    fecha_larga    = data.get("fecha_larga", "")
    jornada_inicio = data.get("jornada_inicio", "09:00")
    jornada_fin    = data.get("jornada_fin", "18:00")
    pausa_comida   = data.get("pausa_comida", True)
    pausa_inicio   = data.get("pausa_inicio", "14:00")
    pausa_fin      = data.get("pausa_fin", "15:00")
    notas_extra    = data.get("notas_extra", "")

    def fmt(icon, label, items):
        filled = [x for x in items if x.get("texto", "").strip()]
        if not filled:
            return None
        lines = "\n".join(
            f"  {i+1}. {x['texto']}"
            + (f" [⚠️ {len(x['avisos'])} aviso(s)]" if x.get("avisos") else "")
            for i, x in enumerate(filled)
        )
        return f"{icon} {label}:\n{lines}"

    if lang == "en":
        secs = [
            fmt("🎯", "Today's Goals",  data.get("objetivos", [])),
            fmt("✅", "Pending Tasks",   data.get("tareas", [])),
            fmt("🗓️", "Meetings",        data.get("reuniones", [])),
            fmt("⏰", "Deadlines",       data.get("plazos", [])),
        ]
    else:
        secs = [
            fmt("🎯", "Objetivos del día", data.get("objetivos", [])),
            fmt("✅", "Tareas pendientes",  data.get("tareas", [])),
            fmt("🗓️", "Reuniones",          data.get("reuniones", [])),
            fmt("⏰", "Plazos y entregas",  data.get("plazos", [])),
        ]

    blocks = "\n\n".join(s for s in secs if s)
    if not blocks.strip():
        return jsonify({"error": "no_content"}), 400

    pausa_info = (
        (f"Lunch break: {pausa_inicio}–{pausa_fin}." if lang == "en"
         else f"Pausa para comer: {pausa_inicio}–{pausa_fin}.")
        if pausa_comida else
        ("No lunch break." if lang == "en" else "Sin pausa para comer.")
    )

    if lang == "en":
        prompt = f"""You are an expert executive productivity coach.

Date: {fecha_larga}
Work schedule: {jornada_inicio} to {jornada_fin}. {pausa_info}
{("Additional instructions: " + notas_extra) if notas_extra else ""}

{blocks}

Generate in English, strictly respecting the work schedule:

## DAY PLAN WITH SCHEDULE
Time blocks within {jornada_inicio}–{jornada_fin}{f" (lunch {pausa_inicio}–{pausa_fin})" if pausa_comida else ""}. Format "HH:MM — Activity".

## PRIORITIZED TASK LIST
🔴 Urgent/Important, 🟡 Important, 🟢 Can wait.

## TIP OF THE DAY
Brief, motivating, actionable."""
    else:
        prompt = f"""Actúa como un coach ejecutivo de productividad experto.

Fecha: {fecha_larga}
Horario de jornada: {jornada_inicio} a {jornada_fin}. {pausa_info}
{("Instrucciones adicionales: " + notas_extra) if notas_extra else ""}

{blocks}

Genera en español respetando estrictamente el horario:

## PLAN DEL DÍA CON HORARIOS
Bloques dentro de {jornada_inicio}–{jornada_fin}{f" (pausa {pausa_inicio}–{pausa_fin})" if pausa_comida else ""}. Formato "HH:MM — Actividad".

## LISTA PRIORIZADA DE TAREAS
🔴 Urgente/Importante, 🟡 Importante, 🟢 Puede esperar.

## CONSEJO DEL DÍA
Breve, motivador, accionable."""

    return jsonify({"prompt": prompt})
