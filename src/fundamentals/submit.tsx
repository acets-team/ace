/**
 * 🧚‍♀️ How to access:
 *     - import { Submit } from '@ace/submit'
 *     - import type { SubmitProps } from '@ace/submit'
 */


import { Load } from './load'
import { Async } from './async'
import { Stream } from './stream'
import { Loading, type LoadingProps } from './loading'
import { Show, type Accessor, type JSX } from 'solid-js'


/**
 * ### Aria compliant submit button w/ loading spinner!
 * @example
    ```tsx
    <form onSubmit={onSubmit}>
      <label>Password</label>
      <input name="password" type="password" />      
      <Submit label="Sign In" hook={save} buttonProps={{ class: 'brand' }} />
    </form>
    ```
 * 
 * @param props.label - Button text 
 * @param props.hook -  Fetch object (`Async`, `Stream` or `Load`) that has a status prop and when it's value is loading the spinner will show
 * @param props.$button - Optional, props for `<button />` dom element w/in `<Submit />`
 * @param props.$Loading - Optional, props for the` <Loading />` component w/in `<Submit />`
 */
export const Submit = (props: {
  /** Button text */
  label: string | Accessor<string>
  /** Fetch object (`Async`, `Stream` or `Load`) that has a status prop and when it's value is loading the spinner will show */
  hook: Async<any, any> | Load<any, any, any> | Stream<any, any, any>
  /** Optional, props for `<button />` dom element w/in `<Submit />` */
  $button?: JSX.HTMLAttributes<HTMLButtonElement>
  /** Optional, props for the` <Loading />` component w/in `<Submit />` */
  $Loading?: LoadingProps
}) => {
  return <>
    <button type="submit" disabled={props.hook.status() === 'loading'} aria-busy={props.hook.status() === 'loading'} {...props.$button} >
      <Show when={props.hook.status() === 'loading'} fallback={typeof props.label === 'function' ? props.label() : props.label}>
        <span role="status" aria-live="polite">
          <Loading {...props.$Loading} />
        </span>
      </Show>
    </button>
  </>
}


export type SubmitProps = Parameters<typeof Submit>[0]
