import type { Lang, SectionDef } from '@/types'

interface Translations {
  appTitle: string
  tabs: { agenda: string; tareas: string; historial: string; stats: string; config: string }
  today: string; past: string; upcoming: string; planAt: string
  sections: SectionDef[]
  addBtn: string; genBtn: string; generating: string
  planTitle: string; regen: string; delPlan: string
  histTitle: string; histEmpty: string; histStart: string; histOpen: string
  configTitle: string; configSub: string
  jornadaSection: string; jornadaStart: string; jornadaEnd: string
  pausaSection: string; pausaToggle: string; yes: string; no: string
  pausaStart: string; pausaEnd: string
  diasSection: string; dias: string[]
  notasSection: string; notasPlaceholder: string; notasHint: string
  weekStartLabel: string; weekStartSun: string; weekStartMon: string
  summaryLabel: string; summaryJornada: string; summaryTo: string; summaryPausa: string; summaryDias: string
  priors: { key: string; label: string; dot: string }[]
  aviso: string; addAviso: string; fired: string
  notifGranted: string; notifDenied: string; notifDefault: string
  notifActivate: string; notifBannerText: string; notifDeniedText: string
  notifStatusGranted: string; notifStatusDenied: string; notifStatusDefault: string
  upcoming_avisos: string; past_avisos: string; noAvisos: string; noAvisosHint: string
  calLegend: string; goToday: string; dayTasksTitle: string
  errNoContent: string; errNoResponse: string; errConnect: string
  // Tasks
  tabTareas: string; tasksTitle: string; addTask: string; taskPH: string
  pendingTasks: string; completedTasks: string; noPendingTasks: string; noTasks: string
  dueDateLabel: string; allFilter: string; addLabelToTask: string
  labelsTitle: string; addLabel: string; labelNamePH: string; backlogSection: string
  // Config AI
  providerLabel: string; modelLabel: string; testBtn: string; testing: string
  freeNote: string
  rolloverBtn: string; rolloverDone: string
  rolloverLogTitle: string; rolloverLogEmpty: string
  // Export / Import
  exportSection: string; exportBtn: string; exporting: string
  importBtn: string; importWarning: string; importingMsg: string; importedMsg: string
  // Backup
  backupSection: string; backupNow: string; backupRunning: string
  backupLastLabel: string; backupNever: string; backupFiles: string; backupDone: string
  // Stats
  statsTitle: string; statsStreak: string; statsStreakDays: string
  statsTotalDone: string; statsActiveDays: string
  statsLast14: string; statsNoData: string
  statsByDow: string; statsDow: string[]
  statsByPrio: string; statsDone: string; statsOf: string
  statsAgendaDone: string; statsTasksDone: string
  // CalDAV / Nextcloud
  caldavSection: string; caldavServer: string; caldavUser: string
  caldavPass: string; caldavCalendar: string; caldavHint: string
  caldavSyncMeetings: string; caldavSyncDeadlines: string
  caldavTest: string; caldavTesting: string; caldavSync: string; caldavSyncing: string
  caldavLastSync: string; caldavNever: string
  caldavOk: string; caldavErrIncomplete: string
}

const SECTIONS_ES: SectionDef[] = [
  { key: 'objetivos', label: 'Objetivos', icon: '🎯', placeholder: 'Añadir objetivo...', color: '#4d96ff' },
  { key: 'tareas',    label: 'Tareas',    icon: '✅', placeholder: 'Añadir tarea...',    color: '#6bcb77' },
  { key: 'reuniones', label: 'Reuniones', icon: '🗓️', placeholder: 'Añadir reunión...',  color: '#c77dff' },
  { key: 'plazos',    label: 'Plazos',    icon: '⏰', placeholder: 'Añadir plazo...',    color: '#ffd93d' },
]
const SECTIONS_EN: SectionDef[] = [
  { key: 'objetivos', label: 'Goals',     icon: '🎯', placeholder: 'Add goal...',     color: '#4d96ff' },
  { key: 'tareas',    label: 'Tasks',     icon: '✅', placeholder: 'Add task...',     color: '#6bcb77' },
  { key: 'reuniones', label: 'Meetings',  icon: '🗓️', placeholder: 'Add meeting...',  color: '#c77dff' },
  { key: 'plazos',    label: 'Deadlines', icon: '⏰', placeholder: 'Add deadline...', color: '#ffd93d' },
]

export const LANG: Record<Lang, Translations> = {
  es: {
    appTitle: 'Agenda Productiva',
    tabs: { agenda: '📅 Agenda', tareas: '📋 Tareas', historial: '📚 Historial', stats: '📊 Stats', config: '⚙️ Config' },
    today: '📍 Hoy', past: '📁 Pasado', upcoming: '📅 Próximo', planAt: 'Plan a las',
    sections: SECTIONS_ES,
    addBtn: '+ Añadir', genBtn: '⚡ Generar plan del día', generating: 'Generando...',
    planTitle: '🚀 Plan del día', regen: '↺ Regenerar', delPlan: '✕ Borrar',
    histTitle: '📚 Historial', histEmpty: 'Aún no hay días planificados.', histStart: '✏️ Empezar', histOpen: 'Abrir →',
    configTitle: '⚙️ Configuración', configSub: 'Define tu jornada laboral.',
    jornadaSection: '🕐 Horario de jornada', jornadaStart: 'Inicio', jornadaEnd: 'Fin',
    pausaSection: '🍽️ Pausa para comer', pausaToggle: 'Incluir pausa para comer', yes: 'Sí', no: 'No',
    pausaStart: 'Inicio pausa', pausaEnd: 'Fin pausa',
    diasSection: '📅 Días laborables', dias: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
    notasSection: '📝 Instrucciones adicionales', notasPlaceholder: 'Ej: Prefiero reuniones por la mañana...', notasHint: 'Se incluyen al generar cada plan.',
    weekStartLabel: 'Primer día de la semana', weekStartSun: 'Domingo', weekStartMon: 'Lunes',
    summaryLabel: 'Resumen: ', summaryJornada: 'Jornada de', summaryTo: 'a', summaryPausa: 'pausa', summaryDias: 'Días:',
    priors: [{ key:'alta', label:'Alta', dot:'🔴' }, { key:'media', label:'Media', dot:'🟡' }, { key:'baja', label:'Baja', dot:'🟢' }],
    aviso: 'Aviso:', addAviso: '+ Añadir aviso', fired: '✓ Enviado',
    notifGranted: '🔔 ON', notifDenied: '🔕', notifDefault: '🔔?',
    notifActivate: 'Activar', notifBannerText: 'Activa las notificaciones para recibir avisos.', notifDeniedText: 'Notificaciones bloqueadas en el navegador.',
    notifStatusGranted: '✓ Notificaciones activas', notifStatusDenied: '🚫 Bloqueadas', notifStatusDefault: '🔕 No activadas',
    upcoming_avisos: 'Próximos', past_avisos: 'Pasados', noAvisos: 'Sin avisos configurados.', noAvisosHint: 'Pulsa 🔔 en cualquier elemento.',
    calLegend: '🟢 Plan  🟡 Datos  🔴 Alta  🟠 Media  ● Baja', goToday: '📍 Ir a hoy', dayTasksTitle: '📋 Tareas del día',
    errNoContent: 'Añade al menos un elemento antes de generar.', errNoResponse: 'La IA no devolvió respuesta.', errConnect: 'Error al conectar.',
    tabTareas: '📋 Tareas', tasksTitle: 'Tareas', addTask: '+ Nueva tarea', taskPH: 'Descripción...',
    pendingTasks: 'Pendientes', completedTasks: 'Completadas', noPendingTasks: 'No hay tareas pendientes.', noTasks: 'Sin tareas. Pulsa «+ Nueva tarea» para empezar.',
    dueDateLabel: 'Vence', allFilter: 'Todas', addLabelToTask: '+ etiqueta',
    labelsTitle: '🏷️ Etiquetas', addLabel: '+ Nueva etiqueta', labelNamePH: 'Nombre...', backlogSection: '🔖 Tareas pendientes (backlog)',
    providerLabel: 'Proveedor', modelLabel: 'Modelo', testBtn: 'Probar conexión', testing: 'Probando...', freeNote: '✓ = Gratis con cuenta',
    rolloverBtn: '⏩ Pasar pendientes al día siguiente', rolloverDone: 'aplazado(s) al',
    rolloverLogTitle: '↩️ Aplazamientos recientes', rolloverLogEmpty: 'Sin aplazamientos registrados.',
    exportSection: '💾 Exportar / Importar datos', exportBtn: '⬇️ Exportar JSON', exporting: 'Exportando...',
    importBtn: '⬆️ Importar JSON', importWarning: 'Importar sobrescribirá todos los datos existentes.',
    importingMsg: 'Importando...', importedMsg: '✅ Importado. Recargando...',
    backupSection: '🗄️ Backup automático', backupNow: 'Backup ahora', backupRunning: 'Haciendo backup...',
    backupLastLabel: 'Último backup', backupNever: 'Nunca', backupFiles: 'archivos guardados',
    backupDone: '✅ Backup completado',
    statsTitle: '📊 Estadísticas de productividad', statsStreak: '🔥 Racha', statsStreakDays: 'días seguidos',
    statsTotalDone: '✅ Completados', statsActiveDays: '📅 Días activos',
    statsLast14: 'Últimas 2 semanas', statsNoData: 'Sin datos suficientes todavía.',
    statsByDow: 'Promedio por día de la semana', statsDow: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
    statsByPrio: 'Tareas por prioridad', statsDone: 'completadas', statsOf: 'de',
    statsAgendaDone: 'Agenda completadas', statsTasksDone: 'Tareas completadas',
    caldavSection: '📅 Nextcloud Calendar', caldavServer: 'URL Nextcloud', caldavUser: 'Usuario NC',
    caldavPass: 'Contraseña / App password', caldavCalendar: 'Nombre del calendario',
    caldavHint: 'Usa una contraseña de aplicación de Nextcloud (Ajustes → Seguridad).',
    caldavSyncMeetings: 'Sincronizar reuniones', caldavSyncDeadlines: 'Sincronizar plazos',
    caldavTest: 'Probar conexión', caldavTesting: 'Probando...', caldavSync: 'Sincronizar ahora', caldavSyncing: 'Sincronizando...',
    caldavLastSync: 'Última sync', caldavNever: 'Nunca',
    caldavOk: '✅ Conectado', caldavErrIncomplete: 'Rellena servidor, usuario y contraseña.',
  },
  en: {
    appTitle: 'Productive Agenda',
    tabs: { agenda: '📅 Agenda', tareas: '📋 Tasks', historial: '📚 History', stats: '📊 Stats', config: '⚙️ Config' },
    today: '📍 Today', past: '📁 Past', upcoming: '📅 Upcoming', planAt: 'Plan at',
    sections: SECTIONS_EN,
    addBtn: '+ Add', genBtn: '⚡ Generate day plan', generating: 'Generating...',
    planTitle: '🚀 Day Plan', regen: '↺ Regenerate', delPlan: '✕ Delete',
    histTitle: '📚 History', histEmpty: 'No days planned yet.', histStart: '✏️ Start', histOpen: 'Open →',
    configTitle: '⚙️ Settings', configSub: 'Define your work schedule.',
    jornadaSection: '🕐 Work hours', jornadaStart: 'Start', jornadaEnd: 'End',
    pausaSection: '🍽️ Lunch break', pausaToggle: 'Include lunch break', yes: 'Yes', no: 'No',
    pausaStart: 'Break start', pausaEnd: 'Break end',
    diasSection: '📅 Work days', dias: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    notasSection: '📝 Additional instructions', notasPlaceholder: 'E.g.: I prefer morning meetings...', notasHint: 'Included when generating each plan.',
    weekStartLabel: 'First day of week', weekStartSun: 'Sunday', weekStartMon: 'Monday',
    summaryLabel: 'Summary: ', summaryJornada: 'Schedule from', summaryTo: 'to', summaryPausa: 'break', summaryDias: 'Days:',
    priors: [{ key:'alta', label:'High', dot:'🔴' }, { key:'media', label:'Med', dot:'🟡' }, { key:'baja', label:'Low', dot:'🟢' }],
    aviso: 'Alert:', addAviso: '+ Add alert', fired: '✓ Sent',
    notifGranted: '🔔 ON', notifDenied: '🔕', notifDefault: '🔔?',
    notifActivate: 'Enable', notifBannerText: 'Enable notifications to receive alerts.', notifDeniedText: 'Notifications blocked in browser.',
    notifStatusGranted: '✓ Notifications active', notifStatusDenied: '🚫 Blocked', notifStatusDefault: '🔕 Not enabled',
    upcoming_avisos: 'Upcoming', past_avisos: 'Past', noAvisos: 'No alerts configured.', noAvisosHint: 'Press 🔔 on any item.',
    calLegend: '🟢 Plan  🟡 Data  🔴 High  🟠 Med  ● Low', goToday: '📍 Go to today', dayTasksTitle: "📋 Day's tasks",
    errNoContent: 'Add at least one item before generating.', errNoResponse: 'AI returned no response.', errConnect: 'Connection error.',
    tabTareas: '📋 Tasks', tasksTitle: 'Tasks', addTask: '+ New task', taskPH: 'Description...',
    pendingTasks: 'Pending', completedTasks: 'Completed', noPendingTasks: 'No pending tasks.', noTasks: 'No tasks yet. Press «+ New task» to start.',
    dueDateLabel: 'Due', allFilter: 'All', addLabelToTask: '+ label',
    labelsTitle: '🏷️ Labels', addLabel: '+ New label', labelNamePH: 'Label name...', backlogSection: '🔖 Pending backlog tasks',
    providerLabel: 'Provider', modelLabel: 'Model', testBtn: 'Test connection', testing: 'Testing...', freeNote: '✓ = Free with account',
    rolloverBtn: '⏩ Roll pending to next workday', rolloverDone: 'moved to',
    rolloverLogTitle: '↩️ Recent rollovers', rolloverLogEmpty: 'No rollovers recorded.',
    exportSection: '💾 Export / Import data', exportBtn: '⬇️ Export JSON', exporting: 'Exporting...',
    importBtn: '⬆️ Import JSON', importWarning: 'Import will overwrite all existing data.',
    importingMsg: 'Importing...', importedMsg: '✅ Imported. Reloading...',
    backupSection: '🗄️ Automatic backup', backupNow: 'Backup now', backupRunning: 'Backing up...',
    backupLastLabel: 'Last backup', backupNever: 'Never', backupFiles: 'files saved',
    backupDone: '✅ Backup complete',
    statsTitle: '📊 Productivity stats', statsStreak: '🔥 Streak', statsStreakDays: 'days in a row',
    statsTotalDone: '✅ Completed', statsActiveDays: '📅 Active days',
    statsLast14: 'Last 2 weeks', statsNoData: 'Not enough data yet.',
    statsByDow: 'Average by day of week', statsDow: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    statsByPrio: 'Tasks by priority', statsDone: 'done', statsOf: 'of',
    statsAgendaDone: 'Agenda completed', statsTasksDone: 'Tasks completed',
    caldavSection: '📅 Nextcloud Calendar', caldavServer: 'Nextcloud URL', caldavUser: 'NC Username',
    caldavPass: 'Password / App password', caldavCalendar: 'Calendar name',
    caldavHint: 'Use a Nextcloud app password (Settings → Security).',
    caldavSyncMeetings: 'Sync meetings', caldavSyncDeadlines: 'Sync deadlines',
    caldavTest: 'Test connection', caldavTesting: 'Testing...', caldavSync: 'Sync now', caldavSyncing: 'Syncing...',
    caldavLastSync: 'Last sync', caldavNever: 'Never',
    caldavOk: '✅ Connected', caldavErrIncomplete: 'Fill in server, username and password.',
  },
}
