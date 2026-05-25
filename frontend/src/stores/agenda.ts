import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/client'
import { uid, todayKey } from '@/composables/useDate'
import type { DayData, AgendaItem, Aviso } from '@/types'

function newAviso(): Aviso {
  return { id: uid(), texto: '', fecha: todayKey(), hora: '09:00', prioridad: 'media', fired: false }
}

function newItem(texto = ''): AgendaItem {
  return { id: uid(), texto, avisos: [] }
}

function emptyDay(): DayData {
  return {
    objetivos: [newItem()], tareas: [newItem()],
    reuniones: [newItem()], plazos: [newItem()],
    plan: null, generatedAt: null,
  }
}

function migrateDay(raw: Partial<DayData> | null): DayData {
  if (!raw) return emptyDay()
  const out: DayData = { plan: raw.plan ?? null, generatedAt: raw.generatedAt ?? null, objetivos: [], tareas: [], reuniones: [], plazos: [] }
  for (const k of ['objetivos','tareas','reuniones','plazos'] as const) {
    const items = raw[k]
    if (!items?.length) { out[k] = [newItem()]; continue }
    out[k] = items.map(x => typeof x === 'string' ? newItem(x) : ({ ...newItem((x as AgendaItem).texto ?? ''), ...(x as AgendaItem) }))
  }
  return out
}

export const useAgendaStore = defineStore('agenda', () => {
  const data    = ref<Record<string, DayData>>({})
  const selDate = ref(todayKey())
  const calCursor = ref({ y: new Date().getFullYear(), m: new Date().getMonth() })

  const day = computed(() => data.value[selDate.value] ?? emptyDay())

  function ensureDay() {
    if (!data.value[selDate.value]) {
      // Preservar los items que el usuario haya escrito en el fallback emptyDay()
      // antes de que se cree la entrada real en data.value.
      // day.value devuelve el valor cacheado (sin recomputar) porque ninguna
      // dependencia reactiva ha cambiado todavía.
      const cur = day.value
      data.value[selDate.value] = {
        objetivos:   cur.objetivos.map(i => ({ ...i })),
        tareas:      cur.tareas.map(i => ({ ...i })),
        reuniones:   cur.reuniones.map(i => ({ ...i })),
        plazos:      cur.plazos.map(i => ({ ...i })),
        plan:        cur.plan,
        generatedAt: cur.generatedAt,
      }
    }
    return data.value[selDate.value]
  }

  async function load() {
    const res = await api.storage.get('agenda-v3')
    if (res.value) {
      const raw = JSON.parse(res.value) as Record<string, Partial<DayData>>
      for (const [k, v] of Object.entries(raw)) data.value[k] = migrateDay(v)
    }
  }

  async function save() { await api.storage.set('agenda-v3', data.value) }

  function addItem(section: keyof Pick<DayData,'objetivos'|'tareas'|'reuniones'|'plazos'>) {
    ensureDay()[section].push(newItem())
    save()
  }

  function removeItem(section: keyof Pick<DayData,'objetivos'|'tareas'|'reuniones'|'plazos'>, id: string) {
    const d = ensureDay()
    d[section] = d[section].filter(x => x.id !== id)
    if (!d[section].length) d[section] = [newItem()]
    save()
  }

  function setPlan(plan: string | null) {
    const d = ensureDay()
    d.plan = plan
    d.generatedAt = plan ? new Date().toISOString() : null
    save()
  }

  function navigate(delta: number) {
    const d = new Date(selDate.value + 'T12:00:00')
    d.setDate(d.getDate() + delta)
    selDate.value = d.toISOString().slice(0, 10)
  }

  function toggleItemDone(section: keyof Pick<DayData,'objetivos'|'tareas'|'reuniones'|'plazos'>, id: string) {
    const d = ensureDay()
    const item = d[section].find(x => x.id === id)
    if (item) { item.done = !item.done; save() }
  }

  function hasPlan(k: string) { return !!data.value[k]?.plan }
  function hasData(k: string) {
    const d = data.value[k]
    if (!d) return false
    return ['objetivos','tareas','reuniones','plazos'].some(s => (d[s as keyof DayData] as AgendaItem[]).some(x => x.texto))
  }

  function rolloverToNextWorkday(fromDate: string, workDays: number[]): { count: number; targetDate: string } {
    const days = workDays.length ? workDays : [1, 2, 3, 4, 5]
    const d = new Date(fromDate + 'T12:00:00')
    do { d.setDate(d.getDate() + 1) } while (!days.includes(d.getDay()))
    const targetDate = d.toISOString().slice(0, 10)

    const src = data.value[fromDate]
    if (!src) return { count: 0, targetDate }

    if (!data.value[targetDate]) data.value[targetDate] = emptyDay()

    let count = 0
    for (const k of ['objetivos', 'tareas', 'reuniones', 'plazos'] as const) {
      for (const item of src[k]) {
        if (!item.texto.trim() || item.done || item.deferred) continue
        item.deferred = true
        data.value[targetDate][k].push(newItem(item.texto))
        count++
      }
    }
    if (count) save()
    return { count, targetDate }
  }

  return { data, selDate, calCursor, day, load, save, addItem, removeItem, setPlan, navigate, hasPlan, hasData, ensureDay, newAviso, newItem, toggleItemDone, rolloverToNextWorkday }
})
