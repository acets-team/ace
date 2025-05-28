/**
 * 🧚‍♀️ How to access:
 *     - import { Submit } from '@ace/submit'
 *     - import type { SubmitProps } from '@ace/submit'
 */


import { fe } from './fe'
import { Show, type JSX } from 'solid-js'


/**
 * - Button w/ type `"submit"`
 * - Hides `label` and shows `<span class={loadClass}></span>` when `fe.bits.isOn(bitKey)` is `true` ✅
 * - For the loadClass `ace-load` or `ace-load--two` add to your `app.tsx` => `import '@ace/load.styles.css'`
 * - All additional props given to the component flow to the `<button>`
 * @example
    ```tsx
    <form onSubmit={onSubmit}>
      <label>Password</label>
      <input name="password" type="password" />
      <Submit label="Save" bitKey="password" class="btn" />
    </form>
    ```
 */
export const Submit = ({ label, bitKey, loadClass = 'ace-load', ...buttonProps }: SubmitProps) => {
  return <>
    <button type="submit" disabled={fe.bits.isOn(bitKey)} {...buttonProps} >
      <Show when={fe.bits.isOn(bitKey)} fallback={label}>
        <span class={loadClass}></span>
      </Show>
    </button>
  </>
}


export type SubmitProps = JSX.HTMLAttributes<HTMLButtonElement> & {
  /** Button text */
  label: string
  /** Bits have a signal to determine if they are `1` or `0` and a `bitKey` to identify them w/in a `Map` */
  bitKey: string
  /** When loading a span will show, this is the class to put on that span, default is  `ace-load`, another recommended is `ace-load--two` */
  loadClass?: string
}
