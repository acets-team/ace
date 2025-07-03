/**
 * 🧚‍♀️ How to access:
 *     - import { createKey } from '@ace/createKey'
 */


import { createMutable, modifyMutable, reconcile } from 'solid-js/store'


/**
 * - Helpful when:
 *    - You want to render & update a DOM list
 *    - Sometimes the values will remain the same
 *    - But the references may change (ex: API responses) & you'd love fine grained reactivity
 * - When items update it'll use the `key` to compare objects, do a deep diff, if same skip, if different, update the difference
 * - How the update is done is based on the `merge` boolean prop
 * @example
  ```ts
  const [clothing, setClothing] = createKey<APIName2ResponseData<'apiClothing'>>([])

  async function onChange() {
    const res = await apiClothing({ bitKey: 'clothing' })
    if (res.data) setClothing(res.data)
  }
  ```
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
 * @param items - Default to `null`, an `empty array` or your `items`
 * @param options.key - `Optional`, defaults to `id`, Specifies the key to be used for matching items during reconciliation
 * @param options.merge - `Optional`, defaults to `false`: Solid first tries a deep compare via `key`. If it sees two objects are identical, it keeps them—no further inspection. If it sees two objects are different => w/ `merge: false`, It replaces the whole object, regardless of nested equality. w/ `merge: true`, Solid will preserve object references, & only change nested fields which is more work & unnecessary if your objects are not changing
 */
export function createKey<
  T_Union extends (Record<string, any>)[] | null,
  T_Item extends Record<string, any> = MaybeArray<NonNullable<T_Union>>,
  T_Key extends Extract<keyof T_Item, string> = Extract<keyof T_Item, string>
>(items: T_Union, options?: { key?: T_Key, merge?: boolean }): readonly [T_Union, (updated: T_Union) => void] {
  const store = createMutable<{ items: T_Union }>({ items })

  const update = (updatedItems: T_Union) => {
    if (updatedItems) modifyMutable(store, reconcile({ items: updatedItems }, options || {}))
    else store.items = null as T_Union
  }

  return [store.items, update] as const
}


type MaybeArray<T> = T extends (infer U)[]
 ? U
 : never
