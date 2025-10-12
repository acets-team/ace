/**
 * 🧚‍♀️ How to access:
 *     - import { createOnSubmit } from '@ace/createOnSubmit'
 *     - import type { OnSubmitCallback, FormDataFunction } from '@ace/createOnSubmit'
 */


import { scope } from './scopeComponent'
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
 * @example
 ```ts
  const onSubmit = createOnSubmit(async ({ fd, event }) => {
    const body = kParse(signUpParser, { email: fd('email') })

    const res = await apiSignUp({ body, bitKey: 'save' }) // a bit is a boolean signal

    if (res.error?.message) showToast({type: 'danger', value: res.error.message})
    else {
      event.currentTarget.reset()
      showToast({type: 'success', value: 'Success!'})
    }
  })
  ```
 * 
 * ---
 * 
 * @param onSubmit - Async function to call on submit
 * @param onSubmit.fd - The 1st param provided to `onSubmit()`. `fd()` helps us get `values` from the `<form>` that was submitted, example: `fd('example')` provides the value from `<input name="example" />` 🚨 If the input type is a `date` OR `datetime-local` the value will be the local iso string
 * @param onSubmit.event - The 2nd param provided to `onSubmit()`. The `event`, of type `SubmitEvent`, is typically used when `fd()` is not low level enough
 * @param onError - Optional, `scope.messages.align(e)` alwaays happens on default but feel free to pass an async or not async function on error
 * @param onError.error - The error that was thrown
 */
export function createOnSubmit(onSubmit: OnSubmitCallback, onError?: OnErrorCallback) {
  return async function (event: SubmitEvent) {
    try {
      event.preventDefault()
      scope.messages.clearAll()

      if (!(event.currentTarget instanceof HTMLFormElement)) throw new Error('Please ensure onSubmit is on a <form> element')

      const formData = new FormData(event.currentTarget)

      /** `fd()` helps us get `values` from the `<form>` that was submitted, example: `fd('example')` provides the value from `<input name="example" />` 🚨 If the input type is a `date` the value is the local iso string */
      const fd: FormDataFunction = (name: string) => {
        if (!(event.currentTarget instanceof HTMLFormElement)) throw new Error('Please ensure onSubmit is on a <form> element')

        const value = formData.get(name)
        if (value === null || value === '') return null

        const input = event.currentTarget.elements.namedItem(name)
        if (input instanceof HTMLInputElement && typeof value === 'string' && (input.type === 'date' || input.type === 'datetime-local')) return dateFromInput(value, input.type).toISOString()

        return value
      }

      await onSubmit({ fd, event: { ...event, currentTarget: event.currentTarget } })
    } catch (e) {
      scope.messages.align(e)
      if (onError) onError(e)
    }
  }
}


/**
 * - When a form onSubmit happens, `OnSubmitCallback` happens
 */
export type OnSubmitCallback = (props: { fd: FormDataFunction, event: SubmitEvent & { currentTarget: HTMLFormElement } }) => Promise<any> | any


/**
 * - When an error happens, `OnErrorCallback` happens after `scope.messages.align(e)` by default
 */
export type OnErrorCallback = (error: any) => Promise<any> | any


/**
 * - With `name`, searches the form's input items. If there is a match, return's it's value, else returns null
 */
export type FormDataFunction = (name: string) => FormDataEntryValue | null
