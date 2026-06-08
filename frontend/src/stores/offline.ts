import { defineStore } from 'pinia'
import { ref } from 'vue'
import { idbGetQueue, idbDequeueKey, idbSet, idbQueueCount } from '@/api/idb'
import { api, apiMeta } from '@/api/client'

export const useOfflineStore = defineStore('offline', () => {
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const pending  = ref(0)
  const syncing  = ref(false)

  async function _refreshPending() {
    pending.value = await idbQueueCount()
  }

  async function syncQueue() {
    if (syncing.value) return
    const items = await idbGetQueue()
    if (!items.length) return

    syncing.value = true
    try {
      for (const item of items) {
        try {
          // rawSet bypasses the offline fallback to avoid re-queuing
          await api.storage.rawSet(item.key, item.value)
          await idbSet(item.key, item.value)    // keep cache fresh
          await idbDequeueKey(item.key)
          apiMeta.lastSaveMs = Date.now()        // suppress checkSync reload for 10s
        } catch {
          break                                  // still offline, stop
        }
      }
    } finally {
      syncing.value = false
      await _refreshPending()
    }
  }

  function init() {
    _refreshPending()
    window.addEventListener('online',  () => { isOnline.value = true;  syncQueue() })
    window.addEventListener('offline', () => { isOnline.value = false; _refreshPending() })
  }

  return { isOnline, pending, syncing, init, syncQueue }
})
