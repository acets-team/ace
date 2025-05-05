import { onCleanup } from 'solid-js'
import { getFE } from './fundamentals/fe'
import { feComponent } from './fundamentals/feComponent'


/**
 * - Ensures that messages don't carry over from page to page
 */
export const MessagesCleanup = feComponent(() => {
  const fe = getFE()

  onCleanup(() => {
    fe.messages.clearAll()
  })

  return <></>
})
