from fastapi import APIRouter

router = APIRouter(prefix="/api")

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


@router.get("/providers")
def get_providers():
    return PROVIDERS
