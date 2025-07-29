/**
 * 🧚‍♀️ How to access:
 *     - import { BE } from '@ace/be'
 */


import { scope } from './scopeComponent'
import { revalidate } from '@solidjs/router'


/**
 * Ace provides a `load()` function, if you'd love to reload data & get a fresh dom paint w/ the new data, call `reLoad()`
 * @example
  ```
  import { load } from '@ace/load'
  import { Route } from '@ace/route'
  import { reload } from '@ace/reload'
  import { Loading } from '@ace/loading'
  import { apiCharacter } from '@ace/apis'
  import { Show, Suspense } from 'solid-js'
  import type { APIName2LoadResponse } from '@ace/types'


  export default new Route('/smooth')
    .component(({bits}) => {
      const air = load(() => apiCharacter({ pathParams: {element: 'air'}}), 'air')
      const fire = load(() => apiCharacter({pathParams: {element: 'fire'}}), 'fire')
      const earth = load(() => apiCharacter({pathParams: {element: 'earth'}}), 'earth')
      const water = load(() => apiCharacter({pathParams: {element: 'water'}}), 'water')

      return <>
        <button onClick={() => reload('elements', ['air', 'fire', 'earth', 'water'])} type="button" disabled={bits.isOn('elements')}>
          <Show when={bits.isOn('elements')} fallback="🔥 Get Fresh Data!">
            <Loading />
          </Show>
        </button>

        <div class="characters">
          <Character element={fire} />
          <Character element={water} />
          <Character element={earth} />
          <Character element={air} />
        </div>
      </>
    })


  function Character({ element }: { element: APIName2LoadResponse<'apiCharacter'> }) { // once a load has finished the character will render
    return <>
      <div class="character">
        <Suspense fallback={<div class="ace-shimmer"></div>}>
          {element()?.error?.message || element()?.data}
        </Suspense>
      </div>
    </>
  }
  ```
 * @param bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
 * @param revalidateKey - Solid Start has a `revalidate()` function that we use here, keys are the same keys passed to the `load()` function
 */
export async function reload(bitKey: string, revalidateKey: string | string[]) {
  scope.bits.set(bitKey, true)
  await revalidate(revalidateKey)
  scope.bits.set(bitKey, false)
}
