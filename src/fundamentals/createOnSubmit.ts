/**
 * 🧚‍♀️ How to access:
 *     - import { createOnSubmit } from '@ace/createOnSubmit'
 *     - import type { OnSubmitCallback, FormDataFunction } from '@ace/createOnSubmit'
 */


import { useScope } from './useScope'
import { dateFromInput } from './dateFromInput'


/**
 * - `createOnSubmit()`:
 *     - Provides a `fd()` function, to get form data values
 *     - Calls `event.preventDefault()`
 *     - Clears previous messages
 *     - Places `callback()` w/in a `try/catch`
 *     - & then on error, aligns BE messages w/ FE signals
 * 
 * ---
 * 
 * ### If submitting store data
 * @example
  ```ts
    const {sync, store} = useStore()

    const save = new Async(apiSaveChatMessage)
    
    const onSubmit = createOnSubmit(async ({ event }) => {
      const body = vParser.body(info.parser, { chatMessage: store.chatMessage })

      const res = await save.run({ body })

      if (res.data) {
        event.target.reset() // reset form
        sync('chatMessages', mergeArrays(store.chatMessages, res.data))
      }
    })
  ```
 * 
 * ---
 * 
 * ### If submitting form data
 * @example
  ```ts
  const save = new Async(apiFormData)

  const onSubmit = createOnSubmit(async ({ fd, event, formData }) => {
    const body = vParser.body(info.parser, { 
      email: fd('email'),
      picture: fd('picture'),
      expiration: fd('expiration'),
    })

    // IF input type is date AND you'd like to send data to BE in the local timezone THEN
    // override the form data value w/ the fd() value
    // b/c fd() gives the date in the local timezone!
    // Helpful when we wanna insert a date into the db w/ the browser timezone and not the server timezone
    formData.set('expiration', body.expiration)

    const res = await save.fd(formData)
    event.target.reset() // reset form
    console.log('res', res)
  })
  ```
 * 
 * ---
 * 
 * @param onSubmit - Async function to call on submit
 * @param onSubmit.fd - The 1st param provided to `onSubmit()`. `fd()` helps us get `values` from the `<form>` that was submitted, example: `fd('example')` provides the value from `<input name="example" />` 🚨 If the input type is a `date` OR `datetime-local` the value will be the local iso string
 * @param onSubmit.event - The 2nd param provided to `onSubmit()`. The `event`, of type `SubmitEvent`, is typically used when `fd()` is not low level enough
 * @param onError - Optional, `scope.messages.align(e)` always happens on default but feel free to pass an async or not async function on error
 * @param onError.error - The error that was thrown
 */
export function createOnSubmit(onSubmit: OnSubmitCallback, onError?: OnErrorCallback) {
  const scope = useScope() // must be outside the async function or else hydration error

  return async function (event: SubmitEvent) {
    try {
      event.preventDefault()
      scope.messages.clearAll()

      const form = event.target // currentTarget turns into the html doc after async but target does not
      if (!(form instanceof HTMLFormElement)) throw new Error('Please ensure onSubmit is on a <form> element')

      const formData = new FormData(form)

      /** 
       * - `fd()` helps us get `values` from the `<form>` that was submitted
       * - Example: `fd('example')` provides the value from `<input name="example" />`
       * - 🚨 If the input type is a `date` the value is the local iso string
       * - 🚨 If the input type is a `checkbox` an array of name values is provided for each that is checked ex: `['dark']`
       */
      const fd: FormDataFunction = (name: string) => {
        const values = formData.getAll(name)

        const input = form.elements.namedItem(name)

        if (input instanceof RadioNodeList || (input instanceof HTMLSelectElement && input.multiple)) {
          return values
        }

        if (input instanceof HTMLInputElement) {
          if ((input.type === 'date' || input.type === 'datetime-local') && typeof values[0] === 'string' && values[0]) {
            return dateFromInput(values[0], input.type).toISOString()
          }

          if (input.type === 'file') {
            if (input.multiple) return input.files ? Array.from(input.files) : []
            else if (input.files?.[0] !== undefined) return input.files[0]
            else return null
          }

          if (input.type === 'checkbox') {
            return values
          }
        }

        return values[0] ?? null
      }

      await onSubmit({ fd, formData, event: event as SubmitEvent & { target: HTMLFormElement } })
    } catch (e) {
      scope.messages.align(e)
      if (onError) await onError(e)
    }
  }
}


/**
 * - When a form onSubmit happens, `OnSubmitCallback` happens
 */
export type OnSubmitCallback = (props: { fd: FormDataFunction, formData: FormData, event: SubmitEvent & { target: HTMLFormElement } }) => Promise<any> | any


/**
 * - When an error happens, `OnErrorCallback` happens after `scope.messages.align(e)` by default
 */
export type OnErrorCallback = (error: any) => Promise<any> | any


/**
 * - With `name`, searches the form's input items. If there is a match, return's it's value, else returns null
 */
export type FormDataFunction = (name: string) => FormDataEntryValue | FormDataEntryValue[] | null | boolean
