import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAgendaStore } from './agenda'
import { useTasksStore } from './tasks'
import { LANG } from '@/i18n'
import type { Lang } from '@/types'

export const useNotifStore = defineStore('notif', () => {
  const firedSet = new Set<string>()

  const perm = computed(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  async function request() {
    if (typeof Notification === 'undefined') return
    await Notification.requestPermission()
  }

  function check(lang: Lang) {
    if (perm.value !== 'granted') return
    const T = LANG[lang]
    const now = new Date()
    const win = 2 * 60 * 1000

    const agenda = useAgendaStore()
    const tasks  = useTasksStore()

    // Check agenda avisos
    for (const [, day] of Object.entries(agenda.data)) {
      for (const sec of T.sections) {
        for (const item of (day[sec.key] ?? [])) {
          for (const av of item.avisos ?? []) {
            if (!av.texto || av.fired || firedSet.has(av.id)) continue
            const dt = new Date(`${av.fecha}T${av.hora}:00`)
            if (now.getTime() - dt.getTime() >= 0 && now.getTime() - dt.getTime() < win) {
              firedSet.add(av.id)
              const dot = T.priors.find(p => p.key === av.prioridad)?.dot ?? '🔔'
              try { new Notification(`${dot} ${sec.icon} ${sec.label} — ${T.aviso}`, { body: `${av.texto}${item.texto ? '\n📌 ' + item.texto : ''}`, tag: av.id }) } catch {}
              av.fired = true
              agenda.save()
            }
          }
        }
      }
    }

    // Check task avisos
    for (const task of tasks.tasks) {
      for (const av of task.avisos ?? []) {
        if (!av.texto || av.fired || firedSet.has(av.id)) continue
        const dt = new Date(`${av.fecha}T${av.hora}:00`)
        if (now.getTime() - dt.getTime() >= 0 && now.getTime() - dt.getTime() < win) {
          firedSet.add(av.id)
          const dot = T.priors.find(p => p.key === av.prioridad)?.dot ?? '🔔'
          try { new Notification(`${dot} 📋 ${lang === 'es' ? 'Tarea' : 'Task'} — ${T.aviso}`, { body: `${av.texto}${task.texto ? ' · ' + task.texto : ''}`, tag: av.id }) } catch {}
          av.fired = true
          tasks.saveTasks()
        }
      }
    }
  }

  function collectAll(lang: Lang) {
    const T = LANG[lang]
    const agenda = useAgendaStore()
    const tasks  = useTasksStore()
    const list: { id: string; texto: string; fecha: string; hora: string; prioridad: string; fired: boolean; icon: string; label: string; itemTexto: string; dateKey: string; dt: Date }[] = []

    for (const [dk, day] of Object.entries(agenda.data)) {
      for (const sec of T.sections) {
        for (const item of (day[sec.key] ?? [])) {
          for (const av of item.avisos ?? []) {
            if (!av.texto) continue
            list.push({ ...av, icon: sec.icon, label: sec.label, itemTexto: item.texto, dateKey: dk, dt: new Date(`${av.fecha}T${av.hora}:00`) })
          }
        }
      }
    }
    for (const task of tasks.tasks) {
      for (const av of task.avisos ?? []) {
        if (!av.texto) continue
        list.push({ ...av, icon: '📋', label: lang === 'es' ? 'Tarea' : 'Task', itemTexto: task.texto, dateKey: '', dt: new Date(`${av.fecha}T${av.hora}:00`) })
      }
    }
    return list.sort((a, b) => a.dt.getTime() - b.dt.getTime())
  }

  return { perm, request, check, collectAll }
})
