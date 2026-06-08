<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAgendaStore } from '@/stores/agenda'
import { useTasksStore } from '@/stores/tasks'
import { useUiStore } from '@/stores/ui'
import { LANG } from '@/i18n'
import { fmtShort } from '@/composables/useDate'

const emit = defineEmits<{ close: [] }>()

const agenda = useAgendaStore()
const tasks  = useTasksStore()
const ui     = useUiStore()
const T      = computed(() => LANG[ui.lang])
const query  = ref('')
const input  = ref<HTMLInputElement | null>(null)

onMounted(() => input.value?.focus())
onUnmounted(() => {})

function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))

interface Result {
  type: 'agenda' | 'task'
  dayKey: string
  icon: string
  text: string
  label: string
  done: boolean
}

const results = computed<Result[]>(() => {
  const q = query.value.toLowerCase().trim()
  if (q.length < 2) return []
  const secs = T.value.sections
  const out: Result[] = []

  for (const [dk, day] of Object.entries(agenda.data)) {
    for (const sec of secs) {
      for (const item of day[sec.key] ?? []) {
        if (item.texto.toLowerCase().includes(q)) {
          out.push({ type: 'agenda', dayKey: dk, icon: sec.icon, text: item.texto, label: fmtShort(dk, ui.lang), done: !!item.done })
        }
      }
    }
  }

  for (const task of tasks.tasks) {
    if (task.texto.toLowerCase().includes(q)) {
      out.push({ type: 'task', dayKey: '', icon: '📋', text: task.texto, label: task.dueDate || '', done: task.done })
    }
  }

  return out.slice(0, 40).sort((a, b) => b.dayKey.localeCompare(a.dayKey))
})

function goTo(r: Result) {
  if (r.type === 'agenda' && r.dayKey) {
    agenda.selDate = r.dayKey
    ui.tab = 'agenda'
  } else {
    ui.tab = 'tareas'
  }
  emit('close')
}

function highlight(text: string): string {
  const q = query.value.trim()
  if (!q) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx < 0) return text
  return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + q.length) + '</mark>' + text.slice(idx + q.length)
}
</script>

<template>
  <div class="search-overlay" @click.self="emit('close')">
    <div class="search-box">
      <div class="search-input-row">
        <span class="search-icon">🔍</span>
        <input
          ref="input"
          v-model="query"
          class="search-input"
          :placeholder="T.searchPlaceholder"
          autocomplete="off"
        />
        <button class="search-close" @click="emit('close')">✕</button>
      </div>

      <div class="search-results" v-if="query.length >= 2">
        <p v-if="!results.length" class="search-empty">{{ T.searchNoResults }}</p>
        <template v-else>
          <div
            v-for="(r, i) in results" :key="i"
            class="search-result"
            :class="{ 'sr-done': r.done }"
            @click="goTo(r)"
          >
            <span class="sr-icon">{{ r.icon }}</span>
            <span class="sr-text" v-html="highlight(r.text)"></span>
            <span class="sr-label">{{ r.type === 'agenda' ? r.label : T.searchInTasks }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
