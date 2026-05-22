import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import { uid, todayKey } from '@/composables/useDate'
import type { Task, Label, Aviso, Priority, Recurrence, RecurrenceType } from '@/types'

export const LABEL_COLORS = ['#4d96ff','#c77dff','#6bcb77','#ffd93d','#ff6b6b','#ff9f43']

function newAviso(): Aviso {
  return { id: uid(), texto: '', fecha: todayKey(), hora: '09:00', prioridad: 'media', fired: false }
}

// ── Recurrence helpers (exported for use in components) ────

export function addInterval(dateStr: string, rec: Recurrence, sign: 1 | -1): string {
  const d   = new Date(dateStr + 'T12:00:00')
  const n   = (rec.interval ?? 1) * sign
  const [, sm, sd] = rec.startDate.split('-')
  const startDay   = parseInt(sd)

  switch (rec.type) {
    case 'daily':
      d.setDate(d.getDate() + n)
      break
    case 'weekly':
      d.setDate(d.getDate() + 7 * n)
      break
    case 'monthly': {
      d.setMonth(d.getMonth() + n)
      const max = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      d.setDate(Math.min(startDay, max))
      break
    }
    case 'yearly': {
      d.setFullYear(d.getFullYear() + n)
      d.setMonth(parseInt(sm) - 1)
      const max = new Date(d.getFullYear(), parseInt(sm), 0).getDate()
      d.setDate(Math.min(startDay, max))
      break
    }
  }
  return d.toISOString().slice(0, 10)
}

export function recurrenceCurrentDue(task: Task): string | null {
  const rec = task.recurrence
  if (!rec) return null
  if (!rec.lastCompleted) return rec.startDate
  return addInterval(rec.lastCompleted, rec, 1)
}

export function isRecurringDue(task: Task, asOf = todayKey()): boolean {
  const rec = task.recurrence
  if (!rec || task.done) return false
  if (asOf < rec.startDate) return false
  if (rec.endDate && asOf > rec.endDate) return false
  const due = recurrenceCurrentDue(task)
  return !!due && asOf >= due
}

export function isRecurringExpired(task: Task): boolean {
  const rec = task.recurrence
  if (!rec || !rec.endDate) return false
  return todayKey() > rec.endDate
}

export function newRecurrence(type: RecurrenceType): Recurrence {
  return { type, interval: 1, startDate: todayKey(), endDate: '', lastCompleted: '' }
}

// ─────────────────────────────────────────────────────────

export const useTasksStore = defineStore('tasks', () => {
  const tasks  = ref<Task[]>([])
  const labels = ref<Label[]>([])

  function getLabelById(id: string) { return labels.value.find(l => l.id === id) }

  function newTask(): Task {
    return {
      id: uid(), texto: '', done: false, prioridad: 'media',
      dueDate: '', labels: [], avisos: [], createdAt: new Date().toISOString(),
      recurrence: null,
    }
  }

  function newLabel(nombre = '', color = '#4d96ff'): Label {
    return { id: uid(), nombre, color }
  }

  function isOverdue(t: Task)  { return !!t.dueDate && !t.done && t.dueDate < todayKey() }
  function isTodayDue(t: Task) { return t.dueDate === todayKey() }

  function sortPending(list: Task[]): Task[] {
    const prioOrder: Record<Priority, number> = { alta: 0, media: 1, baja: 2 }

    function group(t: Task): [number, string] {
      const today = todayKey()
      if (isOverdue(t))           return [0, t.dueDate]
      if (isRecurringDue(t))      return [1, recurrenceCurrentDue(t) || today]
      if (isTodayDue(t))          return [2, today]
      if (t.dueDate)              return [3, t.dueDate]
      if (t.recurrence && !t.done) return [5, recurrenceCurrentDue(t) || '9999-99-99']
      return [4, '']
    }

    return [...list].sort((a, b) => {
      const [ag, ad] = group(a)
      const [bg, bd] = group(b)
      if (ag !== bg) return ag - bg
      if (ad !== bd) return ad.localeCompare(bd)
      return prioOrder[a.prioridad] - prioOrder[b.prioridad]
    })
  }

  async function load() {
    const t = await api.storage.get('tasks-v1')
    if (t.value) {
      const parsed = JSON.parse(t.value) as Task[]
      tasks.value = parsed.map(t => ({
        ...t,
        recurrence: t.recurrence ? { ...t.recurrence, interval: t.recurrence.interval ?? 1 } : null,
      }))
    }
    const l = await api.storage.get('labels-v1')
    if (l.value) labels.value = JSON.parse(l.value) as Label[]
    checkAndResetRecurring()
  }

  async function saveTasks()  { await api.storage.set('tasks-v1',  tasks.value) }
  async function saveLabels() { await api.storage.set('labels-v1', labels.value) }

  function addTask() {
    const t = newTask()
    tasks.value.unshift(t)
    saveTasks()
    return t.id
  }

  function removeTask(id: string) {
    tasks.value = tasks.value.filter(t => t.id !== id)
    saveTasks()
  }

  function toggleDone(id: string) {
    const t = tasks.value.find(t => t.id === id)
    if (!t) return

    if (t.recurrence) {
      const rec = t.recurrence
      if (!t.done) {
        rec.lastCompleted = todayKey()
        t.done = true
      } else {
        if (rec.lastCompleted) {
          const prev = addInterval(rec.lastCompleted, rec, -1)
          rec.lastCompleted = prev < rec.startDate ? '' : prev
        }
        t.done = false
      }
    } else {
      t.done = !t.done
    }
    saveTasks()
  }

  function checkAndResetRecurring() {
    let changed = false
    for (const t of tasks.value) {
      if (!t.recurrence || !t.done) continue
      const rec = t.recurrence
      const base = rec.lastCompleted || rec.startDate
      const nextCycle = addInterval(base, rec, 1)
      if (todayKey() >= nextCycle) {
        t.done = false
        changed = true
      }
    }
    if (changed) saveTasks()
  }

  function addLabel(nombre: string, color: string) {
    labels.value.push(newLabel(nombre, color))
    saveLabels()
  }

  function removeLabel(id: string) {
    labels.value = labels.value.filter(l => l.id !== id)
    tasks.value.forEach(t => { t.labels = t.labels.filter(lid => lid !== id) })
    saveLabels(); saveTasks()
  }

  function pendingForAi(selDate: string) {
    const mapTask = (t: Task) => ({
      texto: t.texto,
      prioridad: t.prioridad,
      dueDate: t.dueDate || (t.recurrence ? (recurrenceCurrentDue(t) || '') : ''),
      label_names: t.labels.map(lid => getLabelById(lid)?.nombre ?? '').filter(Boolean),
    })
    const pending = tasks.value.filter(t => !t.done && t.texto.trim())

    // Tareas para ese día: recurrentes vencidas en selDate + dueDate <= selDate
    const hoy = pending.filter(t =>
      t.recurrence
        ? isRecurringDue(t, selDate)
        : (!!t.dueDate && t.dueDate <= selDate),
    ).map(mapTask)

    // Backlog: sin recurrencia y sin fecha o fecha posterior a selDate
    const backlog = pending.filter(t =>
      !t.recurrence && (!t.dueDate || t.dueDate > selDate),
    ).map(mapTask)

    return { hoy, backlog }
  }

  return {
    tasks, labels, getLabelById, isOverdue, isTodayDue, sortPending,
    load, saveTasks, saveLabels, addTask, removeTask, toggleDone,
    addLabel, removeLabel, pendingForAi, newAviso, checkAndResetRecurring,
  }
})
