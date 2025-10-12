import type { SetStoreFunction } from 'solid-js/store'
import { produce as solidProduce } from 'solid-js/store'
import type { Atoms, InferAtom, StoreCopy } from './types'

export function createStoreProduce<T_Atoms extends Atoms>( setStore: SetStoreFunction<{ [K in keyof T_Atoms]: InferAtom<T_Atoms[K]> }>, save: (key: keyof T_Atoms) => void ): StoreCopy<T_Atoms> {
  const produce = ((...args: any[]) => {
    if (args.length < 2) {
      throw new Error('produce requires at least a key and a function')
    }

    const fn = args.at(-1)
    if (typeof fn !== 'function') {
      throw new Error('last argument to produce must be a function')
    }

    const path = args.slice(0, -1)
    if (path.length === 0) throw new Error('produce requires a key path')

    const topKey = path[0] as keyof T_Atoms

    // Apply solidProduce at that path
    ;(setStore as any).apply(null, [...path, solidProduce(fn)])

    save(topKey)
  })

  return produce
}
