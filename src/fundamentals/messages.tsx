/**
 * 🧚‍♀️ How to access:
 *     - import { Messages } from '@ace/messages'
 *     - import type { MessagesProps } from '@ace/messages'
 */


import { fe } from './fe'
import { feComponent } from './feComponent'
import { defaultMessageName } from './vars'
import { For, Show, type JSX } from 'solid-js'



/**
 * Messages are `string[]` so arrays of strings
 * Messages are grouped by name: Record<string, string[]>
 * On the fe each group of messages is a Signal: Signal<string[]>
 * This component will show the messages for one group
 * @param options.name -  Messages are grouped by name
 * @param options.divProps -  Props to put on the wrapper div that already has the class `ace-messages`
 */
export const Messages = feComponent(({ name = defaultMessageName, divProps }: MessagesProps) => {
  const [messages] = fe.messages.get(name)

  return <>
    <Show when={ messages()?.length }>
      <div class="ace-messages" {...divProps}>
        <Show when={ messages().length > 1 } fallback={messages()[0]}>
          <ul>
            <For each={messages()}>{ (msg) => <li>{msg}</li> }</For>
          </ul>
        </Show>
        <button class="close" type="button" onClick={() => fe.messages.clear(name)}>x</button>
      </div>
    </Show>
  </>
})


export type MessagesProps = {
  /** Messages are grouped by name */
  name?: string
  /** Props to put on the wrapper div that already has the class `ace-messages` */
  divProps?: JSX.HTMLAttributes<HTMLDivElement>
}
