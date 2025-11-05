import type { SetStoreFunction } from 'solid-js/store'
import { reconcile as solidReconcile } from 'solid-js/store'
import type { Atoms, InferAtom, StoreSync } from './types'


export function createStoreReconcile<T_Atoms extends Atoms>(setStore: SetStoreFunction<{ [K in keyof T_Atoms]: InferAtom<T_Atoms[K]> }>, save: (key: keyof T_Atoms) => void): StoreSync<T_Atoms> {
  const reconcile = ((...args: any[]) => {
    if (args.length < 2) {
      throw new Error('reconcile requires at least a key and a value')
    }

    const optsMaybe = args.at(-1)
    const valueMaybe = args.at(-2)

    const hasOpts = typeof optsMaybe === 'object' && !Array.isArray(optsMaybe) && ('merge' in optsMaybe || 'key' in optsMaybe)
    const value = hasOpts ? valueMaybe : optsMaybe
    const opts = hasOpts ? optsMaybe : undefined

    // path is everything before value + opts
    const path = args.slice(0, args.length - (hasOpts ? 2 : 1))

    if (path.length === 0) throw new Error('reconcile requires a key path')

    const topKey = path[0] as keyof T_Atoms

    const finalOpts = {
      merge: opts?.merge ?? true,
      key: opts?.key ?? 'id',
    }

    // cast to any to avoid Solid’s massive overload resolution
    ;(setStore as any).apply(
      null,
      [...path, solidReconcile(value, finalOpts)]
    )

    save(topKey)
  })

  return reconcile
}
