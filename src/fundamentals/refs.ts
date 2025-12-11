/**
 * 🧚‍♀️ How to access:
 *     - import { refs } from '@ace/refs'
 */


/** 
 * - Add multiple ref functions to 1 element
 * @example
  ```ts
    let searchInput: undefined | HTMLInputElement

    <input
      type="text"
      name="query"
      ref={refs(refBind('query'), el => searchInput = el)}
      onInput={(e) => onSearchInput(e.currentTarget.value)} />
  ```
*/
export function refs<T extends undefined | null | HTMLElement>(...refs: ((el: T) => void)[]) {
  return (el: T) => refs.forEach(ref => ref(el))
}
