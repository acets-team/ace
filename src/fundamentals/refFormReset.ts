export function refFormReset() {
  return (form: HTMLFormElement) => {
    form.addEventListener('reset', (e) => {
      // next tick, after the browser resets the form fields
      queueMicrotask(() => {
        const elements = form.querySelectorAll<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >('input, textarea, select')

        for (const el of elements) {
          // manually trigger input sync
          const event = new Event('input', { bubbles: true })
          el.dispatchEvent(event)
        }
      })
    })
  }
}
