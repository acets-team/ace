/**
 * 🧚‍♀️ How to access:
 *     - import { Submit } from '@ace/submit'
 */


import { getFE } from './fe'
import { Show, type JSX } from 'solid-js'


/**
 * - Button w/ type `"submit"`
 * - Hides `label` and shows `<span class="load"></span>` when `fe.bits.isOn(bitKey)` is `true` ✅
 * - For load styles `import '@ace/loadSpin.styles.css'` or style it however ya love!
 * @param label - To show in the button
 * @param bitKey - Bits have a signal to determine if they are `1` or `0` and a `bitKey` to identify them w/in a `Map`
 * @param ...props - All additional props are placed onto the `<button>`
 */
export const Submit = ({ label, bitKey, ...props }: { label: string, bitKey: string } & JSX.HTMLAttributes<HTMLButtonElement>) => {
  const fe = getFE()

  return <>
    <button {...props} type="submit" disabled={fe.bits.isOn(bitKey)}>
      <Show when={fe.bits.isOn(bitKey)} fallback={label}>
        <span class="load"></span>
      </Show>
    </button>
  </>
}
