import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tab, Lang, SideTab } from '@/types'

export const useUiStore = defineStore('ui', () => {
  const tab      = ref<Tab>('agenda')
  const lang     = ref<Lang>('es')
  const sideTab  = ref<SideTab>('cal')
  const sideOpen = ref(window.innerWidth > 640)
  const version  = ref('')

  return { tab, lang, sideTab, sideOpen, version }
})
