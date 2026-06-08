import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import type { DayTemplate, DayData } from '@/types'

const STORAGE_KEY = 'templates-v1'

export const useTemplatesStore = defineStore('templates', () => {
  const templates = ref<DayTemplate[]>([])

  async function load() {
    const r = await api.storage.get(STORAGE_KEY)
    if (r.value) templates.value = JSON.parse(r.value) as DayTemplate[]
  }

  async function saveTemplate(name: string, day: DayData) {
    const tpl: DayTemplate = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      sections: {
        objetivos: day.objetivos.filter(i => i.texto.trim()).map(i => i.texto),
        tareas:    day.tareas.filter(i => i.texto.trim()).map(i => i.texto),
        reuniones: day.reuniones.filter(i => i.texto.trim()).map(i => i.texto),
        plazos:    day.plazos.filter(i => i.texto.trim()).map(i => i.texto),
      },
    }
    templates.value.push(tpl)
    await api.storage.set(STORAGE_KEY, templates.value)
  }

  async function removeTemplate(id: string) {
    templates.value = templates.value.filter(t => t.id !== id)
    await api.storage.set(STORAGE_KEY, templates.value)
  }

  return { templates, load, saveTemplate, removeTemplate }
})
