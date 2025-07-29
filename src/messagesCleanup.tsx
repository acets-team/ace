import { onCleanup } from 'solid-js'
import { scope } from './fundamentals/scopeComponent'
import { feComponent } from './fundamentals/feComponent'


/**
 * - Ensures that messages don't carry over from page to page
 */
export const MessagesCleanup = feComponent(() => {
  onCleanup(() => {
    scope.messages.clearAll()
  })

  return <></>
})
