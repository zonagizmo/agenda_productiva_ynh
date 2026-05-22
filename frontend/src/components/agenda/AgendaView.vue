<script setup lang="ts">
import { ref, computed } from 'vue'
import SectionCard from './SectionCard.vue'
import PlanCard from './PlanCard.vue'
import { useAgendaStore } from '@/stores/agenda'
import { useTasksStore } from '@/stores/tasks'
import { useConfigStore } from '@/stores/config'
import { useUiStore } from '@/stores/ui'
import { useNotifStore } from '@/stores/notifications'
import { LANG } from '@/i18n'
import { api } from '@/api/client'
import { callAiDirect } from '@/composables/useAiCall'
import { isToday, isPast, fmtLong, fmtShort, todayKey } from '@/composables/useDate'

const agenda = useAgendaStore()
const tasks  = useTasksStore()
const cfg    = useConfigStore()
const ui     = useUiStore()
const notif  = useNotifStore()
const T      = computed(() => LANG[ui.lang])

const generating = ref(false)
const error      = ref('')

const dayLabel = computed(() => {
  const k = agenda.selDate
  const base = isToday(k) ? T.value.today : isPast(k) ? T.value.past : T.value.upcoming
  const at   = agenda.day.generatedAt
  return at ? `${base} · ${T.value.planAt} ${new Date(at).toLocaleTimeString(ui.lang==='es'?'es-ES':'en-US',{hour:'2-digit',minute:'2-digit'})}` : base
})

async function generate() {
  if (generating.value) return
  const secs = T.value.sections
  if (!secs.some(s => agenda.day[s.key].some(x => x.texto.trim()))) { error.value = T.value.errNoContent; return }
  if (!cfg.config.iaApiKey) { error.value = ui.lang==='es'?'API key no configurada. Ve a ⚙️ Config.':'API key not set. Go to ⚙️ Config.'; return }

  generating.value = true; error.value = ''
  try {
    const body: Record<string, unknown> = {
      lang: ui.lang, fecha_larga: fmtLong(agenda.selDate, ui.lang),
      jornada_inicio: cfg.config.jornadaInicio, jornada_fin: cfg.config.jornadaFin,
      pausa_comida: cfg.config.pausaComida, pausa_inicio: cfg.config.pausaInicio, pausa_fin: cfg.config.pausaFin,
      notas_extra: cfg.config.notas,
      ...tasks.pendingForAi(agenda.selDate),
    }
    secs.forEach(s => { body[s.key] = agenda.day[s.key].map(x => ({ texto: x.texto, avisos: x.avisos })) })

    const pd = await api.buildPrompt(body)
    if (pd.error || !pd.prompt) { error.value = pd.error === 'no_content' ? T.value.errNoContent : (pd.error ?? T.value.errNoResponse); return }

    const prov = cfg.currentProvider()
    if (!prov) { error.value = 'Provider not found'; return }
    const text = await callAiDirect(pd.prompt, prov, cfg.currentModel(), cfg.config.iaApiKey, ui.lang)
    if (!text) { error.value = T.value.errNoResponse; return }
    agenda.setPlan(text)
  } catch (e) {
    error.value = (e as Error).message || T.value.errConnect
  } finally {
    generating.value = false
  }
}

const recentDays = computed(() =>
  Object.keys(agenda.data)
    .filter(k => agenda.hasPlan(k) || agenda.hasData(k))
    .sort((a,b) => b.localeCompare(a)).slice(0,6)
)
</script>

<template>
  <div id="agenda-view" style="display:flex;flex:1;overflow:hidden">

    <!-- Sidebar -->
    <div id="sidebar" :class="{ hidden: !ui.sideOpen }">
      <div class="sidebar-tabs" id="sidebar-tabs">
        <button class="sidebar-tab" :class="{ active: ui.sideTab==='cal' }" @click="ui.sideTab='cal'">📅 Cal</button>
        <button class="sidebar-tab" :class="{ active: ui.sideTab==='avisos' }" @click="ui.sideTab='avisos'">
          🔔{{ notif.collectAll(ui.lang).filter(a=>a.dt>=new Date()).length || '' }}
        </button>
      </div>
      <div class="sidebar-content">
        <template v-if="ui.sideTab==='cal'">
          <!-- Mini calendar inline for simplicity -->
          <div class="mini-cal">
            <div class="cal-header">
              <button class="cal-nav" @click="()=>{ const d=new Date(agenda.calCursor.y,agenda.calCursor.m-1); agenda.calCursor.y=d.getFullYear(); agenda.calCursor.m=d.getMonth() }">‹</button>
              <span class="cal-month" style="text-transform:capitalize">
                {{ new Date(agenda.calCursor.y,agenda.calCursor.m,1).toLocaleDateString(ui.lang==='es'?'es-ES':'en-US',{month:'long',year:'numeric'}) }}
              </span>
              <button class="cal-nav" @click="()=>{ const d=new Date(agenda.calCursor.y,agenda.calCursor.m+1); agenda.calCursor.y=d.getFullYear(); agenda.calCursor.m=d.getMonth() }">›</button>
            </div>
            <div class="cal-grid">
              <div v-for="d in (ui.lang==='es'?['D','L','M','X','J','V','S']:['S','M','T','W','T','F','S']).slice(cfg.config.weekStart).concat((ui.lang==='es'?['D','L','M','X','J','V','S']:['S','M','T','W','T','F','S']).slice(0,cfg.config.weekStart))" :key="d" class="cal-dow">{{ d }}</div>
              <div v-for="i in ((new Date(agenda.calCursor.y,agenda.calCursor.m,1).getDay()-cfg.config.weekStart+7)%7)" :key="'e'+i"></div>
              <button
                v-for="d in new Date(agenda.calCursor.y,agenda.calCursor.m+1,0).getDate()" :key="d"
                class="cal-day"
                :class="{ today: `${agenda.calCursor.y}-${String(agenda.calCursor.m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`===todayKey(), sel: `${agenda.calCursor.y}-${String(agenda.calCursor.m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`===agenda.selDate }"
                @click="agenda.selDate=`${agenda.calCursor.y}-${String(agenda.calCursor.m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`"
              >{{ d }}</button>
            </div>
            <div class="cal-legend">{{ T.calLegend }}</div>
          </div>
          <button class="goto-today" @click="agenda.selDate=todayKey()">{{ T.goToday }}</button>
          <button
            v-for="k in recentDays" :key="k"
            class="recent-day" :class="{ sel: k===agenda.selDate }"
            @click="agenda.selDate=k"
          >
            <span style="text-transform:capitalize">{{ fmtShort(k,ui.lang) }}{{ isToday(k)?' · '+(ui.lang==='es'?'hoy':'today'):'' }}</span>
            <span class="recent-dots">
              <span v-if="agenda.hasPlan(k)" class="rdot" style="background:#6bcb77"></span>
            </span>
          </button>
        </template>

        <template v-else>
          <div class="notif-status" :style="`background:${notif.perm==='granted'?'#6bcb7718':'#ff9f4318'};border:1px solid ${notif.perm==='granted'?'#6bcb7744':'#ff9f4344'}`">
            <span v-if="notif.perm==='granted'" style="color:#6bcb77;font-size:.7rem">{{ T.notifStatusGranted }}</span>
            <span v-else-if="notif.perm==='denied'" style="color:#ff6b6b;font-size:.7rem">{{ T.notifStatusDenied }}</span>
            <div v-else style="display:flex;justify-content:space-between;align-items:center">
              <span style="color:#ff9f43;font-size:.72rem">{{ T.notifStatusDefault }}</span>
              <button class="notif-activate" @click="notif.request()">{{ T.notifActivate }}</button>
            </div>
          </div>
          <div v-if="!notif.collectAll(ui.lang).length" style="text-align:center;padding:1.5rem .5rem;color:var(--muted)">
            <p style="font-size:1.4rem">🔕</p>
            <p style="font-size:.8rem">{{ T.noAvisos }}</p>
            <p style="font-size:.72rem">{{ T.noAvisosHint }}</p>
          </div>
          <template v-else>
            <template v-for="group in ['upcoming','past']" :key="group">
              <p style="font-size:.68rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin:.5rem 0 .3rem">
                {{ group==='upcoming'?T.upcoming_avisos:T.past_avisos }} ({{ notif.collectAll(ui.lang).filter(a=>group==='upcoming'?a.dt>=new Date():a.dt<new Date()).length }})
              </p>
              <div
                v-for="av in notif.collectAll(ui.lang).filter(a=>group==='upcoming'?a.dt>=new Date():a.dt<new Date())"
                :key="av.id"
                class="aviso-card" :class="{ dim: group==='past' }"
                :style="`background:${group==='past'?'var(--bg)':'var(--card)'};border-color:${av.prioridad==='alta'?'#ff6b6b44':av.prioridad==='media'?'#ff9f4344':'#6bcb7744'};border-left-color:${av.prioridad==='alta'?'#ff6b6b':av.prioridad==='media'?'#ff9f43':'#6bcb77'}`"
                @click="if(av.dateKey){agenda.selDate=av.dateKey;ui.sideTab='cal'}"
              >
                <div class="aviso-card-title">{{ av.texto }}</div>
                <div class="aviso-card-sub">{{ av.icon }} {{ av.label }}{{ av.itemTexto?' · '+av.itemTexto.slice(0,28):'' }}</div>
                <div class="aviso-card-time">📅 {{ av.fecha }} 🕐 {{ av.hora }}</div>
              </div>
            </template>
          </template>
        </template>
      </div>
    </div>

    <!-- Main panel -->
    <div id="main-panel">
      <div class="main-inner fade">
        <!-- Notif banner -->
        <div v-if="notif.perm==='default'" class="notif-banner warn">
          <span>{{ T.notifBannerText }}</span>
          <button class="notif-activate" @click="notif.request()">{{ T.notifActivate }}</button>
        </div>
        <div v-else-if="notif.perm==='denied'" class="notif-banner error">🔕 {{ T.notifDeniedText }}</div>

        <!-- Date header -->
        <div class="date-header">
          <div>
            <div class="date-title">{{ fmtLong(agenda.selDate, ui.lang) }}</div>
            <div class="date-sub">{{ dayLabel }}</div>
          </div>
          <div class="day-nav">
            <button class="day-nav-btn" @click="agenda.navigate(-1)">‹</button>
            <button class="day-nav-btn" @click="agenda.navigate(1)">›</button>
          </div>
        </div>

        <!-- Sections -->
        <div class="sections-card">
          <SectionCard v-for="sec in T.sections" :key="sec.key" :section="sec" :dayKey="agenda.selDate" />
        </div>

        <!-- Error -->
        <div v-if="error" class="error-banner">⚠️ {{ error }}</div>

        <!-- Generate button -->
        <button v-if="!agenda.day.plan" class="gen-btn" :disabled="generating" @click="generate">
          <div v-if="generating" class="spinner"></div>
          {{ generating ? T.generating : T.genBtn }}
        </button>

        <!-- Plan -->
        <PlanCard v-if="agenda.day.plan" :plan="agenda.day.plan"
          @regen="generate" @delete="agenda.setPlan(null)" />
      </div>
    </div>
  </div>
</template>
