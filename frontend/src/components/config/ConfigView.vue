<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useUiStore } from '@/stores/ui'
import { LANG } from '@/i18n'
import { callAiDirect } from '@/composables/useAiCall'
import { api } from '@/api/client'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

const cfg = useConfigStore()
const ui  = useUiStore()
const T   = computed(() => LANG[ui.lang])

const testing       = ref(false)
const testResult    = ref('')
const showKey       = ref(false)
const saveStatus    = ref<'' | 'saving' | 'saved' | 'error'>('')
const scheduleError = ref('')
let _saveTimer: ReturnType<typeof setTimeout> | undefined

const exporting     = ref(false)
const importStatus  = ref('')
const importInput   = ref<HTMLInputElement | null>(null)

const EXPORT_KEYS = ['agenda-v3', 'tasks-v1', 'labels-v1', 'config-v1', 'rollover-log'] as const

const backupStatus  = ref<{ last_backup: string | null; file_count: number } | null>(null)
const backingUp     = ref(false)
const backupMsg     = ref('')

// CalDAV
const caldavCfg = ref({
  server_url: '', nc_username: '', nc_password: '',
  calendar_name: 'personal', sync_reuniones: true, sync_plazos: true,
})
const caldavLastSync    = ref<string | null>(null)
const caldavTesting     = ref(false)
const caldavSyncing     = ref(false)
const caldavDiscovering = ref(false)
const caldavTestMsg     = ref('')
const caldavSyncMsg     = ref('')
const caldavCalendars   = ref<{ name: string; slug: string }[]>([])
const showCaldavPass    = ref(false)

const summary = computed(() => {
  const c  = cfg.config
  const t  = T.value
  const ds = c.diasLaborables.map(d => t.dias[d]).join(', ')
  let s    = `${t.summaryJornada} ${c.jornadaInicio} ${t.summaryTo} ${c.jornadaFin}`
  if (c.pausaComida) s += `, ${t.summaryPausa} ${c.pausaInicio}–${c.pausaFin}`
  return `${t.summaryLabel}${s}. ${t.summaryDias} ${ds}.`
})

async function doSave() {
  clearTimeout(_saveTimer)
  saveStatus.value = 'saving'
  try {
    await cfg.save()
    saveStatus.value = 'saved'
    _saveTimer = setTimeout(() => { saveStatus.value = '' }, 2000)
  } catch {
    saveStatus.value = 'error'
    _saveTimer = setTimeout(() => { saveStatus.value = '' }, 3000)
  }
}

function saveSchedule() {
  const c = cfg.config
  if (c.jornadaFin <= c.jornadaInicio) {
    scheduleError.value = ui.lang === 'es'
      ? 'La hora de fin debe ser posterior al inicio de jornada'
      : 'End time must be after start time'
    return
  }
  if (c.pausaComida && c.pausaFin <= c.pausaInicio) {
    scheduleError.value = ui.lang === 'es'
      ? 'El fin de la pausa debe ser posterior al inicio'
      : 'Break end must be after break start'
    return
  }
  scheduleError.value = ''
  doSave()
}

async function testConnection() {
  const prov = cfg.currentProvider()
  if (!prov)                { testResult.value = '❌ Provider not found'; return }
  if (!cfg.config.iaApiKey) { testResult.value = ui.lang === 'es' ? '❌ Falta la API key' : '❌ API key missing'; return }
  testing.value = true; testResult.value = ''
  try {
    const text = await callAiDirect(
      ui.lang === 'es' ? 'Di "ok" solamente.' : 'Say "ok" only.',
      prov, cfg.currentModel(), cfg.config.iaApiKey, ui.lang
    )
    testResult.value = text.trim() ? `✅ ${text.trim().slice(0, 60)}` : '✅ OK'
  } catch (e) {
    testResult.value = `❌ ${(e as Error).message}`
  } finally {
    testing.value = false
  }
}

const serverUrl = ref('')
const currentServerUrl = computed(() =>
  Capacitor.isNativePlatform() ? serverUrl.value : (typeof window !== 'undefined' ? window.location.origin : '')
)

onMounted(async () => {
  if (Capacitor.isNativePlatform()) {
    const { value } = await Preferences.get({ key: 'serverUrl' })
    serverUrl.value = value ?? ''
  }
  try {
    backupStatus.value = await api.backup.status()
  } catch { /* non-critical */ }
  try {
    const cdCfg = await api.caldav.getConfig()
    if (cdCfg.server_url)    caldavCfg.value.server_url    = cdCfg.server_url    as string
    if (cdCfg.nc_username)   caldavCfg.value.nc_username   = cdCfg.nc_username   as string
    if (cdCfg.nc_password)   caldavCfg.value.nc_password   = cdCfg.nc_password   as string
    if (cdCfg.calendar_name) caldavCfg.value.calendar_name = cdCfg.calendar_name as string
    if (cdCfg.sync_reuniones !== undefined) caldavCfg.value.sync_reuniones = cdCfg.sync_reuniones as boolean
    if (cdCfg.sync_plazos    !== undefined) caldavCfg.value.sync_plazos    = cdCfg.sync_plazos    as boolean
    caldavLastSync.value = (cdCfg.last_sync as string) ?? null
  } catch { /* non-critical */ }
})

async function changeServer() {
  await Preferences.remove({ key: 'serverUrl' })
  window.location.reload()
}

function toggleDay(d: number) {
  const ds = cfg.config.diasLaborables
  const i  = ds.indexOf(d)
  if (i === -1) ds.push(d)
  else ds.splice(i, 1)
  doSave()
}

async function exportData() {
  exporting.value = true
  try {
    const result: Record<string, unknown> = {
      _export_version: 1,
      _export_date: new Date().toISOString(),
    }
    for (const key of EXPORT_KEYS) {
      const { value } = await api.storage.get(key)
      if (value) {
        try { result[key] = JSON.parse(value) } catch { result[key] = value }
      }
    }
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `agenda-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}

function triggerImport() { importInput.value?.click() }

function fmtBackupDate(iso: string | null): string {
  if (!iso) return T.value.backupNever
  const d = new Date(iso)
  return d.toLocaleString(ui.lang === 'es' ? 'es-ES' : 'en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

async function runBackup() {
  backingUp.value = true
  backupMsg.value = ''
  try {
    await api.backup.run()
    backupStatus.value = await api.backup.status()
    backupMsg.value = T.value.backupDone
    setTimeout(() => { backupMsg.value = '' }, 3000)
  } catch (e) {
    backupMsg.value = `❌ ${(e as Error).message}`
  } finally {
    backingUp.value = false
  }
}

async function saveCaldavConfig() {
  await api.caldav.saveConfig(caldavCfg.value)
}

async function testCaldav() {
  const c = caldavCfg.value
  if (!c.server_url || !c.nc_username || !c.nc_password) {
    caldavTestMsg.value = `❌ ${T.value.caldavErrIncomplete}`; return
  }
  caldavTesting.value = true; caldavTestMsg.value = ''
  await saveCaldavConfig()
  try {
    const r = await api.caldav.test()
    if (r.ok) {
      caldavTestMsg.value = T.value.caldavOk
    } else if (r.hint === 'calendar_not_found') {
      caldavTestMsg.value = T.value.caldavErrCalNotFound
    } else if (r.hint === 'invalid_credentials') {
      caldavTestMsg.value = T.value.caldavErrCreds
    } else {
      caldavTestMsg.value = `❌ HTTP ${r.status}`
    }
  } catch (e) {
    caldavTestMsg.value = `❌ ${(e as Error).message}`
  } finally {
    caldavTesting.value = false
    setTimeout(() => { caldavTestMsg.value = '' }, 6000)
  }
}

async function discoverCaldav() {
  const c = caldavCfg.value
  if (!c.server_url || !c.nc_username || !c.nc_password) {
    caldavTestMsg.value = `❌ ${T.value.caldavErrIncomplete}`; return
  }
  caldavDiscovering.value = true; caldavCalendars.value = []; caldavTestMsg.value = ''
  await saveCaldavConfig()
  try {
    const r = await api.caldav.discover()
    if (r.ok) {
      caldavCalendars.value = r.calendars
      if (!r.calendars.length) caldavTestMsg.value = '⚠️ No se encontraron calendarios.'
    } else if (r.hint === 'invalid_credentials') {
      caldavTestMsg.value = T.value.caldavErrCreds
    } else {
      caldavTestMsg.value = `❌ HTTP error`
    }
  } catch (e) {
    caldavTestMsg.value = `❌ ${(e as Error).message}`
  } finally {
    caldavDiscovering.value = false
  }
}

async function syncCaldav() {
  caldavSyncing.value = true; caldavSyncMsg.value = ''
  await saveCaldavConfig()
  try {
    const r = await api.caldav.sync()
    caldavLastSync.value = r.last_sync
    const errs = r.errors.length ? ` (${r.errors.length} err)` : ''
    caldavSyncMsg.value = `✅ +${r.synced} −${r.deleted}${errs}`
  } catch (e) {
    caldavSyncMsg.value = `❌ ${(e as Error).message}`
  } finally {
    caldavSyncing.value = false
    setTimeout(() => { caldavSyncMsg.value = '' }, 5000)
  }
}

async function onImportFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  importStatus.value = T.value.importingMsg
  try {
    const text   = await file.text()
    const parsed = JSON.parse(text) as Record<string, unknown>
    for (const key of EXPORT_KEYS) {
      if (parsed[key] !== undefined && parsed[key] !== null) {
        await api.storage.set(key, parsed[key])
      }
    }
    importStatus.value = T.value.importedMsg
    setTimeout(() => window.location.reload(), 1200)
  } catch (e) {
    importStatus.value = `❌ ${(e as Error).message}`
  }
  if (importInput.value) importInput.value.value = ''
}
</script>

<template>
  <div style="max-width:620px;margin:0 auto;padding:1.3rem 1.2rem">
    <h2 class="config-title">
      {{ T.configTitle }}
      <span v-if="saveStatus" class="save-badge" :class="saveStatus">
        {{ saveStatus === 'saving' ? '…' : saveStatus === 'saved' ? '✓ ' + (ui.lang==='es'?'Guardado':'Saved') : '✗ Error' }}
      </span>
    </h2>
    <p class="config-sub">{{ T.configSub }}</p>

    <!-- Work schedule -->
    <div class="config-block">
      <div class="config-section-title">{{ T.jornadaSection }}</div>
      <div class="config-row">
        <span class="config-row-label">{{ T.jornadaStart }}</span>
        <input type="time" class="config-time" v-model="cfg.config.jornadaInicio" @change="saveSchedule()" />
      </div>
      <div class="config-row">
        <span class="config-row-label">{{ T.jornadaEnd }}</span>
        <input type="time" class="config-time" v-model="cfg.config.jornadaFin" @change="saveSchedule()" />
      </div>
    </div>

    <!-- Lunch break -->
    <div class="config-block">
      <div class="config-section-title">{{ T.pausaSection }}</div>
      <div class="config-row">
        <span class="config-row-label">{{ T.pausaToggle }}</span>
        <div style="display:flex;gap:.4rem">
          <button class="toggle-btn" :class="cfg.config.pausaComida?'on':'off'"
            @click="cfg.config.pausaComida=true; doSave()">{{ T.yes }}</button>
          <button class="toggle-btn" :class="!cfg.config.pausaComida?'on':'off'"
            @click="cfg.config.pausaComida=false; doSave()">{{ T.no }}</button>
        </div>
      </div>
      <template v-if="cfg.config.pausaComida">
        <div class="config-row">
          <span class="config-row-label">{{ T.pausaStart }}</span>
          <input type="time" class="config-time" v-model="cfg.config.pausaInicio" @change="saveSchedule()" />
        </div>
        <div class="config-row">
          <span class="config-row-label">{{ T.pausaEnd }}</span>
          <input type="time" class="config-time" v-model="cfg.config.pausaFin" @change="saveSchedule()" />
        </div>
      </template>
    </div>

    <!-- Schedule error -->
    <div v-if="scheduleError" class="config-error">⚠️ {{ scheduleError }}</div>

    <!-- Work days -->
    <div class="config-block">
      <div class="config-section-title">{{ T.diasSection }}</div>
      <div class="days-grid">
        <button v-for="(name, i) in T.dias" :key="i"
          class="day-btn" :class="{ active: cfg.config.diasLaborables.includes(i) }"
          @click="toggleDay(i)">{{ name }}</button>
      </div>
      <div class="config-row" style="margin-top:.6rem">
        <span class="config-row-label">{{ T.weekStartLabel }}</span>
        <div style="display:flex;gap:.4rem">
          <button class="toggle-btn" :class="cfg.config.weekStart===0?'on':'off'"
            @click="cfg.config.weekStart=0; doSave()">{{ T.weekStartSun }}</button>
          <button class="toggle-btn" :class="cfg.config.weekStart===1?'on':'off'"
            @click="cfg.config.weekStart=1; doSave()">{{ T.weekStartMon }}</button>
        </div>
      </div>
    </div>

    <!-- Additional notes -->
    <div class="config-block">
      <div class="config-section-title">{{ T.notasSection }}</div>
      <textarea class="config-textarea" rows="3" v-model="cfg.config.notas"
        :placeholder="T.notasPlaceholder" @input="doSave()"></textarea>
      <p class="config-hint">{{ T.notasHint }}</p>
    </div>

    <!-- Summary -->
    <div class="config-summary" style="margin-bottom:1.2rem">{{ summary }}</div>

    <!-- AI Provider -->
    <div class="config-block">
      <div class="config-section-title">🤖 IA</div>

      <div class="config-row">
        <span class="config-row-label">{{ T.providerLabel }}</span>
        <div class="prov-grid">
          <button v-for="(prov, key) in cfg.providers" :key="key"
            class="prov-btn" :class="{ active: cfg.config.iaProvider===key }"
            @click="cfg.config.iaProvider=key; cfg.config.iaModel=cfg.providers[key]?.default_model ?? ''; doSave()">
            {{ prov.name }}
            <span v-if="prov.free" class="prov-free">FREE</span>
          </button>
        </div>
      </div>

      <div v-if="cfg.currentProvider()" class="config-row">
        <span class="config-row-label">{{ T.modelLabel }}</span>
        <select class="config-time" v-model="cfg.config.iaModel" @change="doSave()">
          <option v-for="m in cfg.currentProvider()!.models" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>

      <div class="config-row" style="align-items:flex-start">
        <span class="config-row-label" style="padding-top:.3rem">API Key</span>
        <div style="flex:1;position:relative">
          <input
            :type="showKey ? 'text' : 'password'"
            class="config-time" style="width:100%;padding-right:2.2rem"
            v-model="cfg.config.iaApiKey"
            :placeholder="cfg.currentProvider()?.key_hint ?? ''"
            @input="doSave()"
          />
          <button class="show-key-btn" @click="showKey=!showKey">{{ showKey ? '🙈' : '👁️' }}</button>
        </div>
      </div>

      <div v-if="cfg.currentProvider()?.key_url" style="font-size:.73rem;color:var(--muted);padding:.4rem 0;border-bottom:1px solid var(--border)">
        🔗 {{ ui.lang==='es'?'Obtener clave:':'Get key:' }}
        <a :href="cfg.currentProvider()!.key_url" target="_blank" style="color:#4d96ff">{{ cfg.currentProvider()!.key_url }}</a>
      </div>

      <div class="config-row" style="gap:.8rem;flex-wrap:wrap">
        <button class="gen-btn" style="width:auto;padding:.55rem 1.2rem;margin:0"
          :disabled="testing" @click="testConnection()">
          {{ testing ? T.testing : T.testBtn }}
        </button>
        <span v-if="testResult" :style="`font-size:.82rem;color:${testResult.startsWith('✅')?'#6bcb77':'#ff6b6b'}`">
          {{ testResult }}
        </span>
      </div>

      <p v-if="cfg.currentProvider()?.free" style="font-size:.73rem;color:#6bcb77;padding:.3rem 0">{{ T.freeNote }}</p>
    </div>

    <!-- Language -->
    <div class="config-block">
      <div class="config-section-title">🌐 {{ ui.lang==='es'?'Idioma':'Language' }}</div>
      <div class="days-grid">
        <button class="day-btn" :class="{ active: ui.lang==='es' }" @click="ui.lang='es'">🇪🇸 Español</button>
        <button class="day-btn" :class="{ active: ui.lang==='en' }" @click="ui.lang='en'">🇬🇧 English</button>
      </div>
    </div>

    <!-- Server (all platforms) -->
    <div class="config-block">
      <div class="config-section-title">📡 {{ ui.lang==='es' ? 'Servidor' : 'Server' }}</div>
      <div class="config-row" style="align-items:flex-start">
        <span class="config-row-label">URL</span>
        <span style="font-size:.8rem;color:var(--muted);word-break:break-all;flex:1">{{ currentServerUrl }}</span>
      </div>
      <div v-if="Capacitor.isNativePlatform()" class="config-row">
        <button class="gen-btn" style="width:auto;padding:.55rem 1.2rem;margin:0" @click="changeServer()">
          🔄 {{ ui.lang==='es' ? 'Cambiar servidor' : 'Change server' }}
        </button>
      </div>
    </div>

    <!-- Export / Import -->
    <div class="config-block">
      <div class="config-section-title">{{ T.exportSection }}</div>

      <div class="config-row" style="gap:.8rem;flex-wrap:wrap">
        <button class="gen-btn" style="width:auto;padding:.55rem 1.2rem;margin:0"
          :disabled="exporting" @click="exportData()">
          {{ exporting ? T.exporting : T.exportBtn }}
        </button>
      </div>

      <div style="margin-top:.8rem">
        <p style="font-size:.73rem;color:var(--muted);margin-bottom:.5rem">{{ T.importWarning }}</p>
        <div style="display:flex;gap:.8rem;align-items:center;flex-wrap:wrap">
          <button class="gen-btn" style="width:auto;padding:.55rem 1.2rem;margin:0;background:rgba(255,107,107,.15)"
            @click="triggerImport()">
            {{ T.importBtn }}
          </button>
          <input ref="importInput" type="file" accept=".json,application/json" style="display:none"
            @change="onImportFile" />
          <span v-if="importStatus"
            :style="`font-size:.82rem;color:${importStatus.startsWith('✅') ? '#6bcb77' : importStatus.startsWith('Importand') || importStatus.startsWith('Import') ? 'var(--muted)' : '#ff6b6b'}`">
            {{ importStatus }}
          </span>
        </div>
      </div>
    </div>

    <!-- Nextcloud CalDAV -->
    <div class="config-block">
      <div class="config-section-title">{{ T.caldavSection }}</div>

      <div class="config-row">
        <span class="config-row-label">{{ T.caldavServer }}</span>
        <input type="url" class="config-time" style="flex:1" v-model="caldavCfg.server_url"
          placeholder="https://cloud.ejemplo.com" @change="saveCaldavConfig()" />
      </div>
      <div class="config-row">
        <span class="config-row-label">{{ T.caldavUser }}</span>
        <input type="text" class="config-time" style="flex:1" v-model="caldavCfg.nc_username"
          autocomplete="username" @change="saveCaldavConfig()" />
      </div>
      <div class="config-row" style="align-items:flex-start">
        <span class="config-row-label" style="padding-top:.3rem">{{ T.caldavPass }}</span>
        <div style="flex:1;position:relative">
          <input :type="showCaldavPass ? 'text' : 'password'" class="config-time"
            style="width:100%;padding-right:2.2rem"
            v-model="caldavCfg.nc_password"
            autocomplete="current-password" @change="saveCaldavConfig()" />
          <button class="show-key-btn" @click="showCaldavPass=!showCaldavPass">
            {{ showCaldavPass ? '🙈' : '👁️' }}
          </button>
        </div>
      </div>
      <div class="config-row" style="align-items:flex-start;gap:.5rem">
        <span class="config-row-label" style="padding-top:.3rem">{{ T.caldavCalendar }}</span>
        <div style="flex:1;display:flex;flex-direction:column;gap:.4rem">
          <input type="text" class="config-time" style="width:100%" v-model="caldavCfg.calendar_name"
            placeholder="personal" @change="saveCaldavConfig()" />
          <button class="gen-btn" style="width:auto;align-self:flex-start;padding:.38rem .8rem;margin:0;font-size:.75rem"
            :disabled="caldavDiscovering" @click="discoverCaldav()">
            {{ caldavDiscovering ? T.caldavDiscovering : T.caldavDiscover }}
          </button>
          <div v-if="caldavCalendars.length" class="caldav-cal-list">
            <div class="caldav-cal-label">{{ T.caldavPickCal }}</div>
            <button v-for="cal in caldavCalendars" :key="cal.slug"
              class="caldav-cal-btn"
              :class="{ active: caldavCfg.calendar_name === cal.slug }"
              @click="caldavCfg.calendar_name = cal.slug; saveCaldavConfig()">
              {{ cal.name }}<span class="caldav-cal-slug">{{ cal.slug }}</span>
            </button>
          </div>
        </div>
      </div>

      <p style="font-size:.72rem;color:var(--muted);padding:.3rem 0 .6rem;border-bottom:1px solid var(--border)">
        💡 {{ T.caldavHint }}
      </p>

      <div class="config-row" style="margin-top:.6rem;flex-wrap:wrap;gap:.5rem">
        <label class="caldav-toggle">
          <input type="checkbox" v-model="caldavCfg.sync_reuniones" @change="saveCaldavConfig()" />
          {{ T.caldavSyncMeetings }}
        </label>
        <label class="caldav-toggle">
          <input type="checkbox" v-model="caldavCfg.sync_plazos" @change="saveCaldavConfig()" />
          {{ T.caldavSyncDeadlines }}
        </label>
      </div>

      <div class="config-row" style="gap:.8rem;flex-wrap:wrap;margin-top:.4rem">
        <button class="gen-btn" style="width:auto;padding:.5rem 1rem;margin:0"
          :disabled="caldavTesting" @click="testCaldav()">
          {{ caldavTesting ? T.caldavTesting : T.caldavTest }}
        </button>
        <button class="gen-btn" style="width:auto;padding:.5rem 1rem;margin:0;background:rgba(77,150,255,.15)"
          :disabled="caldavSyncing" @click="syncCaldav()">
          {{ caldavSyncing ? T.caldavSyncing : T.caldavSync }}
        </button>
      </div>

      <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-top:.4rem">
        <span v-if="caldavTestMsg"
          :style="`font-size:.82rem;color:${caldavTestMsg.startsWith('✅')?'#6bcb77':'#ff6b6b'}`">
          {{ caldavTestMsg }}
        </span>
        <span v-if="caldavSyncMsg"
          :style="`font-size:.82rem;color:${caldavSyncMsg.startsWith('✅')?'#6bcb77':'#ff6b6b'}`">
          {{ caldavSyncMsg }}
        </span>
      </div>

      <div v-if="caldavLastSync" style="font-size:.72rem;color:var(--muted);margin-top:.4rem">
        {{ T.caldavLastSync }}: {{ new Date(caldavLastSync).toLocaleString(ui.lang==='es'?'es-ES':'en-GB') }}
      </div>
    </div>

    <!-- Backup automático -->
    <div class="config-block">
      <div class="config-section-title">{{ T.backupSection }}</div>

      <div class="config-row" style="align-items:flex-start">
        <span class="config-row-label">{{ T.backupLastLabel }}</span>
        <span style="font-size:.82rem;color:var(--muted);flex:1">
          {{ fmtBackupDate(backupStatus?.last_backup ?? null) }}
          <span v-if="backupStatus && backupStatus.file_count > 0" style="margin-left:.5rem;opacity:.6">
            ({{ backupStatus.file_count }} {{ T.backupFiles }})
          </span>
        </span>
      </div>

      <div class="config-row" style="gap:.8rem;flex-wrap:wrap">
        <button class="gen-btn" style="width:auto;padding:.55rem 1.2rem;margin:0"
          :disabled="backingUp" @click="runBackup()">
          {{ backingUp ? T.backupRunning : T.backupNow }}
        </button>
        <span v-if="backupMsg"
          :style="`font-size:.82rem;color:${backupMsg.startsWith('✅') ? '#6bcb77' : '#ff6b6b'}`">
          {{ backupMsg }}
        </span>
      </div>
    </div>
  </div>
</template>
