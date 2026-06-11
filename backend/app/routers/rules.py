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
  "recurrenceDesc": "human-readable schedule in English (e.g. 'First working day of every month')",
  "section": "tareas",
  "schedule": {{
    "type": "monthly",
    "interval": 1,
    "dayOfMonth": 1,
    "workingDay": false
  }},
  "nextTrigger": "YYYY-MM-DD"
}}

Rules:
- section: one of "objetivos" (long-term goal or personal target), "tareas" (specific action item to do), "reuniones" (meeting, call, appointment, interview, sync), "plazos" (deadline, submission, delivery, expiry, due date, "send", "submit", "hand in"). Pick the one that best fits the user's text. Default to "tareas" when unsure.
- schedule.type: one of "daily", "weekly", "monthly", "yearly", "once". Use "once" when the user mentions a specific date or one-time event (e.g. "remind me on July 15th", "notify me next Monday"). Use recurring types only when there is a clear repeating pattern.
- schedule.interval: time BETWEEN occurrences (e.g. "every 2 months" → 2). NEVER use it for counts like "next 12 months" — the rule always repeats indefinitely. For "once", set interval to 1.
- schedule.dayOfMonth: 1-31, only for "monthly" or "yearly". "first" or "1st" → 1; "last" → 28; "15th" → 15. IMPORTANT: do NOT derive this number from duration phrases like "next 12 months".
- schedule.dayOfWeek: 0-6 (0=Sunday), only for "weekly"
- schedule.month: 1-12, only for "yearly"
- schedule.workingDay: true if the user mentions "working day", "business day", "weekday", or similar. When true, the trigger date is automatically shifted to Monday if it falls on Saturday or Sunday.
- Phrases like "for the next N months", "over the next N years", "during the next N weeks" describe a duration the user has in mind but do NOT change the schedule — ignore them entirely.
- nextTrigger: first date >= today when this rule fires. If workingDay is true, the nextTrigger must already be a Monday-Friday date.

Return ONLY the JSON object, nothing else."""
    else:
        prompt = f"""Eres un asistente de planificación. Analiza la siguiente regla en lenguaje natural y devuelve ÚNICAMENTE un objeto JSON válido (sin markdown, sin bloques de código, sin explicación — solo el JSON en bruto).

Fecha actual: {body.today}
Entrada del usuario: "{body.text}"

Devuelve exactamente esta estructura JSON (rellena los valores):
{{
  "taskText": "descripción breve de la tarea en español",
  "recurrenceDesc": "descripción legible de la frecuencia en español (ej. 'Primer día laborable de cada mes')",
  "section": "tareas",
  "schedule": {{
    "type": "monthly",
    "interval": 1,
    "dayOfMonth": 1,
    "workingDay": false
  }},
  "nextTrigger": "YYYY-MM-DD"
}}

Reglas:
- section: uno de "objetivos" (meta a largo plazo o logro personal), "tareas" (acción concreta a realizar), "reuniones" (reunión, llamada, cita, entrevista, videoconferencia), "plazos" (entrega, vencimiento, fecha límite, envío de documentos, "enviar", "entregar", "presentar"). Elige el que mejor encaje con el texto del usuario. Por defecto usa "tareas" si no está claro.
- schedule.type: uno de "daily", "weekly", "monthly", "yearly", "once". Usa "once" cuando el usuario mencione una fecha concreta o un evento puntual (ej. "avísame el 15 de julio", "recuérdame el próximo lunes"). Usa los tipos periódicos solo cuando haya un patrón de repetición claro.
- schedule.interval: tiempo ENTRE ocurrencias (ej. "cada 2 meses" → 2). NUNCA uses este campo para contar ocurrencias como "próximos 12 meses" — la regla se repite indefinidamente. Para "once", pon interval a 1.
- schedule.dayOfMonth: 1-31, solo para "monthly" o "yearly". "primer día" o "primero" → 1; "último día" → 28; "día 15" o "quince" → 15. IMPORTANTE: NO derives este número de frases de duración como "próximos 12 meses".
- schedule.dayOfWeek: 0-6 (0=Domingo), solo para "weekly"
- schedule.month: 1-12, solo para "yearly"
- schedule.workingDay: true si el usuario menciona "día laborable", "día hábil", "entre semana" o similar. Cuando es true, la fecha de disparo se desplaza automáticamente al lunes siguiente si cae en sábado o domingo.
- Frases como "en los próximos N meses", "durante los próximos N años", "en los próximos N semanas" describen una duración que el usuario tiene en mente pero NO modifican el schedule — ignóralas por completo.
- nextTrigger: primera fecha >= hoy cuando se dispara esta regla. Si workingDay es true, el nextTrigger ya debe ser un día de lunes a viernes.

Devuelve ÚNICAMENTE el objeto JSON, nada más."""

    return {"prompt": prompt}
