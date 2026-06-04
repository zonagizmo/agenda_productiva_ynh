<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useUiStore } from '@/stores/ui'
import { LANG } from '@/i18n'
import { callAiDirect } from '@/composables/useAiCall'
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
  </div>
</template>
