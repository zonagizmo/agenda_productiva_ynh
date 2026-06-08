<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useAgendaStore } from '@/stores/agenda'
import { LANG } from '@/i18n'
import { fmtLong } from '@/composables/useDate'

const props = defineProps<{ plan: string }>()
const emit  = defineEmits<{ regen: []; delete: [] }>()

const ui     = useUiStore()
const agenda = useAgendaStore()
const T      = computed(() => LANG[ui.lang])
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null
onUnmounted(() => { if (copyTimer) clearTimeout(copyTimer) })

interface Line { type: 'h3'|'bold'|'bull'|'prio'|'num'|'norm'|'spacer'; text: string }

const lines = computed<Line[]>(() =>
  props.plan.split('\n').map(raw => {
    const cl = raw.replace(/\*\*/g, '')
    if (/^#{1,3}\s/.test(raw))          return { type: 'h3',    text: cl.replace(/^#+\s/, '') }
    if (/^\*\*.*\*\*$/.test(raw.trim())) return { type: 'bold',  text: cl }
    if (/^[-•]\s/.test(raw))            return { type: 'bull',  text: '• ' + cl.replace(/^[-•]\s/, '') }
    if (/🔴|🟡|🟢/.test(raw))          return { type: 'prio',  text: cl }
    if (/^\d+\.\s/.test(raw))           return { type: 'num',   text: cl }
    if (!raw.trim())                     return { type: 'spacer', text: '' }
    return { type: 'norm', text: cl }
  })
)

async function sharePlan() {
  const dateStr = fmtLong(agenda.selDate, ui.lang)
  const text = `📅 ${dateStr}\n\n${props.plan}`
  try {
    if (navigator.share) {
      await navigator.share({ title: T.value.planTitle, text })
    } else {
      await navigator.clipboard.writeText(text)
      copied.value = true
      if (copyTimer) clearTimeout(copyTimer)
      copyTimer = setTimeout(() => { copied.value = false }, 2500)
    }
  } catch { /* user cancelled or denied */ }
}
</script>

<template>
  <div class="plan-card fade">
    <div class="plan-header">
      <span class="plan-title">{{ T.planTitle }}</span>
      <div class="plan-btns">
        <button class="plan-btn-share" @click="sharePlan" :title="T.shareBtn">
          {{ copied ? T.shareCopied : T.shareBtn }}
        </button>
        <button class="plan-btn-regen" @click="emit('regen')">{{ T.regen }}</button>
        <button class="plan-btn-del"   @click="emit('delete')">{{ T.delPlan }}</button>
      </div>
    </div>
    <div class="plan-text">
      <template v-for="(line, i) in lines" :key="i">
        <h3 v-if="line.type==='h3'">{{ line.text }}</h3>
        <p  v-else-if="line.type==='bold'"  class="p-bold">{{ line.text }}</p>
        <p  v-else-if="line.type==='bull'"  class="p-bull">{{ line.text }}</p>
        <p  v-else-if="line.type==='prio'"  class="p-prio">{{ line.text }}</p>
        <p  v-else-if="line.type==='num'"   class="p-num">{{ line.text }}</p>
        <div v-else-if="line.type==='spacer'" style="height:.4rem"></div>
        <p  v-else class="p-norm">{{ line.text }}</p>
      </template>
    </div>
  </div>
</template>
