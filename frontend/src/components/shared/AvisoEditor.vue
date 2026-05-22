<script setup lang="ts">
import type { Aviso, Priority } from '@/types'
import { LANG } from '@/i18n'
import { useUiStore } from '@/stores/ui'

defineProps<{ aviso: Aviso; color: string }>()
const emit  = defineEmits<{
  update: [av: Aviso]
  delete: []
}>()

const ui = useUiStore()
const T  = () => LANG[ui.lang]

function priorColor(p: Priority) {
  return p === 'alta' ? '#ff6b6b' : p === 'media' ? '#ff9f43' : '#6bcb77'
}
</script>

<template>
  <div class="aviso-editor fade" :style="{ borderColor: color + '44' }">
    <div class="aviso-row1">
      <span class="aviso-label">{{ T().aviso }}</span>
      <input
        class="aviso-text"
        :value="aviso.texto"
        placeholder="..."
        @input="emit('update', { ...aviso, texto: ($event.target as HTMLInputElement).value, fired: false })"
        @focus="($event.target as HTMLInputElement).style.borderColor = color"
        @blur="($event.target as HTMLInputElement).style.borderColor = ''"
      />
      <button class="aviso-del" @click="emit('delete')">✕</button>
    </div>
    <div class="aviso-row2">
      <span style="font-size:.7rem;color:var(--muted)">📅</span>
      <input type="date" class="aviso-date" :value="aviso.fecha"
        @change="emit('update', { ...aviso, fecha: ($event.target as HTMLInputElement).value, fired: false })" />
      <span style="font-size:.7rem;color:var(--muted)">🕐</span>
      <input type="time" class="aviso-time" :value="aviso.hora"
        @change="emit('update', { ...aviso, hora: ($event.target as HTMLInputElement).value, fired: false })" />
      <div class="prior-btns">
        <button
          v-for="p in T().priors" :key="p.key"
          class="prior-btn"
          :class="{ active: aviso.prioridad === p.key }"
          :style="aviso.prioridad === p.key ? `background:${priorColor(p.key as Priority)}33;border-color:${priorColor(p.key as Priority)};color:${priorColor(p.key as Priority)}` : ''"
          @click="emit('update', { ...aviso, prioridad: p.key as Priority })"
        >{{ p.dot }} {{ p.label }}</button>
      </div>
      <span v-if="aviso.fired" class="fired-badge">{{ T().fired }}</span>
    </div>
  </div>
</template>
