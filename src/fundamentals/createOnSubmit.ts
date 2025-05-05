/**
 * 🧚‍♀️ How to access:
 *     - import { createOnSubmit } from '@ace/createOnSubmit'
 *     - import type { OnSubmitCallback, FormDataFunction } from '@ace/createOnSubmit'
 */


import { getFE } from './fe'


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
 * @example
 * ```ts
 * const onSubmit = createOnSubmit(async (fd) => {
 *   const body = exampleSchema.parse({ email: fd('email') })
 *   await fe.POST('/api/example', { body, bitKey: 'example' }) // a bit is a boolean signal
 * })
 * ```
 * 
 * ---
 * 
 * @param callback - Async function to call on submit
 * @param callback.fd - The 1st param provided to `callback()`. `fd()` helps us get `values` from the `<form>` that was submitted, example: `fd('example')` provides the value from `<input name="example" />`
 * @param callback.event - The 2nd param provided to `callback()`. The `event`, of type `SubmitEvent`, is typically used when `fd()` is not low level enough
 */
export function createOnSubmit(callback: OnSubmitCallback) {
  const fe = getFE()

  return async function (event: SubmitEvent) {
    try {
      event.preventDefault()

      fe.messages.clearAll()

      const formData = new FormData(event.currentTarget as HTMLFormElement)
      const fd = (name: string) => formData.get(name)

      await callback(fd, event)
    } catch (e) {
      fe.messages.align(e)
    }
  }
}



/**
 * - When a form onSubmit happens, `OnSubmitCallback` happens
 */
export type OnSubmitCallback = (fd: FormDataFunction, event: SubmitEvent) => Promise<any>



/**
 * - With `name`, searches the form's input items. If there is a match, return's it's value, else returns null
 */
export type FormDataFunction = (name: string) => FormDataEntryValue | null
