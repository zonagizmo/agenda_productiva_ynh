<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AgendaView    from '@/components/agenda/AgendaView.vue'
import TareasView    from '@/components/tasks/TareasView.vue'
import HistorialView from '@/components/historial/HistorialView.vue'
import ConfigView    from '@/components/config/ConfigView.vue'
import CapacitorSetup from '@/components/CapacitorSetup.vue'
import NativeLogin    from '@/components/NativeLogin.vue'
import { useUiStore }     from '@/stores/ui'
import { useAgendaStore } from '@/stores/agenda'
import { useTasksStore }  from '@/stores/tasks'
import { useConfigStore } from '@/stores/config'
import { useNotifStore }  from '@/stores/notifications'
import { LANG } from '@/i18n'
import { api, initNativeApi } from '@/api/client'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

const ui     = useUiStore()
const agenda = useAgendaStore()
const tasks  = useTasksStore()
const cfg    = useConfigStore()
const notif  = useNotifStore()
const T      = computed(() => LANG[ui.lang])

const showSetup   = ref(false)
const showLogin   = ref(false)
const appReady    = ref(false)

async function startApp() {
  try { const v = await api.version(); ui.version = v.version ?? '' } catch { /* ignore */ }
  await Promise.all([agenda.load(), tasks.load(), cfg.load()])
  if ('serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* ignore */ })
  }
  notif.check(ui.lang)
  tasks.checkAndResetRecurring()
  setInterval(() => { notif.check(ui.lang); tasks.checkAndResetRecurring() }, 60_000)
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
      <ConfigView    v-else-if="ui.tab==='config'" />
    </div>
  </div>

  </template><!-- end v-else-if appReady -->
</template>
