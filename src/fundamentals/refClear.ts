/**
 * 🧚‍♀️ How to access:
 *     - import { refClear } from '@ace/refClear'
 */


import { onCleanup } from 'solid-js'
import { scope } from './scopeComponent'


/**
 * When an input has triggered the input event, clear the messages for this input, smartly
 * @param el - Element html input
 * @param value
 */
export function refClear<T extends null | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>() {
  return (el: T) => {
    if (!el) return
    let readyToClear = true

    function onBlur () {
      readyToClear = true
    }

    function onInput () {
      if (el && readyToClear) {
        readyToClear = false
        scope.messages.set({ name: el.name, value: [] })
      }
    }

    el.addEventListener('blur', onBlur)
    el.addEventListener('input', onInput)

    onCleanup(() => {
      el.removeEventListener('blur', onBlur)
      el.removeEventListener('input', onInput)
    })
  }
}
