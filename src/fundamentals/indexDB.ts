/**
 * 🧚‍♀️ How to use:
 *   Plugin solid
 *   import { indexDB } from '@ace/indexDB'
 *   import type { IDBWrite } from '@ace/indexDB'
 */


import { isServer } from 'solid-js/web'
import { idbDefaultDbName, idbDefaultStoreName } from './vars'


/** Optimized for bulk read & write  */
export class IndexDB {
  #flushing = false
  #writeQueue: IDBWrite[] = []

  constructor() {}

  async set(write: IDBWrite) {
    if (isServer) return

    this.#writeQueue.push(write)

    if (!this.#flushing) {
      this.#flushing = true
      queueMicrotask(() => this.#flush()) // we may call set() 20 times in a second, this will bunch all those set() calls together
    }
  }

  async #flush() {
    const writes = this.#writeQueue
    this.#writeQueue = []
    this.#flushing = false

    if (writes.length === 0) return

    const grouped = new Map<string, IDBWrite[]>() // group writes by dbName + storeName

    for (const w of writes) {
      const dbName = w.dbName || idbDefaultDbName
      const storeName = w.storeName || idbDefaultStoreName
      const key = `${dbName}::${storeName}`

      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(w)
    }

    for (const [key, group] of grouped.entries()) { // process each group with one open + transaction
      const [dbName, storeName] = key.split('::')
      const db = await this.#open({ dbName, storeName })

      await new Promise<void>((resolve, reject) => {
        if (!storeName) return reject('!storeName')

        const tx = db.transaction(storeName, 'readwrite')
        const st = tx.objectStore(storeName)

        for (const w of group) {
          st.put(w.value, w.key)
        }

        tx.oncomplete = () => {
          db.close()
          resolve()
        }
        tx.onerror = () => {
          db.close()
          reject(tx.error)
        }
      })
    }
  }

  /** Get value(s) by key(s) */
  async get(keyOrKeys: string | string[], opts?: IDBOptions): Promise<Record<string, unknown>> {
    if (isServer) return {}

    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]
    const results: Record<string, unknown> = {}
    const options: IDBOptions = { dbName: idbDefaultDbName, storeName: idbDefaultStoreName, ...opts }

    const db = await this.#open(options)

    await Promise.all(keys.map(k => new Promise<void>((resolve, reject) => {
      const tx = db.transaction(options.storeName!, 'readonly')
      const store = tx.objectStore(options.storeName!)
      const r = store.get(k)

      r.onsuccess = () => { results[k] = r.result; resolve(); }
      r.onerror = () => reject(r.error)
    })))

    db.close()
    return results
  }

  #open(options: IDBOptions): Promise<IDBDatabase> {
    const o: IDBOptions = { dbName: idbDefaultDbName, storeName: idbDefaultStoreName, ...options }

    return new Promise((resolve, reject) => {
      const req = indexedDB.open(o.dbName!)

      req.onupgradeneeded = () => {
        const db = req.result

        if (!db.objectStoreNames.contains(o.storeName!)) {
          db.createObjectStore(o.storeName!)
        }
      }

      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
}


export interface IDBOptions {
  dbName?: string;
  storeName?: string;
}

export interface IDBWrite extends IDBOptions {
  key: string;
  value: unknown;
}