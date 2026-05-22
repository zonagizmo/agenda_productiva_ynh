<script setup lang="ts">
import { ref, computed } from 'vue'
import AvisoEditor from '@/components/shared/AvisoEditor.vue'
import {
  useTasksStore,
  addInterval, recurrenceCurrentDue, isRecurringDue, isRecurringExpired, newRecurrence,
} from '@/stores/tasks'
import { useUiStore } from '@/stores/ui'
import { LANG } from '@/i18n'
import { todayKey } from '@/composables/useDate'
import type { Task, Aviso, Priority, RecurrenceType } from '@/types'

const props = defineProps<{ task: Task }>()
const emit  = defineEmits<{ remove: [] }>()

const store   = useTasksStore()
const ui      = useUiStore()
const T       = () => LANG[ui.lang]
const open    = ref(false)
const lblPick = ref(false)

function prioColor(p: Priority) { return p==='alta'?'#ff6b6b':p==='media'?'#ff9f43':'#6bcb77' }

const isOverdue  = () => store.isOverdue(props.task)
const isTodayDue = () => store.isTodayDue(props.task)
const available  = () => store.labels.filter(l => !props.task.labels.includes(l.id))

function updateAviso(i: number, av: Aviso) { props.task.avisos[i] = av; store.saveTasks() }
function deleteAviso(i: number) { props.task.avisos.splice(i, 1); store.saveTasks() }
function addAviso() { props.task.avisos.push(store.newAviso()); store.saveTasks() }

// ── Recurrence ─────────────────────────────────────────────

const REC_TYPES = computed(() => [
  { key: 'daily'   as RecurrenceType, label: ui.lang==='es' ? 'Diaria'   : 'Daily'   },
  { key: 'weekly'  as RecurrenceType, label: ui.lang==='es' ? 'Semanal'  : 'Weekly'  },
  { key: 'monthly' as RecurrenceType, label: ui.lang==='es' ? 'Mensual'  : 'Monthly' },
  { key: 'yearly'  as RecurrenceType, label: ui.lang==='es' ? 'Anual'    : 'Yearly'  },
])

function setRecType(type: RecurrenceType) {
  if (props.task.recurrence?.type === type) return
  props.task.recurrence = newRecurrence(type)
  store.saveTasks()
}
function clearRec() { props.task.recurrence = null; store.saveTasks() }

function fmtRecDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString(
    ui.lang === 'es' ? 'es-ES' : 'en-US',
    { weekday: 'short', day: 'numeric', month: 'short' },
  )
}

const recChip = computed(() => {
  const rec = props.task.recurrence
  if (!rec) return null
  const today = todayKey()
  const es = ui.lang === 'es'

  if (isRecurringExpired(props.task))
    return { text: es ? '🔄 Finalizada' : '🔄 Expired', cls: 'rec-expired' }

  if (today < rec.startDate)
    return { text: `🔄 ${fmtRecDate(rec.startDate)}`, cls: 'rec-upcoming' }

  if (props.task.done) {
    const next = addInterval(rec.lastCompleted || today, rec, 1)
    return { text: `🔄 ✓ ${fmtRecDate(next)}`, cls: 'rec-done' }
  }

  if (isRecurringDue(props.task))
    return { text: es ? '🔄 Hoy' : '🔄 Today', cls: 'rec-today' }

  const due = recurrenceCurrentDue(props.task)
  return { text: `🔄 ${fmtRecDate(due || rec.startDate)}`, cls: 'rec-upcoming' }
})
</script>

<template>
  <div class="task-row fade" :class="{ 'done-row': task.done }">
    <div class="task-main">
      <button
        class="task-check" :class="{ done: task.done }"
        :style="task.done ? '' : `border-color:${prioColor(task.prioridad)}`"
        @click="store.toggleDone(task.id)"
      >{{ task.done ? '✓' : '' }}</button>

      <span class="task-prio-dot" :style="{ background: prioColor(task.prioridad) }"></span>

      <input class="task-input" :class="{ 'done-text': task.done }" type="text"
        :value="task.texto" :placeholder="T().taskPH"
        @input="task.texto=($event.target as HTMLInputElement).value; store.saveTasks()" />

      <div class="task-meta">
        <span v-if="task.dueDate" class="due-chip"
          :class="isOverdue()?'overdue':isTodayDue()?'today':'ok'">
          {{ isOverdue()?'⚠️ ':'📅 ' }}{{ task.dueDate }}
        </span>
        <span v-if="recChip" class="rec-chip" :class="recChip.cls">{{ recChip.text }}</span>
        <span v-for="lid in task.labels" :key="lid" class="task-lbl-chip"
          :style="`background:${store.getLabelById(lid)?.color}22;border-color:${store.getLabelById(lid)?.color}55;color:${store.getLabelById(lid)?.color}`">
          {{ store.getLabelById(lid)?.nombre }}
        </span>
      </div>

      <button class="item-bell" :class="{ 'has-avisos': task.avisos.length }"
        @click="()=>{ if(!open&&!task.avisos.length){task.avisos.push(store.newAviso());store.saveTasks()} open=true }">
        🔔<span v-if="task.avisos.length" class="bell-badge">{{ task.avisos.length }}</span>
      </button>
      <button class="task-expand-btn" @click="open=!open">{{ open?'▴':'▾' }}</button>
      <button class="item-del" @click="emit('remove')">✕</button>
    </div>

    <div v-if="open" class="task-detail">
      <!-- Priority -->
      <div class="task-detail-row">
        <span class="task-detail-label">{{ ui.lang==='es'?'Prioridad':'Priority' }}</span>
        <button v-for="p in T().priors" :key="p.key" class="prior-btn"
          :class="{ active: task.prioridad===p.key }"
          :style="task.prioridad===p.key?`background:${prioColor(p.key as Priority)}33;border-color:${prioColor(p.key as Priority)};color:${prioColor(p.key as Priority)}`:'' "
          @click="task.prioridad=p.key as Priority; store.saveTasks()">
          {{ p.dot }} {{ p.label }}
        </button>
      </div>

      <!-- Due date -->
      <div class="task-detail-row">
        <span class="task-detail-label">{{ T().dueDateLabel }}</span>
        <input type="date" class="task-due-input" :value="task.dueDate"
          @change="task.dueDate=($event.target as HTMLInputElement).value; store.saveTasks()" />
        <button v-if="task.dueDate" class="item-del" @click="task.dueDate=''; store.saveTasks()">✕</button>
      </div>

      <!-- Recurrence -->
      <div class="task-detail-row" style="flex-wrap:wrap;gap:.35rem">
        <span class="task-detail-label">{{ ui.lang==='es'?'Repetir':'Repeat' }}</span>
        <button class="prior-btn" :class="{ active: !task.recurrence }"
          @click="clearRec()">{{ ui.lang==='es'?'Nunca':'Never' }}</button>
        <button v-for="rt in REC_TYPES" :key="rt.key" class="prior-btn"
          :class="{ active: task.recurrence?.type === rt.key }"
          :style="task.recurrence?.type===rt.key?'background:#c77dff22;border-color:#c77dff;color:#c77dff':''"
          @click="setRecType(rt.key)">{{ rt.label }}</button>
      </div>

      <template v-if="task.recurrence">
        <div class="task-detail-row">
          <span class="task-detail-label" style="color:#c77dff">{{ ui.lang==='es'?'Inicio':'Start' }} *</span>
          <input type="date" class="task-due-input"
            :value="task.recurrence.startDate"
            @change="task.recurrence!.startDate=($event.target as HTMLInputElement).value; store.saveTasks()" />
        </div>
        <div class="task-detail-row">
          <span class="task-detail-label">{{ ui.lang==='es'?'Fin':'End' }}</span>
          <input type="date" class="task-due-input"
            :value="task.recurrence.endDate"
            @change="task.recurrence!.endDate=($event.target as HTMLInputElement).value; store.saveTasks()" />
          <button v-if="task.recurrence.endDate" class="item-del"
            @click="task.recurrence!.endDate=''; store.saveTasks()">✕</button>
          <span style="font-size:.68rem;color:var(--muted)">{{ ui.lang==='es'?'(opcional)':'(optional)' }}</span>
        </div>
      </template>

      <!-- Labels -->
      <div class="task-detail-row">
        <span class="task-detail-label">{{ ui.lang==='es'?'Etiquetas':'Labels' }}</span>
        <div class="task-lbl-list">
          <span v-for="lid in task.labels" :key="lid" class="task-lbl-chip"
            :style="`background:${store.getLabelById(lid)?.color}22;border-color:${store.getLabelById(lid)?.color}55;color:${store.getLabelById(lid)?.color}`">
            {{ store.getLabelById(lid)?.nombre }}
            <button class="task-lbl-rm" @click="task.labels=task.labels.filter(x=>x!==lid); store.saveTasks()">✕</button>
          </span>
          <button v-if="available().length" class="lbl-add-btn" @click="lblPick=!lblPick">{{ T().addLabelToTask }}</button>
          <div v-if="lblPick" class="lbl-picker">
            <button v-for="lbl in available()" :key="lbl.id" class="lbl-pick-item"
              :style="`background:${lbl.color}22;border-color:${lbl.color}55;color:${lbl.color}`"
              @click="task.labels.push(lbl.id); lblPick=false; store.saveTasks()">
              {{ lbl.nombre }}
            </button>
          </div>
        </div>
      </div>

      <!-- Avisos -->
      <div v-if="task.avisos.length" class="avisos-panel">
        <AvisoEditor v-for="(av,i) in task.avisos" :key="av.id"
          :aviso="av" :color="prioColor(task.prioridad)"
          @update="updateAviso(i,$event)" @delete="deleteAviso(i)" />
        <button class="add-aviso-btn" @click="addAviso">{{ T().addAviso }}</button>
      </div>
    </div>
  </div>
</template>
