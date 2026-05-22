<script setup lang="ts">
import { computed } from 'vue'
import { useAgendaStore } from '@/stores/agenda'
import { useUiStore } from '@/stores/ui'
import { LANG } from '@/i18n'
import { fmtLong, isToday } from '@/composables/useDate'

const agenda = useAgendaStore()
const ui     = useUiStore()
const T      = computed(() => LANG[ui.lang])

const COLORS = ['#4d96ff','#c77dff','#6bcb77','#ffd93d','#ff6b6b']

const histDays = computed(() =>
  Object.keys(agenda.data)
    .filter(k => agenda.hasPlan(k) || agenda.hasData(k))
    .sort((a,b) => b.localeCompare(a))
)

function total(k: string) {
  const d = agenda.data[k]
  return T.value.sections.reduce((s,sec) => s + (d[sec.key]?.filter(x=>x.texto).length??0), 0)
}
function avCnt(k: string) {
  const d = agenda.data[k]
  return T.value.sections.reduce((s,sec) => s + (d[sec.key]?.reduce((a,x)=>a+(x.avisos?.length??0),0)??0), 0)
}

function secCount(k: string, secKey: string): number {
  return ((agenda.data[k] as unknown) as Record<string, { texto: string }[]>)[secKey]?.filter(x => x.texto).length ?? 0
}
function openDay(k: string) { agenda.selDate = k; ui.tab = 'agenda' }
function deleteDay(k: string) { delete agenda.data[k]; agenda.save() }
</script>

<template>
  <div style="max-width:700px;margin:0 auto;padding:1.3rem 1.2rem">
    <h2 class="hist-title">{{ T.histTitle }}</h2>

    <div v-if="!histDays.length" class="hist-empty">
      <p style="font-size:2rem">📭</p>
      <p>{{ T.histEmpty }}</p>
      <button class="gen-btn" style="width:auto;padding:.65rem 1.4rem;margin-top:.8rem" @click="ui.tab='agenda'">
        {{ T.histStart }}
      </button>
    </div>

    <div v-for="(k,idx) in histDays" :key="k" class="hist-card fade"
      :style="`border-left:4px solid ${COLORS[idx%5]}`">
      <div style="flex:1">
        <div class="hist-date">
          {{ fmtLong(k, ui.lang) }}
          <span v-if="isToday(k)" class="badge today">{{ ui.lang==='es'?'Hoy':'Today' }}</span>
        </div>
        <div class="hist-meta">
          {{ total(k) }} {{ ui.lang==='es'?'elemento':'item' }}{{ total(k)!==1?'s':'' }}
          <span v-for="sec in T.sections" :key="sec.key">
            <template v-if="secCount(k, sec.key)">
              · {{ sec.icon }} {{ secCount(k, sec.key) }}
            </template>
          </span>
        </div>
        <div class="hist-badges">
          <span v-if="agenda.hasPlan(k)" class="badge plan">✓ Plan</span>
          <span v-if="avCnt(k)" class="badge avisos">🔔 {{ avCnt(k) }}</span>
        </div>
      </div>
      <div class="hist-actions">
        <button class="hist-open" @click="openDay(k)">{{ T.histOpen }}</button>
        <button class="hist-del" @click="deleteDay(k)">🗑️</button>
      </div>
    </div>
  </div>
</template>
