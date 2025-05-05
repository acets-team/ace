/**
 * 🧚‍♀️ How to access:
 *     - import { clear } from '@ace/clear'
 */


import { getFE } from './fe'
import { onCleanup } from 'solid-js'


/**
 * When an input has triggered the input event, clear the messages for this input, smartly
 * @param el - Element html input
 * @param value
 */
export function clear(el: HTMLInputElement) {
  const fe = getFE()
  let readyToClear = true

  function onBlur () {
    readyToClear = true
  }

  function onInput () {
    if (readyToClear) {
      readyToClear = false
      fe.messages.set({ name: el.name, value: [] })
    }
  }

  el.addEventListener('blur', onBlur)
  el.addEventListener('input', onInput)

  onCleanup(() => {
    el.removeEventListener('blur', onBlur)
    el.removeEventListener('input', onInput)
  })
}

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      clear: true
    }
  }
}
