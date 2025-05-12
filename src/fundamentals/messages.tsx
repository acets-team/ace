/**
 * 🧚‍♀️ How to access:
 *     - import { Messages } from '@ace/messages'
 */


import { fe } from './fe'
import { feComponent } from './feComponent'
import { DEFAULT_MESSAGE_NAME } from './vars'
import { For, Show, type JSX } from 'solid-js'



/**
 * Messages are arrays of strings: string[]
 * Messages are grouped by name: Record<string, string[]>
 * On the fe each group of messages is a Signal: Signal<string[]>
 * This component will show the messages for one group
 * options.css - To give a class name to the wrapper
 * options.name - Messages are grouped by name
 */
export const Messages = feComponent(({ name = DEFAULT_MESSAGE_NAME, ...props }: { name?: string } & JSX.HTMLAttributes<HTMLDivElement>) => {
  const [messages] = fe.messages.get(name)

  return <>
    <Show when={ messages()?.length }>
      <div class="fun_messages" {...props}>
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
