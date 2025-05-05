/**
 * 🧚‍♀️ How to access:
 *     - import { selectPlaceholder } from '@ace/selectPlaceholder'
 */


import { onCleanup } from 'solid-js'


/**
 * - When using an `<input>` it is common for light placeholder text and darker value text
 * - When this same functionality is not happening w/ `<select>` that can seem odd
 * - This adds that common `<input>` look and feel to  `<select>`
 * - For a smooth transition just add css to the select, example: `transition: all 0.3s;`
 * - Example `<select use:selectPlaceholder name="cars">`
 * - Example `<select use:selectPlaceholder={{ truthy: 'pink', falsy: 'yellow' }} name="cars">`
 */
export function selectPlaceholder(el: HTMLSelectElement, value: () => Value) {
  let colors: Partial<Value> = value() || {}

  function setSelectColor() {
    if (el.value === '') el.style.color = colors.falsy || 'rgb(189, 189, 189)'
    else el.style.color = colors.truthy || 'rgb(67, 66, 66)'
  }

  setSelectColor()
  const onChange = () => setSelectColor()
  el.addEventListener('change', onChange)
  onCleanup(() => el.removeEventListener('change', onChange))
}

type Value = {
  truthy?: string
  falsy?: string
}

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      selectPlaceholder: Value | true // the "| true" allows for no props to be sent to the directive
    }
  }
}
