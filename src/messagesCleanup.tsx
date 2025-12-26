import { onCleanup } from 'solid-js'
import { useScope } from './fundamentals/useScope'
import { feComponent } from './fundamentals/feComponent'


/**
 * - Ensures that messages don't carry over from page to page
 */
export const MessagesCleanup = feComponent(() => {
  const scope = useScope()

  onCleanup(() => {
    scope.messages.clearAll()
  })

  return <></>
})
