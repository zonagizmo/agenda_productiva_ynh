const DB_NAME = 'agenda-offline'
const DB_VER  = 1
let _db: IDBDatabase | null = null
let _opening: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db)
  if (_opening) return _opening
  _opening = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('cache')) db.createObjectStore('cache')
      if (!db.objectStoreNames.contains('queue')) db.createObjectStore('queue', { keyPath: 'key' })
    }
    req.onsuccess  = () => { _db = req.result; resolve(_db) }
    req.onerror    = () => reject(req.error)
  })
  return _opening
}

export async function idbGet(key: string): Promise<string | null> {
  try {
    const db = await openDB()
    return await new Promise(resolve => {
      const req = db.transaction('cache', 'readonly').objectStore('cache').get(key)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror   = () => resolve(null)
    })
  } catch { return null }
}

export async function idbSet(key: string, value: string): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('cache', 'readwrite')
      tx.objectStore('cache').put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror    = () => reject(tx.error)
    })
  } catch { /* ignore */ }
}

export async function idbEnqueue(key: string, value: string): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('queue', 'readwrite')
      tx.objectStore('queue').put({ key, value, ts: Date.now() })
      tx.oncomplete = () => resolve()
      tx.onerror    = () => reject(tx.error)
    })
  } catch { /* ignore */ }
}

export async function idbGetQueue(): Promise<Array<{ key: string; value: string; ts: number }>> {
  try {
    const db = await openDB()
    return await new Promise(resolve => {
      const req = db.transaction('queue', 'readonly').objectStore('queue').getAll()
      req.onsuccess = () => resolve(req.result ?? [])
      req.onerror   = () => resolve([])
    })
  } catch { return [] }
}

export async function idbDequeueKey(key: string): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>(resolve => {
      const tx = db.transaction('queue', 'readwrite')
      tx.objectStore('queue').delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror    = () => resolve()
    })
  } catch { /* ignore */ }
}

export async function idbQueueCount(): Promise<number> {
  try {
    const db = await openDB()
    return await new Promise(resolve => {
      const req = db.transaction('queue', 'readonly').objectStore('queue').count()
      req.onsuccess = () => resolve(req.result)
      req.onerror   = () => resolve(0)
    })
  } catch { return 0 }
}
