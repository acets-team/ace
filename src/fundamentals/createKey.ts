/**
 * 🧚‍♀️ How to access:
 *     - import { createKey } from '@ace/createKey'
 */


import { createEffect, type Accessor } from 'solid-js';
import { createMutable, modifyMutable, reconcile } from 'solid-js/store'


/**
 * - Helpful when:
 *    - You want to render & update a DOM list
 *    - Sometimes the values will remain the same
 *    - But the references may change (ex: API responses) & you'd love fine grained reactivity
 * - When items update it'll use the `key` to compare objects, do a deep diff, if same skip, if different, update the difference
 * - How the update is done is based on the `merge` boolean prop
 * ### API Example TS
 * @example
  ```ts
  const [clothing, setClothing] = createKey<ApiName2Data<'apiClothing'>>([])

  async function onChange() {
    const res = await apiClothing({ bitKey: 'clothing' })
    if (res.data) setClothing(res.data)
  }
  ```
 * ### API Example TSX
 * @example
  ```tsx
  <For each={clothing}>{
    (item) => <>
      <div>
        <div>ID: {item.id}</div>
        <div>Name: {item.name}</div>
        <div>Category: {item.category}</div>
      </div>
    </>  
  }</For>
  ```
 * ### Example where items update async
 * @example
  ```ts
  const [offerings] = createKey(() => [ 
    { id: 1, title: content().get(4)?.content },
    { id: 2, title: content().get(6)?.content },
  ])
  // if you wanna call the setter don't pass a function, just pass the items
  // calling the setter after the initial items resolve will update the dom
  // calling the setter before the initial items resolve will update the dom to the setter items and then once they resolve it'll update again
  ```
 * @param items - Default to `undefined`, an `empty array`, your `items` OR a function that returns your items (accessor). Only do the accessor when the items may change and not by the setter but the actual contents are async
 * @param options.key - `Optional`, defaults to `id`, Specifies the key to be used for matching items during reconciliation
 * @param options.merge - `Optional`, defaults to `false`: Solid first tries a deep compare via `key`. If it sees two objects are identical, it keeps them—no further inspection. If it sees two objects are different => w/ `merge: false`, It replaces the whole object, regardless of nested equality. w/ `merge: true`, Solid will preserve object references, & only change nested fields which is more work & unnecessary if your objects are not changing
 */
export function createKey<T extends Record<string, any>[]>( source?: T | Accessor<T>, options: { key?: Extract<keyof T[number], string>, merge?: boolean } = {} ): readonly [T, (updated: T) => void] {
  const initial: T = typeof source === 'function' // if source is undefined OR returns undefined, treat it as []
    ? ((source as Accessor<T>)() ?? []) as T
    : (source ?? []) as T

  const store = createMutable<{ items: T }>({ items: initial }) // set initial items into a mutatable store

  const setItems = (updated: T) => { // create a setItems function
    modifyMutable(store, reconcile({ items: updated }, options))
  }

  if (typeof source === 'function') { // if source is an accessor, keep in sync
    createEffect(() => {
      const next = (source as Accessor<T>)() ?? []
      setItems(next as T)
    })
  }

  return [store.items, setItems] as const // return the current array and the setter
}
