/**
 * 🧚‍♀️ How to access:
 *     - import { Submit } from '@ace/submit'
 *     - import type { SubmitProps } from '@ace/submit'
 */


import { scope } from './scopeComponent'
import { Show, type JSX } from 'solid-js'
import { Loading, type LoadingProps } from './loading'


/**
 * ### Aria compliant submit button w/ loading spinner!
 * @example
    ```tsx
    <form onSubmit={onSubmit}>
      <label>Password</label>
      <input name="password" type="password" />
      <Submit label="Save" bitKey="password" buttonProps={{ class: 'brand' }} />
    </form>
    ```
 */
export const Submit = ({ label, bitKey, buttonProps, loadingProps }: SubmitProps) => {
  const isLoading = () => scope.bits.isOn(bitKey)

  return <>
    <button type="submit" disabled={isLoading()} aria-busy={isLoading()} {...buttonProps} >
      <Show when={isLoading()} fallback={label}>
        <span role="status" aria-live="polite">
          <Loading {...loadingProps} />
        </span>
      </Show>
    </button>
  </>
}


export type SubmitProps = {
  /** Button text */
  label: string
  /** Bits have a signal to determine if they are `1` or `0` and a `bitKey` to identify them w/in a `Map` */
  bitKey: string
  /** Optional, additional props for button dom element */
  buttonProps?: JSX.HTMLAttributes<HTMLButtonElement>
  /** Optional, loading props for the <Loading /> component */
  loadingProps?: LoadingProps
}
