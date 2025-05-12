import { onCleanup } from 'solid-js'
import { fe } from './fundamentals/fe'
import { feComponent } from './fundamentals/feComponent'


/**
 * - Ensures that messages don't carry over from page to page
 */
export const MessagesCleanup = feComponent(() => {
  onCleanup(() => {
    fe.messages.clearAll()
  })

  return <></>
})
