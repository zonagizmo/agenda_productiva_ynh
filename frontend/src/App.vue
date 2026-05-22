<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AgendaView    from '@/components/agenda/AgendaView.vue'
import TareasView    from '@/components/tasks/TareasView.vue'
import HistorialView from '@/components/historial/HistorialView.vue'
import ConfigView    from '@/components/config/ConfigView.vue'
import { useUiStore }     from '@/stores/ui'
import { useAgendaStore } from '@/stores/agenda'
import { useTasksStore }  from '@/stores/tasks'
import { useConfigStore } from '@/stores/config'
import { useNotifStore }  from '@/stores/notifications'
import { LANG } from '@/i18n'
import { api } from '@/api/client'

const ui     = useUiStore()
const agenda = useAgendaStore()
const tasks  = useTasksStore()
const cfg    = useConfigStore()
const notif  = useNotifStore()
const T      = computed(() => LANG[ui.lang])

onMounted(async () => {
  try { const v = await api.version(); ui.version = v.version ?? '' } catch { /* ignore */ }
  await Promise.all([agenda.load(), tasks.load(), cfg.load()])
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* ignore */ })
  }
  notif.check(ui.lang)
  setInterval(() => notif.check(ui.lang), 60_000)
})
</script>

<template>
  <header id="topbar">
    <div class="topbar-row1">
      <button v-if="ui.tab==='agenda'" class="menu-btn" @click="ui.sideOpen=!ui.sideOpen">☰</button>
      <span class="topbar-title">{{ T.appTitle }}</span>
    </div>
    <div class="topbar-row2">
      <button v-for="(label, key) in T.tabs" :key="key"
        class="tab-btn" :class="{ active: ui.tab===key }"
        @click="ui.tab = key">{{ label }}</button>
    </div>
  </header>

  <div id="main-body">
    <AgendaView v-if="ui.tab==='agenda'" />
    <div v-else style="flex:1;overflow-y:auto">
      <TareasView    v-if="ui.tab==='tareas'" />
      <HistorialView v-else-if="ui.tab==='historial'" />
      <ConfigView    v-else-if="ui.tab==='config'" />
    </div>
  </div>

  <span id="version-tag" v-if="ui.version">v{{ ui.version }}</span>
</template>
