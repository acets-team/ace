/**
 * 🧚‍♀️ How to access:
 *     - Plugin: solid
 *     - import { reQuery } from '@ace/reQuery'
 */


import { AceKey } from './types'
import { scope } from './scopeComponent'
import { revalidate } from '@solidjs/router'
import { createAceKey } from './createAceKey'


/**
 * - Helpful when an api was called w/ Solid's query() and you'd love to call it again
 * - Will call query() again to each of the keys requested simultaneously
 */
export async function reQuery(props: {key?: AceKey, keys?: AceKey[], bitKey?: string}) {
  if (props.bitKey) scope.bits.set(props.bitKey, true)
  
  const keys = props.keys ? props.keys : []

  if (props.key) keys.push(props.key)

  if (keys.length) await Promise.all(keys.map(k => revalidate(createAceKey(k))))

  if (props.bitKey) scope.bits.set(props.bitKey, false)
}
