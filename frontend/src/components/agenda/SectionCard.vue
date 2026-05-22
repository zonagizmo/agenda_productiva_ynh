<script setup lang="ts">
import ItemRow from './ItemRow.vue'
import { useAgendaStore } from '@/stores/agenda'
import { useUiStore } from '@/stores/ui'
import { LANG } from '@/i18n'
import type { SectionDef } from '@/types'

const props = defineProps<{ section: SectionDef; dayKey: string }>()

const agenda = useAgendaStore()
const ui     = useUiStore()
const T      = () => LANG[ui.lang]

const items = () => agenda.day[props.section.key]
const count = () => items().filter(x => x.texto).length
const avCnt = () => items().reduce((s, x) => s + x.avisos.length, 0)
const c = props.section.color
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
    <ItemRow
      v-for="item in items()" :key="item.id"
      :item="item" :section="section" :dayKey="dayKey"
      :isLast="items().length === 1"
      @remove="agenda.removeItem(section.key, item.id)"
    />
  </div>
</template>
