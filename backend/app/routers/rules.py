from fastapi import APIRouter, Request
from pydantic import BaseModel
from ..auth import current_user

router = APIRouter(prefix="/api")


class RuleBody(BaseModel):
    text: str
    lang: str = "es"
    today: str = ""


@router.post("/build-rule-prompt")
def build_rule_prompt(body: RuleBody, request: Request):
    current_user(request)

    if body.lang == "en":
        prompt = f"""You are a scheduling assistant. Parse the following natural language scheduling rule and return ONLY a valid JSON object (no markdown, no code fences, no explanation — raw JSON only).

Today's date: {body.today}
User input: "{body.text}"

Return exactly this JSON structure (fill in the values):
{{
  "taskText": "brief task description in English",
  "recurrenceDesc": "human-readable schedule in English (e.g. 'On the 1st of every month')",
  "schedule": {{
    "type": "monthly",
    "interval": 1,
    "dayOfMonth": 1
  }},
  "nextTrigger": "YYYY-MM-DD"
}}

Rules:
- schedule.type: one of "daily", "weekly", "monthly", "yearly"
- schedule.interval: positive integer, default 1
- schedule.dayOfMonth: 1-31, only for "monthly" or "yearly"
- schedule.dayOfWeek: 0-6 (0=Sunday), only for "weekly"
- schedule.month: 1-12, only for "yearly"
- nextTrigger: first date >= today when this rule fires (may be today)

Return ONLY the JSON object, nothing else."""
    else:
        prompt = f"""Eres un asistente de planificación. Analiza la siguiente regla en lenguaje natural y devuelve ÚNICAMENTE un objeto JSON válido (sin markdown, sin bloques de código, sin explicación — solo el JSON en bruto).

Fecha actual: {body.today}
Entrada del usuario: "{body.text}"

Devuelve exactamente esta estructura JSON (rellena los valores):
{{
  "taskText": "descripción breve de la tarea en español",
  "recurrenceDesc": "descripción legible de la frecuencia en español (ej. 'El día 1 de cada mes')",
  "schedule": {{
    "type": "monthly",
    "interval": 1,
    "dayOfMonth": 1
  }},
  "nextTrigger": "YYYY-MM-DD"
}}

Reglas:
- schedule.type: uno de "daily", "weekly", "monthly", "yearly"
- schedule.interval: entero positivo, por defecto 1
- schedule.dayOfMonth: 1-31, solo para "monthly" o "yearly"
- schedule.dayOfWeek: 0-6 (0=Domingo), solo para "weekly"
- schedule.month: 1-12, solo para "yearly"
- nextTrigger: primera fecha >= hoy cuando se dispara esta regla (puede ser hoy)

Devuelve ÚNICAMENTE el objeto JSON, nada más."""

    return {"prompt": prompt}
