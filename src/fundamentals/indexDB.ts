import { isServer } from 'solid-js/web';
import { idbDefaultDbName, idbDefaultStoreName } from './vars';


// --- IndexDB Types ---

export interface IDBOptions {
  dbName?: string;
  storeName?: string;
}

interface IDBWrite extends IDBOptions {
  key: string;
  value: unknown;
}

// --- IndexDB Implementation (Optimized for Bulk Read) ---

export class IndexDB {
  #writeQueue: IDBWrite[] = [];
  #flushing = false;

  constructor() {}

  async set(write: IDBWrite) {
    if (isServer) return;
    this.#writeQueue.push(write);
    if (!this.#flushing) {
      this.#flushing = true;
      queueMicrotask(() => this.#flush());
    }
  }

  async #flush() {
    const writes = this.#writeQueue;
    this.#writeQueue = [];
    this.#flushing = false;

    for (const w of writes) {
      const dbName = w.dbName || idbDefaultDbName;
      const storeName = w.storeName || idbDefaultStoreName;
      const db = await this.#open({ dbName, storeName });

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const st = tx.objectStore(storeName);
        const r = st.put(w.value, w.key);

        r.onsuccess = () => resolve();
        r.onerror = () => reject(r.error);
        tx.oncomplete = () => db.close();
      });
    }
  }

  /** Get value(s) by key(s) */
  async get(keyOrKeys: string | string[], opts?: IDBOptions): Promise<Record<string, unknown>> {
    if (isServer) return {};

    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    const results: Record<string, unknown> = {};
    const options: IDBOptions = { dbName: idbDefaultDbName, storeName: idbDefaultStoreName, ...opts };

    const db = await this.#open(options);

    await Promise.all(keys.map(k => new Promise<void>((resolve, reject) => {
      const tx = db.transaction(options.storeName!, 'readonly');
      const store = tx.objectStore(options.storeName!);
      const r = store.get(k);

      r.onsuccess = () => { results[k] = r.result; resolve(); };
      r.onerror = () => reject(r.error);
    })));

    db.close();
    return results;
  }

  #open(opts: IDBOptions): Promise<IDBDatabase> {
    const options: IDBOptions = { dbName: idbDefaultDbName, storeName: idbDefaultStoreName, ...opts };

    return new Promise((resolve, reject) => {
      const req = indexedDB.open(options.dbName!);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(options.storeName!)) {
          db.createObjectStore(options.storeName!);
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}
