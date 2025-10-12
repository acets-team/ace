/**
 * 🧚‍♀️ How to access:
 *     - import { Messages } from '@ace/messages'
 *     - import type { MessagesProps } from '@ace/messages'
 */


import { scope } from './scopeComponent'
import { feComponent } from './feComponent'
import { defaultMessageName } from './vars'
import { For, Show, type JSX } from 'solid-js'



/**
 * - Messages are: `string[]`
 * - Messages are grouped by name: `Record<string, Signal<string[]>>`
 * - This component will show the messages for one group
 * @param options.name -  Messages are grouped by name
 * @param options.$div -  Props to put on the wrapper div that already has the class `ace-messages`
 */
export const Messages = feComponent(({ name = defaultMessageName, $div }: {
  /** Messages are grouped by name */
  name?: string
  /** Props to put on the wrapper div that already has the class `ace-messages` */
  $div?: JSX.HTMLAttributes<HTMLDivElement>
}) => {
  const [messages] = scope.messages.get(name)

  return <>
    <Show when={ messages()?.length }>
      <div class="ace-messages" {...$div}>
        <Show when={ messages().length > 1 } fallback={messages()[0]}>
          <ul>
            <For each={messages()}>{ (msg) => <li>{msg}</li> }</For>
          </ul>
        </Show>
        <button class="close" type="button" onClick={() => scope.messages.clear(name)}>x</button>
      </div>
    </Show>
  </>
})


export type MessagesProps = Parameters<typeof Messages>[0]
