/**
 * 🧚‍♀️ How to access:
 *     - import { getData, getErrorMessage } from '@ace/responseHelpers'
 */


import { APIResponse } from './types'


/**
 * Get data from `load or api` function
 * @example
    ```ts
    const contractLoad = load(() => apiGetContract({ params }), 'contract')

    createEffect(() => {
      const contractData = getData(contractLoad())
      if (!contractData) return

      contractData.parties.forEach(party => {
        console.log(party)
      })
    })
    ```
 * @example
    ```tsx
    <For each={getData(contractLoad())}>{
      (section) => <>
        <div>{section.id}</div>
      </>
    }</For>
    ```
 */
export function getData<T>(res?: APIResponse<T> | T | null): T | null {
  if (!res) return null
  if ((res as APIResponse<T>)?.data !== undefined) return (res as APIResponse<T>).data
  return res as T
}


/**
 * Get error message from `load or api` function
 * @example
    ```ts
    const errorMessage = getErrorMessage(await apiExample({ body, bitKey: 'save' }))
    if (errorMessage) showToast('info', errorMessage)
    ```
 */
export function getErrorMessage<T>(res?: APIResponse<T> | null): string | null {
  return res?.error?.message ?? null
}
