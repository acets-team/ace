/**
 * 🧚‍♀️ How to access:
 *     - import { createOnSubmit } from '@ace/createOnSubmit'
 *     - import type { OnSubmitCallback, FormDataFunction } from '@ace/createOnSubmit'
 */


import { scope } from './scopeComponent'


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
  const onSubmit = createOnSubmit(async (fd, event) => {
    const body = signUpSchema.parse({ email: fd('email') })

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
 * @param callback - Async function to call on submit
 * @param callback.fd - The 1st param provided to `callback()`. `fd()` helps us get `values` from the `<form>` that was submitted, example: `fd('example')` provides the value from `<input name="example" />`
 * @param callback.event - The 2nd param provided to `callback()`. The `event`, of type `SubmitEvent`, is typically used when `fd()` is not low level enough
 */
export function createOnSubmit(callback: OnSubmitCallback) {
  return async function (event: SubmitEvent) {
    try {
      event.preventDefault()
      scope.messages.clearAll()

      if (!(event.currentTarget instanceof HTMLFormElement)) throw new Error('Please ensure onSubmit is on a <form> element')

      const formData = new FormData(event.currentTarget)
      const fd = (name: string) => formData.get(name)

      await callback(fd, { ...event, currentTarget: event.currentTarget })
    } catch (e) {
      scope.messages.align(e)
    }
  }
}



/**
 * - When a form onSubmit happens, `OnSubmitCallback` happens
 */
export type OnSubmitCallback = (fd: FormDataFunction, event: SubmitEvent & { currentTarget: HTMLFormElement }) => Promise<any>



/**
 * - With `name`, searches the form's input items. If there is a match, return's it's value, else returns null
 */
export type FormDataFunction = (name: string) => FormDataEntryValue | null
