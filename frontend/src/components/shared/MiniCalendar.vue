<script setup lang="ts">
import { computed } from 'vue'
import { useAgendaStore } from '@/stores/agenda'
import { useUiStore } from '@/stores/ui'
import { LANG } from '@/i18n'
import { todayKey } from '@/composables/useDate'
import type { Priority } from '@/types'

const agenda = useAgendaStore()
const ui     = useUiStore()
const T      = computed(() => LANG[ui.lang])

const ws = computed(() => 0) // will read from config

function dayAvisoColor(k: string): string | null {
  const d = agenda.data[k]
  if (!d) return null
  const all: Priority[] = []
  for (const sec of ['objetivos','tareas','reuniones','plazos'] as const)
    for (const item of d[sec] ?? [])
      for (const av of item.avisos ?? [])
        if (av.texto) all.push(av.prioridad)
  if (!all.length) return null
  if (all.includes('alta'))  return '#ff6b6b'
  if (all.includes('media')) return '#ff9f43'
  return '#6bcb77'
}

const calData = computed(() => {
  const cur  = agenda.calCursor
  const cfg  = ws.value
  const raw  = new Date(cur.y, cur.m, 1).getDay()
  const first = (raw - cfg + 7) % 7
  const days  = new Date(cur.y, cur.m + 1, 0).getDate()
  const month = new Date(cur.y, cur.m, 1).toLocaleDateString(
    ui.lang === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' }
  )
  const dowAll = ui.lang === 'es' ? ['D','L','M','X','J','V','S'] : ['S','M','T','W','T','F','S']
  const dow = [...dowAll.slice(cfg), ...dowAll.slice(0, cfg)]
  return { first, days, month, dow, cur }
})

function keyFor(d: number) {
  const { y, m } = agenda.calCursor
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

function prev() {
  const d = new Date(agenda.calCursor.y, agenda.calCursor.m - 1)
  agenda.calCursor.y = d.getFullYear(); agenda.calCursor.m = d.getMonth()
}
function next() {
  const d = new Date(agenda.calCursor.y, agenda.calCursor.m + 1)
  agenda.calCursor.y = d.getFullYear(); agenda.calCursor.m = d.getMonth()
}
function selectDay(k: string) {
  agenda.selDate = k
}
</script>

<template>
  <div class="mini-cal">
    <div class="cal-header">
      <button class="cal-nav" @click="prev">‹</button>
      <span class="cal-month" style="text-transform:capitalize">{{ calData.month }}</span>
      <button class="cal-nav" @click="next">›</button>
    </div>
    <div class="cal-grid">
      <div v-for="d in calData.dow" :key="d" class="cal-dow">{{ d }}</div>
      <div v-for="i in calData.first" :key="'e'+i"></div>
      <button
        v-for="d in calData.days" :key="d"
        class="cal-day"
        :class="{ today: keyFor(d) === todayKey(), sel: keyFor(d) === agenda.selDate }"
        @click="selectDay(keyFor(d))"
      >
        {{ d }}
        <span class="cal-dots">
          <span v-if="agenda.hasPlan(keyFor(d))" class="cal-dot"
            :style="{ background: keyFor(d) === agenda.selDate ? '#fff' : '#6bcb77' }"></span>
          <span v-else-if="agenda.hasData(keyFor(d))" class="cal-dot" style="background:#ffd93d"></span>
          <span v-if="dayAvisoColor(keyFor(d))" class="cal-dot"
            :style="{ background: keyFor(d) === agenda.selDate ? '#fff' : dayAvisoColor(keyFor(d))! }"></span>
        </span>
      </button>
    </div>
    <div class="cal-legend">{{ T.calLegend }}</div>
  </div>
</template>
