from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Any
from ..auth import current_user

router = APIRouter(prefix="/api")


class PromptBody(BaseModel):
    lang: str = "es"
    fecha_larga: str = ""
    jornada_inicio: str = "09:00"
    jornada_fin: str = "18:00"
    pausa_comida: bool = True
    pausa_inicio: str = "14:00"
    pausa_fin: str = "15:00"
    notas_extra: str = ""
    tareas_persistentes: list[dict[str, Any]] = []
    objetivos: list[dict[str, Any]] = []
    tareas: list[dict[str, Any]] = []
    reuniones: list[dict[str, Any]] = []
    plazos: list[dict[str, Any]] = []


def _fmt(icon: str, label: str, items: list[dict]) -> str | None:
    filled = [x for x in items if x.get("texto", "").strip()]
    if not filled:
        return None
    lines = "\n".join(
        f"  {i + 1}. {x['texto']}"
        + (f" [⚠️ {len(x['avisos'])} aviso(s)]" if x.get("avisos") else "")
        for i, x in enumerate(filled)
    )
    return f"{icon} {label}:\n{lines}"


@router.post("/build-prompt")
def build_prompt(body: PromptBody, request: Request):
    current_user(request)
    lang = body.lang

    if lang == "en":
        secs = [
            _fmt("🎯", "Today's Goals",  body.objetivos),
            _fmt("✅", "Pending Tasks",   body.tareas),
            _fmt("🗓️", "Meetings",        body.reuniones),
            _fmt("⏰", "Deadlines",       body.plazos),
        ]
    else:
        secs = [
            _fmt("🎯", "Objetivos del día", body.objetivos),
            _fmt("✅", "Tareas pendientes",  body.tareas),
            _fmt("🗓️", "Reuniones",          body.reuniones),
            _fmt("⏰", "Plazos y entregas",  body.plazos),
        ]

    blocks = "\n\n".join(s for s in secs if s)
    if not blocks.strip():
        return {"error": "no_content"}

    # Persistent backlog tasks
    tp_filled = [t for t in body.tareas_persistentes if t.get("texto", "").strip()]
    if tp_filled:
        dots = {"alta": "🔴", "media": "🟡", "baja": "🟢"}
        lines = []
        for t in tp_filled:
            dot   = dots.get(t.get("prioridad", ""), "•")
            text  = t["texto"]
            due   = t.get("dueDate", "")
            lbls  = t.get("label_names", [])
            extra = (f" [📅 {due}]" if due else "") + (f" [{', '.join(lbls)}]" if lbls else "")
            lines.append(f"  {dot} {text}{extra}")
        label_bp = "🔖 Pending backlog tasks" if lang == "en" else "🔖 Tareas pendientes (backlog)"
        blocks += "\n\n" + label_bp + ":\n" + "\n".join(lines)

    pausa_info = (
        (f"Lunch break: {body.pausa_inicio}–{body.pausa_fin}." if lang == "en"
         else f"Pausa para comer: {body.pausa_inicio}–{body.pausa_fin}.")
        if body.pausa_comida else
        ("No lunch break." if lang == "en" else "Sin pausa para comer.")
    )
    notes = body.notas_extra
    fi, ff = body.jornada_inicio, body.jornada_fin
    pi, pf = body.pausa_inicio, body.pausa_fin
    fl = body.fecha_larga

    if lang == "en":
        prompt = f"""You are an expert executive productivity coach.

Date: {fl}
Work schedule: {fi} to {ff}. {pausa_info}
{("Additional instructions: " + notes) if notes else ""}

{blocks}

Generate in English, strictly respecting the work schedule:

## DAY PLAN WITH SCHEDULE
Time blocks within {fi}–{ff}{f" (lunch {pi}–{pf})" if body.pausa_comida else ""}. Format "HH:MM — Activity".

## PRIORITIZED TASK LIST
🔴 Urgent/Important, 🟡 Important, 🟢 Can wait.

## TIP OF THE DAY
Brief, motivating, actionable."""
    else:
        prompt = f"""Actúa como un coach ejecutivo de productividad experto.

Fecha: {fl}
Horario de jornada: {fi} a {ff}. {pausa_info}
{("Instrucciones adicionales: " + notes) if notes else ""}

{blocks}

Genera en español respetando estrictamente el horario:

## PLAN DEL DÍA CON HORARIOS
Bloques dentro de {fi}–{ff}{f" (pausa {pi}–{pf})" if body.pausa_comida else ""}. Formato "HH:MM — Actividad".

## LISTA PRIORIZADA DE TAREAS
🔴 Urgente/Importante, 🟡 Importante, 🟢 Puede esperar.

## CONSEJO DEL DÍA
Breve, motivador, accionable."""

    return {"prompt": prompt}
