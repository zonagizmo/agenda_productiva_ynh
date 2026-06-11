export type Lang     = 'es' | 'en'
export type Tab      = 'agenda' | 'tareas' | 'historial' | 'stats' | 'config'
export type Priority = 'alta' | 'media' | 'baja'
export type SideTab  = 'cal' | 'avisos'

export interface Aviso {
  id: string
  texto: string
  fecha: string
  hora: string
  prioridad: Priority
  fired: boolean
}

export interface AgendaItem {
  id: string
  texto: string
  done?: boolean
  deferred?: boolean
  duracion?: number
  avisos: Aviso[]
  ruleId?: string     // links to a PersistentRule if auto-created
}

export interface DayData {
  objetivos: AgendaItem[]
  tareas: AgendaItem[]
  reuniones: AgendaItem[]
  plazos: AgendaItem[]
  plan: string | null
  generatedAt: string | null
}

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Recurrence {
  type: RecurrenceType
  interval: number       // cada N unidades (1 = cada semana, 2 = cada 2 semanas…)
  startDate: string      // YYYY-MM-DD, obligatoria
  endDate: string        // YYYY-MM-DD o '' (sin fin)
  lastCompleted: string  // YYYY-MM-DD o '' (nunca completada)
}

export interface Task {
  id: string
  texto: string
  done: boolean
  prioridad: Priority
  dueDate: string
  labels: string[]
  avisos: Aviso[]
  createdAt: string
  recurrence: Recurrence | null
}

export interface Label {
  id: string
  nombre: string
  color: string
}

export interface AppConfig {
  jornadaInicio: string
  jornadaFin: string
  pausaComida: boolean
  pausaInicio: string
  pausaFin: string
  diasLaborables: number[]
  notas: string
  iaProvider: string
  iaApiKey: string
  iaModel: string
  weekStart: number
}

export interface Provider {
  name: string
  free: boolean
  url: string
  models: string[]
  default_model: string
  key_url: string
  key_hint: string
  mode: 'openai' | 'anthropic'
}

export type Providers = Record<string, Provider>

export interface RolloverEntry {
  id: string
  fromDate: string
  targetDate: string
  count: number
  items: string[]
  movedAt: string
}

export interface DayTemplate {
  id: string
  name: string
  createdAt: string
  sections: {
    objetivos: string[]
    tareas: string[]
    reuniones: string[]
    plazos: string[]
  }
}

export interface RuleSchedule {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'once'
  interval: number
  dayOfMonth?: number   // 1-31
  dayOfWeek?: number    // 0-6 (0=Sunday)
  month?: number        // 1-12
  workingDay?: boolean  // true = advance to Monday if target falls on weekend
}

export type AgendaSection = 'objetivos' | 'tareas' | 'reuniones' | 'plazos'

export interface PersistentRule {
  id: string
  naturalText: string
  taskText: string
  recurrenceDesc: string
  nextTrigger: string   // YYYY-MM-DD — next unprocessed date
  lastTriggered: string // YYYY-MM-DD or ''
  createdAt: string
  schedule: RuleSchedule
  section: AgendaSection
}

export interface SectionDef {
  key: keyof Pick<DayData, 'objetivos' | 'tareas' | 'reuniones' | 'plazos'>
  label: string
  icon: string
  placeholder: string
  color: string
}
