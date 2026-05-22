import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import { uid, todayKey } from '@/composables/useDate'
import type { Task, Label, Aviso, Priority } from '@/types'

export const LABEL_COLORS = ['#4d96ff','#c77dff','#6bcb77','#ffd93d','#ff6b6b','#ff9f43']

function newAviso(): Aviso {
  return { id: uid(), texto: '', fecha: todayKey(), hora: '09:00', prioridad: 'media', fired: false }
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks  = ref<Task[]>([])
  const labels = ref<Label[]>([])

  function getLabelById(id: string) { return labels.value.find(l => l.id === id) }

  function newTask(): Task {
    return { id: uid(), texto: '', done: false, prioridad: 'media', dueDate: '', labels: [], avisos: [], createdAt: new Date().toISOString() }
  }

  function newLabel(nombre = '', color = '#4d96ff'): Label {
    return { id: uid(), nombre, color }
  }

  function isOverdue(t: Task) { return !!t.dueDate && !t.done && t.dueDate < todayKey() }
  function isTodayDue(t: Task){ return t.dueDate === todayKey() }

  function sortPending(list: Task[]): Task[] {
    const prioOrder: Record<Priority, number> = { alta: 0, media: 1, baja: 2 }
    return [...list].sort((a, b) => {
      const ao = isOverdue(a), bo = isOverdue(b)
      if (ao !== bo) return ao ? -1 : 1
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return prioOrder[a.prioridad] - prioOrder[b.prioridad]
    })
  }

  async function load() {
    const t = await api.storage.get('tasks-v1')
    if (t.value) tasks.value = JSON.parse(t.value) as Task[]
    const l = await api.storage.get('labels-v1')
    if (l.value) labels.value = JSON.parse(l.value) as Label[]
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
    if (t) { t.done = !t.done; saveTasks() }
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

  function pendingForAi() {
    return tasks.value
      .filter(t => !t.done && t.texto.trim())
      .map(t => ({
        texto: t.texto,
        prioridad: t.prioridad,
        dueDate: t.dueDate,
        label_names: t.labels.map(lid => getLabelById(lid)?.nombre ?? '').filter(Boolean),
      }))
  }

  return { tasks, labels, getLabelById, isOverdue, isTodayDue, sortPending, load, saveTasks, saveLabels, addTask, removeTask, toggleDone, addLabel, removeLabel, pendingForAi, newAviso }
})
