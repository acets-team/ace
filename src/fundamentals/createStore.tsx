import type { Atom } from './atom'
import { isServer } from 'solid-js/web'
import { IDBOptions, IndexDB } from './indexDB'
import { createStoreRefBind } from './createStoreRefBind'
import { createStoreProduce } from './createStoreProduce'
import { createStoreReconcile } from './createStoreReconcile'
import { idbDefaultDbName, idbDefaultStoreName } from './vars'
import type { Atoms, BaseStoreContext, InferAtom } from './types'
import { createContext, onMount, useContext, type JSX } from 'solid-js'
import { unwrap, createStore as createSolidStore, SetStoreFunction as SetSolidStore } from 'solid-js/store'



export function createStore<T_Atoms extends Atoms>(createStoreProps: { atoms: T_Atoms, idbDbName?: string, idbStoreName?: string }) {
  const idb = new IndexDB()
  const StoreContext = createContext<BaseStoreContext<T_Atoms>>()
  const idbOpts: IDBOptions = { dbName: createStoreProps.idbDbName ?? idbDefaultDbName, storeName: createStoreProps.idbStoreName ?? idbDefaultStoreName }

  const StoreProvider = (providerProps: { children: JSX.Element }) => {
    const init = Object.fromEntries(
      Object.entries(createStoreProps.atoms).map(([k, v]) => [k, v.init])
    ) as { [K in keyof T_Atoms]: InferAtom<T_Atoms[K]> }

    const [store, setStore] = createSolidStore(init)

    // --- persist function ---
    function save<K extends keyof T_Atoms>(key: K) {
      const atom = createStoreProps.atoms[key]
      if (!atom || atom.save === 'm' || isServer) return
      const value = unwrap(store[key])
      persist(key as string, value, atom, idbOpts, idb)
    }

    const set: typeof setStore = (...args: any[]) => {
      // Forward all arguments to the original setStore function.
      // The type of setStore is complex and overloaded, so this is the safest way.
      ; (setStore as Function)(...args)
      const key = args[0]
      // Automatically persist if the first argument is a string and a valid key.
      // This handles calls like `set('myKey', newValue)` or `set('myKey', 'nested', newValue)`.
      if (typeof key === 'string' && key in createStoreProps.atoms) {
        save(key as keyof T_Atoms)
      }
    }


    const context: BaseStoreContext<T_Atoms> = {
      idb,
      set,
      save,
      store,
      setStore,
      atoms: createStoreProps.atoms,
      copy: createStoreProduce(setStore, save),
      refBind: createStoreRefBind(store, setStore),
      sync: createStoreReconcile(setStore, save),
    }

    onMount(() => loadStore({ idb, set, store, atoms: createStoreProps.atoms }))

    return <>
      <StoreContext.Provider value={context}>
        {providerProps.children}
      </StoreContext.Provider>
    </>
  }

  /**
   * - `useStore()` gives back a reference to the same object in memory every time
   * - `useStore()` may be called **100's** of times :)
   * @example
   * ```ts
   * const {set, save, store, reconcile, produce, refBind} = useStore()
   * ```
   * - From `useStore()`:
   *     - SolidJS provides `store` & `setStore()`: https://docs.solidjs.com/concepts/stores
   *     - Ace provides `save()`: persists an Atom
   *     - Ace provides `set()`: calls `setStore()` and then `save()`
   *     - `push()`, `reconcile()` and `produce()` call `save()`
   */
  const useStore = () => {
    const context = useContext(StoreContext)
    if (!context) throw new Error('!useContext(StoreContext)')
    return context
  }

  return { useStore, StoreProvider }
}


async function loadStore<T_Atoms extends Atoms>(props: {
  idb: IndexDB,
  atoms: T_Atoms,
  store: { [K in keyof T_Atoms]: InferAtom<T_Atoms[K]>; },
  set: SetSolidStore<{ [K in keyof T_Atoms]: InferAtom<T_Atoms[K]> }>,
}) {
  if (isServer) return

  queueMicrotask(async () => {
    const idbKeys: string[] = []
    const syncUpdates: { key: string, val: any }[] = []

    for (const [key, atom] of Object.entries(props.atoms)) {
      if (atom.save === 'm') continue
      if (atom.save === 'idb') idbKeys.push(key)
      else {
        const storage = atom.save === 'ls' ? localStorage : sessionStorage
        const raw = storage.getItem(key)
        if (raw != null) {
          const val = deserialize(atom, raw)
          if (val !== undefined) syncUpdates.push({ key, val })
        }
      }
    }

    // here we are settig values from fe persistance
    // issue is be persitance may have already spoken
    // so if the current value equals the init value (be setting has not happened) then set

    for (const update of syncUpdates) {
      const { key, val } = update

      if (props.store[key] === props.atoms[key]!.init) { // if the current value equals the init value (be setting has not happened) then set
        props.set(key as any, val)
      }
    }

    if (idbKeys.length > 0) {
      const idbResults = await props.idb.get(idbKeys)

      for (const [key, idbRawValue] of Object.entries(idbResults)) {
        if (idbRawValue != null && props.atoms[key]) { // gotta value in idb

          if (props.store[key] === props.atoms[key]!.init) {  // if the current value equals the init value (be setting has not happened) then set
            const idbParsedValue = deserialize(props.atoms[key], idbRawValue as string)
            props.set(key as any, idbParsedValue as any)
          }
        }
      }
    }
  })
}



function persist(key: string, value: any, atom: Atom<any>, idbOpts: IDBOptions, idb: IndexDB) {
  if (atom.save === 'm' || isServer) return

  const raw = serialize(atom, value)

  try {
    if (atom.save === 'ls') localStorage.setItem(key, raw)
    else if (atom.save === 'ss') sessionStorage.setItem(key, raw)
    else if (atom.save === 'idb') idb.set({ key, value: raw, ...idbOpts })
  } catch (e) {
    console.error(`Failed to persist ${key}:`, e)
  }
}



function serialize(atom: Atom<any>, value: any): string {
  if (value === undefined || value === null) return ''
  if (atom.onSerialize) return atom.onSerialize(value)

  switch (atom.is) {
    case 'string': return String(value)
    case 'number': return String(value)
    case 'boolean': return value ? '1' : '0'
    case 'date': return (value instanceof Date ? value : new Date(value)).toISOString()
    case 'json': return JSON.stringify(value)
    default: return value
  }
}


function deserialize<T>(atom: Atom<any>, raw: string | null): T | undefined {
  if (raw == null) return undefined as any

  if (atom.onDeserialize) return atom.onDeserialize(raw) as any

  switch (atom.is) {
    case 'string': return raw as any
    case 'number': {
      const num = Number(raw)
      return isNaN(num) ? undefined : (num as any)
    }
    case 'boolean': return (raw === '1' || raw === 'true') as any
    case 'date': {
      const date = new Date(raw)
      return isNaN(date.getTime()) ? undefined : (date as any)
    }
    case 'json': {
      try { return JSON.parse(raw) as any } catch { return undefined }
    }
    default: return raw as any
  }
}
