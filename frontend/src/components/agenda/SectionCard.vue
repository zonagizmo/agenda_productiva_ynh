<script setup lang="ts">
import { ref } from 'vue'
import ItemRow from './ItemRow.vue'
import { useAgendaStore } from '@/stores/agenda'
import { useUiStore } from '@/stores/ui'
import { LANG } from '@/i18n'
import type { SectionDef } from '@/types'

const props = defineProps<{ section: SectionDef; dayKey: string }>()

const agenda = useAgendaStore()
const ui     = useUiStore()
const T      = () => LANG[ui.lang]

const items  = () => agenda.day[props.section.key]
const count  = () => items().filter(x => x.texto).length
const avCnt  = () => items().reduce((s, x) => s + x.avisos.length, 0)
const c      = props.section.color

const dragIdx = ref(-1)
const overIdx = ref(-1)

function onDragStart(e: DragEvent, idx: number) {
  dragIdx.value = idx
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}
function onDragOver(e: DragEvent, idx: number) {
  e.preventDefault()
  overIdx.value = idx
}
function onDrop(e: DragEvent, idx: number) {
  e.preventDefault()
  if (dragIdx.value >= 0 && dragIdx.value !== idx) {
    agenda.reorderItems(props.section.key, dragIdx.value, idx)
  }
  dragIdx.value = -1
  overIdx.value = -1
}
function onDragEnd() {
  dragIdx.value = -1
  overIdx.value = -1
}
</script>

<template>
  <div class="section-block">
    <div class="section-header">
      <span class="section-label" :style="{ color: c }">
        {{ section.icon }} {{ section.label }}
        <span class="section-badge" :style="`background:${c}22;border-color:${c}44;color:${c}`">{{ count() }}</span>
        <span v-if="avCnt()" class="section-badge" style="background:#ff9f4322;border-color:#ff9f4355;color:#ff9f43">🔔 {{ avCnt() }}</span>
      </span>
      <button
        class="section-add"
        :style="`background:${c}22;border-color:${c}55;color:${c}`"
        @click="agenda.addItem(section.key)"
      >{{ T().addBtn }}</button>
    </div>
    <div
      v-for="(item, idx) in items()" :key="item.id"
      class="drag-wrapper"
      :class="{ 'drag-over': overIdx === idx && overIdx !== dragIdx }"
      draggable="true"
      @dragstart="onDragStart($event, idx)"
      @dragover="onDragOver($event, idx)"
      @drop="onDrop($event, idx)"
      @dragend="onDragEnd"
    >
      <span class="drag-handle" title="Arrastrar">⠿</span>
      <ItemRow
        :item="item" :section="section" :dayKey="dayKey"
        :isLast="items().length === 1"
        @remove="agenda.removeItem(section.key, item.id)"
      />
    </div>
  </div>
</template>
