/**
 * 🧚‍♀️ How to access:
 *     - import { getRequestEvent } from '@ace/getRequestEvent'
 *     - import type { HTTPEvent } from '@ace/getRequestEvent'
 */


import { getRequestEvent as solidGetRequestEvent } from 'solid-js/web'


/** Not having a request event when we need it is a problem, that's lovely to know, so we throw an error immediately */
export function getRequestEvent() {
  const requestEvent = solidGetRequestEvent()
  if (!requestEvent) throw new Error('!getRequestEvent()')
  return requestEvent
}


/** This is the type for getRequestEvent().nativeEvent */
export type { HTTPEvent } from 'vinxi/http'
