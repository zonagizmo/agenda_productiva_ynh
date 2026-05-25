export type Lang     = 'es' | 'en'
export type Tab      = 'agenda' | 'tareas' | 'historial' | 'config'
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
  avisos: Aviso[]
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

export interface SectionDef {
  key: keyof Pick<DayData, 'objetivos' | 'tareas' | 'reuniones' | 'plazos'>
  label: string
  icon: string
  placeholder: string
  color: string
}
