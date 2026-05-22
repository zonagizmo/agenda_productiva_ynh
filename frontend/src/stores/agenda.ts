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
    if (!data.value[selDate.value]) data.value[selDate.value] = emptyDay()
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

  function hasPlan(k: string) { return !!data.value[k]?.plan }
  function hasData(k: string) {
    const d = data.value[k]
    if (!d) return false
    return ['objetivos','tareas','reuniones','plazos'].some(s => (d[s as keyof DayData] as AgendaItem[]).some(x => x.texto))
  }

  return { data, selDate, calCursor, day, load, save, addItem, removeItem, setPlan, navigate, hasPlan, hasData, ensureDay, newAviso, newItem }
})
