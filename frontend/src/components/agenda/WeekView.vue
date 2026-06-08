<script setup lang="ts">
import { computed } from 'vue'
import { useAgendaStore } from '@/stores/agenda'
import { useConfigStore } from '@/stores/config'
import { useUiStore } from '@/stores/ui'
import { LANG } from '@/i18n'
import { isToday } from '@/composables/useDate'

const emit = defineEmits<{ navigate: [dateKey: string] }>()

const agenda = useAgendaStore()
const cfg    = useConfigStore()
const ui     = useUiStore()
const T      = computed(() => LANG[ui.lang])

const weekDays = computed(() => {
  const workDays: number[] = cfg.config.diasLaborables?.length ? cfg.config.diasLaborables : [1,2,3,4,5]
  const weekStart: number = cfg.config.weekStart ?? 1
  const sel = new Date(agenda.selDate + 'T12:00:00')
  const diff = (sel.getDay() - weekStart + 7) % 7
  const startDate = new Date(sel)
  startDate.setDate(sel.getDate() - diff)
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    if (workDays.includes(d.getDay())) {
      days.push(d.toISOString().slice(0, 10))
    }
  }
  return days
})

function fmtDow(dk: string): string {
  return new Date(dk + 'T12:00:00').toLocaleDateString(
    ui.lang === 'es' ? 'es-ES' : 'en-US', { weekday: 'short' }
  ).replace('.', '')
}
function fmtDay(dk: string): string {
  const d = new Date(dk + 'T12:00:00')
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function allItems(dk: string) {
  const day = agenda.data[dk]
  if (!day) return []
  const secs = T.value.sections
  const out: { icon: string; color: string; texto: string; done: boolean }[] = []
  for (const sec of secs) {
    for (const item of day[sec.key] ?? []) {
      if (item.texto.trim()) out.push({ icon: sec.icon, color: sec.color, texto: item.texto, done: !!item.done })
    }
  }
  return out
}

function doneCount(dk: string): { done: number; total: number } {
  const items = allItems(dk)
  return { done: items.filter(i => i.done).length, total: items.length }
}

function goDay(dk: string) {
  agenda.selDate = dk
  emit('navigate', dk)
}
</script>

<template>
  <div class="week-view fade">
    <div class="week-grid">
      <div
        v-for="dk in weekDays" :key="dk"
        class="week-col"
        :class="{ 'wc-today': isToday(dk), 'wc-sel': dk === agenda.selDate }"
      >
        <button class="week-col-head" @click="goDay(dk)">
          <span class="wch-dow">{{ fmtDow(dk) }}</span>
          <span class="wch-date">{{ fmtDay(dk) }}</span>
          <span v-if="agenda.hasPlan(dk)" class="wch-plan" title="Tiene plan">✦</span>
        </button>

        <div class="week-col-body">
          <div
            v-for="(item, i) in allItems(dk)" :key="i"
            class="wi-row"
            :class="{ 'wi-done': item.done }"
          >
            <span class="wi-dot" :style="{ color: item.color }">•</span>
            <span class="wi-text">{{ item.texto }}</span>
          </div>
          <p v-if="!allItems(dk).length" class="wi-empty">—</p>
        </div>

        <div class="week-col-foot" v-if="doneCount(dk).total">
          <span :class="doneCount(dk).done === doneCount(dk).total ? 'wf-all' : 'wf-partial'">
            {{ doneCount(dk).done }}/{{ doneCount(dk).total }} ✓
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
