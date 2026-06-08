<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AgendaView    from '@/components/agenda/AgendaView.vue'
import TareasView    from '@/components/tasks/TareasView.vue'
import HistorialView from '@/components/historial/HistorialView.vue'
import StatsView     from '@/components/stats/StatsView.vue'
import ConfigView    from '@/components/config/ConfigView.vue'
import CapacitorSetup  from '@/components/CapacitorSetup.vue'
import NativeLogin     from '@/components/NativeLogin.vue'
import SearchOverlay   from '@/components/SearchOverlay.vue'
import { useUiStore }       from '@/stores/ui'
import { useAgendaStore }   from '@/stores/agenda'
import { useTasksStore }    from '@/stores/tasks'
import { useConfigStore }   from '@/stores/config'
import { useNotifStore }    from '@/stores/notifications'
import { useTemplatesStore } from '@/stores/templates'
import { LANG } from '@/i18n'
import { api, apiMeta, initNativeApi } from '@/api/client'
import { WidgetPlugin } from '@/plugins/WidgetPlugin'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { todayKey as _todayKey } from '@/composables/useDate'

const ui     = useUiStore()
const agenda = useAgendaStore()
const tasks  = useTasksStore()
const cfg    = useConfigStore()
const notif  = useNotifStore()
const tpls   = useTemplatesStore()
const T      = computed(() => LANG[ui.lang])

const showSetup   = ref(false)
const showLogin   = ref(false)
const appReady    = ref(false)
const showSearch  = ref(false)

let _tickInterval: ReturnType<typeof setInterval> | undefined
let _syncInterval: ReturnType<typeof setInterval> | undefined
let _lastStamp    = ''

async function checkSync() {
  try {
    const r = await api.storage.stamp()
    if (_lastStamp && r.stamp !== _lastStamp && Date.now() - apiMeta.lastSaveMs > 10_000) {
      await Promise.all([agenda.load(), tasks.load(), cfg.load(), tpls.load()])
      updateWidget()
    }
    _lastStamp = r.stamp
  } catch { /* ignore */ }
}

function _onVisibility() { if (document.visibilityState === 'visible') checkSync() }

async function updateWidget() {
  if (!Capacitor.isNativePlatform()) return
  const today = _todayKey()
  const secs  = LANG[ui.lang].sections
  const items: { icon: string; text: string; done: boolean }[] = []
  const dayData = agenda.data[today]
  if (dayData) {
    for (const sec of secs) {
      for (const item of dayData[sec.key] ?? []) {
        if (item.texto.trim()) items.push({ icon: sec.icon, text: item.texto, done: !!item.done })
      }
    }
  }
  for (const t of tasks.tasksForDay(today)) {
    items.push({ icon: '📋', text: t.texto, done: t.done })
  }
  try {
    await WidgetPlugin.updateData({ data: JSON.stringify({ date: today, items }) })
  } catch { /* plugin not available */ }
}

onUnmounted(() => {
  clearInterval(_tickInterval)
  clearInterval(_syncInterval)
  document.removeEventListener('visibilitychange', _onVisibility)
})

async function startApp() {
  try { const v = await api.version(); ui.version = v.version ?? '' } catch { /* ignore */ }
  await Promise.all([agenda.load(), tasks.load(), cfg.load(), tpls.load()])
  if ('serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* ignore */ })
  }
  notif.check(ui.lang)
  tasks.checkAndResetRecurring()
  await notif.setupNative(ui.lang)
  _tickInterval = setInterval(() => { notif.check(ui.lang); tasks.checkAndResetRecurring(); notif.scheduleNative(ui.lang) }, 60_000)
  // Widget data
  updateWidget()
  // Real-time sync: poll every 30s + on tab focus
  await checkSync()
  _syncInterval = setInterval(checkSync, 30_000)
  document.addEventListener('visibilitychange', _onVisibility)
  appReady.value = true
}

onMounted(async () => {
  if (Capacitor.isNativePlatform()) {
    const { value } = await Preferences.get({ key: 'serverUrl' })
    if (!value) { showSetup.value = true; return }
    initNativeApi(value)
    try {
      await startApp()
    } catch (e) {
      // AuthError o cualquier error de red → pantalla de login en vez de negro
      showLogin.value = true
    }
    return
  }
  // Web / YunoHost
  await startApp()
})
</script>

<template>
  <CapacitorSetup v-if="showSetup" />
  <NativeLogin    v-else-if="showLogin" />

  <template v-else-if="appReady || !Capacitor.isNativePlatform()">

  <header id="topbar">
    <div class="topbar-row1">
      <button v-if="ui.tab==='agenda'" class="menu-btn" @click="ui.sideOpen=!ui.sideOpen">☰</button>
      <div class="topbar-brand">
        <span class="topbar-title">{{ T.appTitle }}</span>
        <span v-if="ui.version" class="topbar-version">v{{ ui.version }}</span>
      </div>
      <button class="search-topbar-btn" :title="T.searchBtn" @click="showSearch=true">🔍</button>
      <button class="notif-btn" :class="notif.perm"
        :title="notif.perm==='granted' ? T.notifStatusGranted : T.notifActivate"
        @click="notif.request()">
        {{ notif.perm==='denied' ? '🔕' : '🔔' }}
      </button>
      <div class="lang-toggle">
        <button class="lang-btn" :class="{ active: ui.lang==='es' }" @click="ui.lang='es'">ES</button>
        <button class="lang-btn" :class="{ active: ui.lang==='en' }" @click="ui.lang='en'">EN</button>
      </div>
      <a v-if="!Capacitor.isNativePlatform()" class="ynh-home-btn" href="/yunohost/sso" title="YunoHost">🏠</a>
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
      <StatsView     v-else-if="ui.tab==='stats'" />
      <ConfigView    v-else-if="ui.tab==='config'" />
    </div>
  </div>

  <SearchOverlay v-if="showSearch" @close="showSearch=false" />

  </template><!-- end v-else-if appReady -->
</template>
