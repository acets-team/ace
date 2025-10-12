/**
 * 🧚‍♀️ How to access:
 *     - import { Submit } from '@ace/submit'
 *     - import type { SubmitProps } from '@ace/submit'
 */


import { scope } from './scopeComponent'
import { Loading, type LoadingProps } from './loading'
import { createMemo, Show, type Accessor, type JSX } from 'solid-js'


/**
 * ### Aria compliant submit button w/ loading spinner!
 * @example
    ```tsx
    <form onSubmit={onSubmit}>
      <label>Password</label>
      <input name="password" type="password" />
      <Submit label="Sign In" isLoading={() => store.signInForm.isLoading} buttonProps={{ class: 'brand' }} />
      
      <p> or </p>
      
      <Submit label="Sign In" bitKey="signInForm" buttonProps={{ class: 'brand' }} />
    </form>
    ```
 */
/**
 * 
 * @param props.label - Button text 
 * @param props.isLoading -  Optional, Accessor that can tell `<Submit /> `to show the loading indicator, either use this method or a `props.bitKey`
 * @param props.bitKey - Optional, Bits have a signal to determine if they are `1` or `0` and a `bitKey` helps us identify bit signals w/in a `Map` on `scope`, set this to have `<Submit />` show a loading icon when the particular `bitKey` is on
 * @param props.$button - Optional, props for `<button />` dom element w/in `<Submit />`
 * @param props.$Loading - Optional, props for the` <Loading />` component w/in `<Submit />`
 * @returns 
 */
export const Submit = (props: {
  /** Button text */
  label: string | Accessor<string>
  /** Optional, Accessor that can tell `<Submit /> `to show the loading indicator, either use this method or a `props.bitKey` */
  isLoading?: Accessor<boolean>
  /** Optional, Bits have a signal to determine if they are `1` or `0` and a `bitKey` helps us identify bit signals w/in a `Map` on `scope`, set this to have `<Submit />` show a loading icon when the particular `bitKey` is on */
  bitKey?: string
  /** Optional, props for `<button />` dom element w/in `<Submit />` */
  $button?: JSX.HTMLAttributes<HTMLButtonElement>
  /** Optional, props for the` <Loading />` component w/in `<Submit />` */
  $Loading?: LoadingProps
}) => {
  const isLoading = createMemo(() => {
    if (props.isLoading) return props.isLoading() // if isLoading accessor set use it
    else if (props.bitKey) return scope.bits.get(props.bitKey) // else if bitKey set use it
    else return false // else set to a none reactive false
  })

  return <>
    <button type="submit" disabled={isLoading()} aria-busy={isLoading()} {...props.$button} >
      <Show when={isLoading()} fallback={typeof props.label === 'function' ? props.label() : props.label}>
        <span role="status" aria-live="polite">
          <Loading {...props.$Loading} />
        </span>
      </Show>
    </button>
  </>
}


export type SubmitProps = Parameters<typeof Submit>[0]
