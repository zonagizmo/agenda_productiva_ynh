<script setup lang="ts">
import { ref } from 'vue'
import AvisoEditor from '@/components/shared/AvisoEditor.vue'
import { useAgendaStore } from '@/stores/agenda'
import { useUiStore } from '@/stores/ui'
import { LANG } from '@/i18n'
import type { AgendaItem, Aviso, SectionDef } from '@/types'

const props = defineProps<{ item: AgendaItem; section: SectionDef; dayKey: string; isLast: boolean }>()
const emit  = defineEmits<{ remove: [] }>()

const agenda = useAgendaStore()
const ui     = useUiStore()
const T      = () => LANG[ui.lang]
const open   = ref(false)

const hasAvisos = () => props.item.avisos.length > 0

function updateAviso(i: number, av: Aviso) {
  props.item.avisos[i] = av
  agenda.save()
}
function deleteAviso(i: number) {
  props.item.avisos.splice(i, 1)
  if (!props.item.avisos.length) open.value = false
  agenda.save()
}
function addAviso() {
  props.item.avisos.push(agenda.newAviso())
  agenda.save()
}
function toggleBell() {
  if (!open.value && !hasAvisos()) { props.item.avisos.push(agenda.newAviso()); agenda.save() }
  open.value = !open.value
}
</script>

<template>
  <div class="item-row fade">
    <div class="item-main">
      <span class="item-dot" :style="{ color: section.color }">•</span>
      <input
        class="item-input"
        type="text"
        :value="item.texto"
        :placeholder="section.placeholder"
        @input="item.texto = ($event.target as HTMLInputElement).value; agenda.save()"
        @focus="($event.target as HTMLInputElement).style.borderColor = section.color"
        @blur="($event.target as HTMLInputElement).style.borderColor = ''"
      />
      <button
        class="item-bell"
        :class="{ 'has-avisos': hasAvisos() }"
        @click="toggleBell"
      >
        🔔
        <span v-if="hasAvisos()" class="bell-badge">{{ item.avisos.length }}</span>
      </button>
      <button v-if="!isLast" class="item-del" @click="emit('remove')">✕</button>
    </div>

    <!-- Chips when closed -->
    <div v-if="!open && hasAvisos()" class="aviso-chips">
      <span
        v-for="av in item.avisos" :key="av.id"
        class="aviso-chip"
        :style="`background:${av.prioridad==='alta'?'#ff6b6b':av.prioridad==='media'?'#ff9f43':'#6bcb77'}22;border-color:${av.prioridad==='alta'?'#ff6b6b':av.prioridad==='media'?'#ff9f43':'#6bcb77'}55;color:${av.prioridad==='alta'?'#ff6b6b':av.prioridad==='media'?'#ff9f43':'#6bcb77'}`"
        @click="open = true"
      >{{ av.fired ? '✓' : '🔔' }} {{ av.fecha }} {{ av.hora }}{{ av.texto ? ' · ' + av.texto.slice(0,18) : '' }}</span>
    </div>

    <!-- Aviso editors when open -->
    <div v-if="open" class="avisos-panel">
      <AvisoEditor
        v-for="(av, i) in item.avisos" :key="av.id"
        :aviso="av" :color="section.color"
        @update="updateAviso(i, $event)"
        @delete="deleteAviso(i)"
      />
      <button class="add-aviso-btn" @click="addAviso">{{ T().addAviso }}</button>
    </div>
  </div>
</template>
