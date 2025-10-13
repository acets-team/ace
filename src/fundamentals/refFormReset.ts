/**
 * - Inputs, selects & textareas are listening to the onInput event 
 * - When a form resets it does not dispatch onInput events
 * - This ref ensures that on form reset, each form element triggers an onInput
 */
export function refFormReset() {
  return (form: HTMLFormElement) => {
    form.addEventListener('reset', () => {
      queueMicrotask(() => { // next tick, after the browser resets the form fields
        const elements = form.querySelectorAll('input, textarea, select')

        for (const el of elements) { // trigger onInput
          const event = new Event('input', { bubbles: true })
          el.dispatchEvent(event)
        }
      })
    })
  }
}
