<script setup lang="ts">
import { ref } from 'vue'
import AvisoEditor from '@/components/shared/AvisoEditor.vue'
import { useTasksStore } from '@/stores/tasks'
import { useUiStore } from '@/stores/ui'
import { LANG } from '@/i18n'
import type { Task, Aviso, Priority } from '@/types'

const props = defineProps<{ task: Task }>()
const emit  = defineEmits<{ remove: [] }>()

const store  = useTasksStore()
const ui     = useUiStore()
const T      = () => LANG[ui.lang]
const open   = ref(false)
const lblPick = ref(false)

function prioColor(p: Priority) { return p==='alta'?'#ff6b6b':p==='media'?'#ff9f43':'#6bcb77' }

const isOverdue  = () => store.isOverdue(props.task)
const isTodayDue = () => store.isTodayDue(props.task)
const available  = () => store.labels.filter(l => !props.task.labels.includes(l.id))

function updateAviso(i: number, av: Aviso) { props.task.avisos[i] = av; store.saveTasks() }
function deleteAviso(i: number) { props.task.avisos.splice(i,1); store.saveTasks() }
function addAviso() { props.task.avisos.push(store.newAviso()); store.saveTasks() }
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
        <span v-for="lid in task.labels" :key="lid" class="task-lbl-chip"
          :style="`background:${store.getLabelById(lid)?.color}22;border-color:${store.getLabelById(lid)?.color}55;color:${store.getLabelById(lid)?.color}`">
          {{ store.getLabelById(lid)?.nombre }}
        </span>
      </div>

      <button class="item-bell" :class="{ 'has-avisos': task.avisos.length }" @click="()=>{ if(!open&&!task.avisos.length){task.avisos.push(store.newAviso());store.saveTasks()} open=true }">
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
