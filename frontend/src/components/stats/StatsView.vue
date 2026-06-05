<script setup lang="ts">
import { computed } from 'vue'
import { useAgendaStore } from '@/stores/agenda'
import { useTasksStore }  from '@/stores/tasks'
import { useConfigStore } from '@/stores/config'
import { useUiStore }     from '@/stores/ui'
import { LANG }           from '@/i18n'

const agenda = useAgendaStore()
const tasks  = useTasksStore()
const cfg    = useConfigStore()
const ui     = useUiStore()
const T      = computed(() => LANG[ui.lang])

const PRIO_COLORS: Record<string, string> = { alta: '#ff6b6b', media: '#ffd93d', baja: '#6bcb77' }
const PRIO_DOTS:  Record<string, string> = { alta: '🔴', media: '🟡', baja: '🟢' }

// ── Helpers ────────────────────────────────────────────────

function agendaDoneOnDay(key: string): number {
  const d = agenda.data[key]
  if (!d) return 0
  return (['objetivos', 'tareas', 'reuniones', 'plazos'] as const)
    .reduce((s, sec) => s + (d[sec]?.filter(x => x.done).length ?? 0), 0)
}

function tasksDoneOnDay(key: string): number {
  return tasks.tasks.filter(t => !t.recurrence && t.done && t.dueDate === key).length
}

function totalDoneOnDay(key: string): number {
  return agendaDoneOnDay(key) + tasksDoneOnDay(key)
}

function dateKey(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

// ── KPIs ──────────────────────────────────────────────────

const streak = computed(() => {
  let count = 0
  for (let i = 0; i < 365; i++) {
    if (totalDoneOnDay(dateKey(i)) > 0) count++
    else break
  }
  return count
})

const totalAgendaDone = computed(() =>
  Object.keys(agenda.data).reduce((s, k) => s + agendaDoneOnDay(k), 0)
)

const totalTasksDone = computed(() =>
  tasks.tasks.filter(t => !t.recurrence && t.done).length
)

const activeDays = computed(() => {
  const keys = new Set([
    ...Object.keys(agenda.data).filter(k => agendaDoneOnDay(k) > 0),
    ...tasks.tasks.filter(t => t.done && t.dueDate).map(t => t.dueDate),
  ])
  return keys.size
})

// ── Last 14 days bar chart ─────────────────────────────────

const last14 = computed(() => {
  const days = Array.from({ length: 14 }, (_, i) => dateKey(13 - i))
  const counts = days.map(k => ({ key: k, count: totalDoneOnDay(k) }))
  const max = Math.max(...counts.map(d => d.count), 1)
  return counts.map(d => ({ ...d, pct: Math.round((d.count / max) * 100) }))
})

const hasAnyData = computed(() => last14.value.some(d => d.count > 0))

function barColor(pct: number): string {
  if (pct >= 80) return '#6bcb77'
  if (pct >= 40) return '#4d96ff'
  if (pct > 0)   return '#c77dff'
  return '#22224a'
}

function shortDay(key: string): string {
  const d = new Date(key + 'T12:00:00')
  return T.value.statsDow[d.getDay()].slice(0, 2)
}

// ── By day of week ─────────────────────────────────────────

const byDow = computed(() => {
  const sums   = Array(7).fill(0)
  const cnts   = Array(7).fill(0)
  for (const key of Object.keys(agenda.data)) {
    const done = agendaDoneOnDay(key)
    if (!done) continue
    const dow = new Date(key + 'T12:00:00').getDay()
    sums[dow] += done
    cnts[dow]++
  }
  tasks.tasks.filter(t => t.done && t.dueDate && !t.recurrence).forEach(t => {
    const dow = new Date(t.dueDate + 'T12:00:00').getDay()
    sums[dow]++
    cnts[dow]++
  })
  const avgs = sums.map((s, i) => (cnts[i] ? s / cnts[i] : 0))
  const maxAvg = Math.max(...avgs, 1)
  // Order by weekStart config
  const ws = cfg.config.weekStart ?? 1
  const order = Array.from({ length: 7 }, (_, i) => (ws + i) % 7)
  return order.map(dow => ({
    dow,
    label: T.value.statsDow[dow],
    avg: avgs[dow],
    pct: Math.round((avgs[dow] / maxAvg) * 100),
    total: sums[dow],
  }))
})

// ── Priority stats ─────────────────────────────────────────

const prioStats = computed(() =>
  (['alta', 'media', 'baja'] as const).map(p => {
    const all  = tasks.tasks.filter(t => t.prioridad === p && !t.recurrence)
    const done = all.filter(t => t.done).length
    return { key: p, done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 }
  })
)
</script>

<template>
  <div style="max-width:700px;margin:0 auto;padding:1.3rem 1.2rem">
    <h2 class="stats-title">{{ T.statsTitle }}</h2>

    <!-- KPI cards -->
    <div class="stats-kpi-row">
      <div class="stats-kpi-card">
        <div class="stats-kpi-value" :style="streak > 0 ? 'color:#ffd93d' : ''">{{ streak }}</div>
        <div class="stats-kpi-label">{{ T.statsStreak }}</div>
        <div class="stats-kpi-sub">{{ T.statsStreakDays }}</div>
      </div>
      <div class="stats-kpi-card">
        <div class="stats-kpi-value">{{ totalAgendaDone + totalTasksDone }}</div>
        <div class="stats-kpi-label">{{ T.statsTotalDone }}</div>
        <div class="stats-kpi-sub">{{ totalAgendaDone }} agenda · {{ totalTasksDone }} tasks</div>
      </div>
      <div class="stats-kpi-card">
        <div class="stats-kpi-value">{{ activeDays }}</div>
        <div class="stats-kpi-label">{{ T.statsActiveDays }}</div>
      </div>
    </div>

    <!-- Last 14 days bar chart -->
    <div class="stats-block">
      <div class="stats-block-title">{{ T.statsLast14 }}</div>
      <div v-if="!hasAnyData" class="stats-empty">{{ T.statsNoData }}</div>
      <div v-else class="stats-bars-wrap">
        <div v-for="d in last14" :key="d.key" class="stats-bar-col">
          <div class="stats-bar-value" v-if="d.count > 0">{{ d.count }}</div>
          <div class="stats-bar-value" v-else style="opacity:0">0</div>
          <div class="stats-bar"
            :style="`height:${Math.max(d.pct, d.count > 0 ? 8 : 0)}%;background:${barColor(d.pct)}`">
          </div>
          <div class="stats-bar-label">{{ shortDay(d.key) }}</div>
        </div>
      </div>
    </div>

    <!-- By day of week -->
    <div class="stats-block">
      <div class="stats-block-title">{{ T.statsByDow }}</div>
      <div v-if="!Object.keys(agenda.data).length" class="stats-empty">{{ T.statsNoData }}</div>
      <div v-else class="stats-dow-list">
        <div v-for="row in byDow" :key="row.dow" class="stats-dow-row">
          <div class="stats-dow-label">{{ row.label }}</div>
          <div class="stats-dow-bar-bg">
            <div class="stats-dow-bar-fill"
              :style="`width:${row.pct}%;background:${row.pct >= 70 ? '#6bcb77' : row.pct >= 30 ? '#4d96ff' : '#3a3a6a'}`">
            </div>
          </div>
          <div class="stats-dow-avg">{{ row.avg > 0 ? row.avg.toFixed(1) : '—' }}</div>
        </div>
      </div>
    </div>

    <!-- Priority stats -->
    <div class="stats-block">
      <div class="stats-block-title">{{ T.statsByPrio }}</div>
      <div v-if="!tasks.tasks.filter(t => !t.recurrence).length" class="stats-empty">{{ T.statsNoData }}</div>
      <div v-else class="stats-prio-list">
        <div v-for="p in prioStats" :key="p.key" class="stats-prio-row">
          <div class="stats-prio-label">
            {{ PRIO_DOTS[p.key] }} {{ T.priors.find(x => x.key === p.key)?.label }}
          </div>
          <div class="stats-prio-bar-bg">
            <div class="stats-prio-bar-fill"
              :style="`width:${p.pct}%;background:${PRIO_COLORS[p.key]}`">
            </div>
          </div>
          <div class="stats-prio-count">{{ p.done }} / {{ p.total }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
