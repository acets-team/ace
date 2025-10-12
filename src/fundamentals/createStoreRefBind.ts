import { refs } from './refs'
import { refModel } from './refModel'
import { refClear } from './refClear'
import type { Atoms, StoreRefBind } from './types'
import type { Store, SetStoreFunction } from 'solid-js/store'


export function createStoreRefBind<T_Atoms extends Atoms>( store: Store<T_Atoms>, setStore: SetStoreFunction<T_Atoms> ): StoreRefBind<T_Atoms> {
  function refBind(...path: (string | number)[]) {
    const get = (): any => path.reduce((acc, key) => acc?.[key], store as any)
    const set = (value: any): void => {
      (setStore as (...args: any[]) => void)(...path, value)
    }
    return refs(refClear(), refModel({ get, set }))
  }

  return refBind as StoreRefBind<T_Atoms>
}
