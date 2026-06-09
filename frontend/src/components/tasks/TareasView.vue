<script setup lang="ts">
import { ref, computed } from 'vue'
import TaskRow from './TaskRow.vue'
import PersistentRulesView from './PersistentRulesView.vue'
import { useTasksStore, LABEL_COLORS } from '@/stores/tasks'
import { useUiStore } from '@/stores/ui'
import { LANG } from '@/i18n'

const store = useTasksStore()
const ui    = useUiStore()
const T     = computed(() => LANG[ui.lang])

const filterLabel   = ref<string | null>(null)
const showDone      = ref(false)
const newLabelColor = ref(LABEL_COLORS[0])
const newLabelName  = ref('')

const visible  = computed(() => filterLabel.value ? store.tasks.filter(t => t.labels.includes(filterLabel.value!)) : store.tasks)
const pending  = computed(() => store.sortPending(visible.value.filter(t => !t.done)))
const done     = computed(() => visible.value.filter(t => t.done))

function addLabel() {
  if (!newLabelName.value.trim()) return
  store.addLabel(newLabelName.value.trim(), newLabelColor.value)
  newLabelName.value = ''
}
</script>

<template>
  <div style="max-width:700px;margin:0 auto;padding:1.3rem 1.2rem">
    <!-- Header -->
    <div class="tasks-header">
      <div class="date-title">{{ T.tasksTitle }}</div>
      <button class="task-add-btn" @click="store.addTask()">{{ T.addTask }}</button>
    </div>

    <!-- Label filter -->
    <div v-if="store.labels.length" class="tasks-filter-bar">
      <button class="lbl-filter-btn" :class="{ active: filterLabel===null }" @click="filterLabel=null">{{ T.allFilter }}</button>
      <button v-for="lbl in store.labels" :key="lbl.id"
        class="lbl-filter-btn" :class="{ active: filterLabel===lbl.id }"
        @click="filterLabel = filterLabel===lbl.id ? null : lbl.id">
        <span :style="`display:inline-block;width:7px;height:7px;border-radius:50%;background:${lbl.color};margin-right:3px`"></span>
        {{ lbl.nombre }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="!store.tasks.length" class="hist-empty">
      <p style="font-size:2rem">📋</p>
      <p>{{ T.noTasks }}</p>
    </div>

    <template v-else>
      <!-- Pending -->
      <div class="sections-card">
        <div class="tasks-section-hdr">
          <span class="section-label" style="color:#4d96ff">
            ✅ {{ T.pendingTasks }}
            <span class="section-badge" style="background:#4d96ff22;border-color:#4d96ff44;color:#4d96ff">{{ pending.length }}</span>
          </span>
        </div>
        <p v-if="!pending.length" style="color:var(--muted);font-size:.83rem;padding:.3rem 0">{{ T.noPendingTasks }}</p>
        <TaskRow v-for="t in pending" :key="t.id" :task="t" @remove="store.removeTask(t.id)" />
      </div>

      <!-- Completed -->
      <div v-if="done.length" class="sections-card">
        <button class="tasks-done-toggle" @click="showDone=!showDone">
          {{ showDone ? '▾' : '▸' }} {{ T.completedTasks }}
          <span class="section-badge" style="background:var(--faint);border-color:var(--faint);color:var(--muted)">{{ done.length }}</span>
        </button>
        <TaskRow v-if="showDone" v-for="t in done" :key="t.id" :task="t" @remove="store.removeTask(t.id)" />
      </div>
    </template>

    <!-- Persistent rules -->
    <PersistentRulesView />

    <!-- Labels manager -->
    <div class="labels-manager">
      <div class="labels-manager-title">{{ T.labelsTitle }}</div>
      <div v-if="store.labels.length" class="labels-list">
        <div v-for="lbl in store.labels" :key="lbl.id" class="lbl-manager-chip"
          :style="`background:${lbl.color}22;border-color:${lbl.color}55;color:${lbl.color}`">
          {{ lbl.nombre }}
          <button class="lbl-manager-del" @click="store.removeLabel(lbl.id)">✕</button>
        </div>
      </div>
      <div class="lbl-create-form">
        <input class="lbl-name-input" v-model="newLabelName" :placeholder="T.labelNamePH" maxlength="24" @keyup.enter="addLabel" />
        <div class="color-swatches">
          <button v-for="c in LABEL_COLORS" :key="c" class="color-swatch" :class="{ sel: newLabelColor===c }"
            :style="{ background: c }" @click="newLabelColor=c"></button>
        </div>
        <button class="lbl-create-btn" @click="addLabel">{{ T.addLabel }}</button>
      </div>
    </div>
  </div>
</template>
