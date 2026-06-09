<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useConfigStore } from '@/stores/config'
import { usePersistentRulesStore } from '@/stores/persistentRules'
import { LANG } from '@/i18n'
import { api } from '@/api/client'
import { callAiDirect } from '@/composables/useAiCall'
import { uid, todayKey } from '@/composables/useDate'
import type { PersistentRule, RuleSchedule } from '@/types'

const ui    = useUiStore()
const cfg   = useConfigStore()
const store = usePersistentRulesStore()
const T     = computed(() => LANG[ui.lang])

const open     = ref(false)
const text     = ref('')
const loading  = ref(false)
const error    = ref('')
const preview  = ref<{ taskText: string; recurrenceDesc: string; nextTrigger: string; schedule: RuleSchedule } | null>(null)

function extractJson(raw: string): unknown {
  const stripped = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()
  const start = stripped.indexOf('{')
  const end   = stripped.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('no JSON')
  return JSON.parse(stripped.slice(start, end + 1))
}

async function analyze() {
  if (!text.value.trim()) return
  if (!cfg.config.iaApiKey) { error.value = T.value.rulesNoConfig; return }
  loading.value = true
  error.value = ''
  preview.value = null
  try {
    const pd = await api.buildRulePrompt({ text: text.value.trim(), lang: ui.lang, today: todayKey() })
    const prov = cfg.currentProvider()
    const raw  = await callAiDirect(pd.prompt, prov, cfg.currentModel(), cfg.config.iaApiKey, ui.lang)
    const parsed = extractJson(raw) as { taskText: string; recurrenceDesc: string; nextTrigger: string; schedule: RuleSchedule }
    if (!parsed.taskText || !parsed.schedule?.type || !parsed.nextTrigger) throw new Error('incomplete')
    preview.value = parsed
  } catch (e) {
    error.value = (e instanceof Error && e.message !== 'incomplete' && e.message !== 'no JSON')
      ? e.message
      : T.value.rulesErrParse
  } finally {
    loading.value = false
  }
}

async function confirm() {
  if (!preview.value) return
  const rule: PersistentRule = {
    id: uid(),
    naturalText: text.value.trim(),
    taskText: preview.value.taskText,
    recurrenceDesc: preview.value.recurrenceDesc,
    nextTrigger: preview.value.nextTrigger,
    lastTriggered: '',
    createdAt: new Date().toISOString(),
    schedule: preview.value.schedule,
  }
  await store.addRule(rule)
  await store.checkAndFire()
  text.value = ''
  preview.value = null
  error.value = ''
}

function cancel() { preview.value = null; error.value = '' }

function fmtDate(d: string) {
  if (!d) return ''
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString(ui.lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return d }
}
</script>

<template>
  <div class="prules-section">
    <button class="prules-toggle" @click="open = !open">
      <span>{{ T.rulesTitle }}</span>
      <span class="prules-badge" v-if="store.rules.length">{{ store.rules.length }}</span>
      <span class="prules-chevron">{{ open ? '▾' : '▸' }}</span>
    </button>

    <div v-if="open" class="prules-body">
      <!-- Input -->
      <div v-if="!preview" class="prules-input-row">
        <textarea
          v-model="text"
          class="prules-textarea"
          :placeholder="T.rulesInputPH"
          rows="2"
          @keydown.ctrl.enter="analyze"
        />
        <button class="prules-analyze-btn" :disabled="loading || !text.trim()" @click="analyze">
          {{ loading ? T.rulesAnalyzing : T.rulesAnalyze }}
        </button>
      </div>

      <!-- Info -->
      <p v-if="!preview" class="prules-info">{{ T.rulesInfo }}</p>

      <!-- Error -->
      <p v-if="error" class="prules-error">{{ error }}</p>

      <!-- Preview -->
      <div v-if="preview" class="prules-preview">
        <div class="prules-preview-row"><span class="prules-lbl">{{ T.rulesTask }}</span><strong>{{ preview.taskText }}</strong></div>
        <div class="prules-preview-row"><span class="prules-lbl">{{ T.rulesSchedule }}</span>{{ preview.recurrenceDesc }}</div>
        <div class="prules-preview-row"><span class="prules-lbl">{{ T.rulesNext }}</span>{{ fmtDate(preview.nextTrigger) }}</div>
        <div class="prules-preview-actions">
          <button class="prules-confirm-btn" @click="confirm">{{ T.rulesConfirm }}</button>
          <button class="prules-cancel-btn" @click="cancel">{{ T.rulesCancel }}</button>
        </div>
      </div>

      <!-- List -->
      <div v-if="store.rules.length" class="prules-list">
        <div v-for="rule in store.rules" :key="rule.id" class="prules-item">
          <div class="prules-item-main">
            <span class="prules-item-text">{{ rule.taskText }}</span>
            <span class="prules-item-sched">{{ rule.recurrenceDesc }}</span>
          </div>
          <span class="prules-item-next">{{ fmtDate(rule.nextTrigger) }}</span>
          <button class="prules-del-btn" @click="store.removeRule(rule.id)">✕</button>
        </div>
      </div>
      <p v-else class="prules-empty">{{ T.rulesEmpty }}</p>
    </div>
  </div>
</template>
