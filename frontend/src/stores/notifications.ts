import { defineStore } from 'pinia'
import { computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { useAgendaStore } from './agenda'
import { useTasksStore } from './tasks'
import { useUiStore } from './ui'
import { LANG } from '@/i18n'
import type { Lang } from '@/types'

const CHANNEL_ID = 'agenda-avisos'

// ── Helpers ───────────────────────────────────────────────

function loadFiredSet(): Set<string> {
  try {
    const raw = sessionStorage.getItem('notifFired')
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch { return new Set() }
}

function persistFiredSet(set: Set<string>) {
  try { sessionStorage.setItem('notifFired', JSON.stringify([...set])) } catch {}
}

// UUID → positive 32-bit int for LocalNotifications IDs
function hashId(str: string): number {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = (((h << 5) + h) ^ str.charCodeAt(i)) >>> 0
  return h >>> 0
}

// ── Store ─────────────────────────────────────────────────

export const useNotifStore = defineStore('notif', () => {
  const firedSet = loadFiredSet()

  const perm = computed(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  // ── Permission ────────────────────────────────────────

  async function request() {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.requestPermissions()
    } else if (typeof Notification !== 'undefined') {
      await Notification.requestPermission()
    }
  }

  // ── Native setup (canal + listener de tap) ────────────

  async function setupNative(lang: Lang) {
    if (!Capacitor.isNativePlatform()) return
    try {
      await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: lang === 'es' ? 'Avisos de agenda' : 'Agenda alerts',
        description: lang === 'es' ? 'Notificaciones de avisos configurados' : 'Configured agenda alerts',
        importance: 4,
        vibration: true,
        visibility: 1,
      })
    } catch {}

    // Cuando el usuario toca la notificación → navegar al día correcto
    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      const extra = action.notification.extra as { dateKey?: string } | null
      if (extra?.dateKey) {
        const agenda = useAgendaStore()
        const ui     = useUiStore()
        agenda.selDate = extra.dateKey
        ui.tab = 'agenda'
      }
    })

    // Programar todos los avisos pendientes al arrancar
    await scheduleNative(lang)
  }

  // ── Programar notificaciones nativas ──────────────────

  async function scheduleNative(lang: Lang) {
    if (!Capacitor.isNativePlatform()) return
    try {
      const permStatus = await LocalNotifications.checkPermissions()
      if (permStatus.display !== 'granted') return
    } catch { return }

    const T      = LANG[lang]
    const agenda = useAgendaStore()
    const tasks  = useTasksStore()
    const now    = new Date()

    // Cancelar todas las notificaciones pendientes antes de reprogramar
    try {
      const pending = await LocalNotifications.getPending()
      if (pending.notifications.length) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map(n => ({ id: n.id })),
        })
      }
    } catch {}

    const toSchedule: Parameters<typeof LocalNotifications.schedule>[0]['notifications'] = []

    // Avisos de agenda
    for (const [dateKey, day] of Object.entries(agenda.data)) {
      for (const sec of T.sections) {
        for (const item of (day[sec.key] ?? [])) {
          for (const av of item.avisos ?? []) {
            if (!av.texto || av.fired) continue
            const dt = new Date(`${av.fecha}T${av.hora}:00`)
            if (dt <= now) continue
            const dot = T.priors.find(p => p.key === av.prioridad)?.dot ?? '🔔'
            toSchedule.push({
              id:        hashId(av.id),
              title:     `${dot} ${sec.icon} ${sec.label}`,
              body:      av.texto + (item.texto ? `\n📌 ${item.texto}` : ''),
              schedule:  { at: dt, allowWhileIdle: true },
              channelId: CHANNEL_ID,
              extra:     { avisoId: av.id, dateKey },
            })
          }
        }
      }
    }

    // Avisos de tareas
    for (const task of tasks.tasks) {
      for (const av of task.avisos ?? []) {
        if (!av.texto || av.fired) continue
        const dt = new Date(`${av.fecha}T${av.hora}:00`)
        if (dt <= now) continue
        const dot   = T.priors.find(p => p.key === av.prioridad)?.dot ?? '🔔'
        const label = lang === 'es' ? 'Tarea' : 'Task'
        toSchedule.push({
          id:        hashId(av.id),
          title:     `${dot} 📋 ${label}`,
          body:      av.texto + (task.texto ? ` · ${task.texto}` : ''),
          schedule:  { at: dt, allowWhileIdle: true },
          channelId: CHANNEL_ID,
          extra:     { avisoId: av.id, dateKey: '' },
        })
      }
    }

    if (toSchedule.length) {
      try { await LocalNotifications.schedule({ notifications: toSchedule }) } catch {}
    }
  }

  // ── Web notifications (polling cada 60s) ──────────────

  function check(lang: Lang) {
    // En nativo las notificaciones ya están programadas a nivel OS
    if (Capacitor.isNativePlatform()) return
    if (perm.value !== 'granted') return

    const T     = LANG[lang]
    const now   = new Date()
    const win   = 2 * 60 * 1000

    const agenda = useAgendaStore()
    const tasks  = useTasksStore()

    for (const [, day] of Object.entries(agenda.data)) {
      for (const sec of T.sections) {
        for (const item of (day[sec.key] ?? [])) {
          for (const av of item.avisos ?? []) {
            if (!av.texto || av.fired || firedSet.has(av.id)) continue
            const dt = new Date(`${av.fecha}T${av.hora}:00`)
            const diff = now.getTime() - dt.getTime()
            if (diff >= 0 && diff < win) {
              firedSet.add(av.id)
              persistFiredSet(firedSet)
              av.fired = true
              agenda.save()
              const dot = T.priors.find(p => p.key === av.prioridad)?.dot ?? '🔔'
              try { new Notification(`${dot} ${sec.icon} ${sec.label} — ${T.aviso}`, { body: `${av.texto}${item.texto ? '\n📌 ' + item.texto : ''}`, tag: av.id }) } catch {}
            }
          }
        }
      }
    }

    for (const task of tasks.tasks) {
      for (const av of task.avisos ?? []) {
        if (!av.texto || av.fired || firedSet.has(av.id)) continue
        const dt   = new Date(`${av.fecha}T${av.hora}:00`)
        const diff = now.getTime() - dt.getTime()
        if (diff >= 0 && diff < win) {
          firedSet.add(av.id)
          persistFiredSet(firedSet)
          av.fired = true
          tasks.saveTasks()
          const dot   = T.priors.find(p => p.key === av.prioridad)?.dot ?? '🔔'
          const label = lang === 'es' ? 'Tarea' : 'Task'
          try { new Notification(`${dot} 📋 ${label} — ${T.aviso}`, { body: `${av.texto}${task.texto ? ' · ' + task.texto : ''}`, tag: av.id }) } catch {}
        }
      }
    }
  }

  function collectAll(lang: Lang) {
    const T      = LANG[lang]
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

  return { perm, request, check, collectAll, setupNative, scheduleNative }
})
