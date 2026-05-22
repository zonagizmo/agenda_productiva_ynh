import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import type { AppConfig, Providers } from '@/types'

function defaultConfig(): AppConfig {
  return {
    jornadaInicio: '09:00', jornadaFin: '18:00',
    pausaComida: true, pausaInicio: '14:00', pausaFin: '15:00',
    diasLaborables: [1,2,3,4,5], notas: '',
    iaProvider: 'groq', iaApiKey: '', iaModel: '',
    weekStart: 1,
  }
}

export const useConfigStore = defineStore('config', () => {
  const config    = ref<AppConfig>(defaultConfig())
  const providers = ref<Providers>({})

  async function load() {
    const cfg = await api.storage.get('config-v1')
    if (cfg.value) config.value = { ...defaultConfig(), ...JSON.parse(cfg.value) as Partial<AppConfig> }
    providers.value = await api.providers()
  }

  async function save() { await api.storage.set('config-v1', config.value) }

  function currentProvider() { return providers.value[config.value.iaProvider] }
  function currentModel()    { return config.value.iaModel || currentProvider()?.default_model || '' }

  return { config, providers, load, save, currentProvider, currentModel }
})
