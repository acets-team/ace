/**
 * 🧚‍♀️ How to access:
 *     - import { queryUpdate } from '@ace/queryUpdate'
 */


import { QueryKey } from './types'
import { scope } from './scopeComponent'
import { revalidate } from '@solidjs/router'
import { createQueryKey } from './createQueryKey'


/**
 * - Helpful when an api was called w/ Solid's query() and you'd love to call it again
 * - Will call query() again to each of the keys requested simultaneously
 */
export async function queryAgain(props: {key?: QueryKey, keys?: QueryKey[], bitKey?: string}) {
  if (props.bitKey) scope.bits.set(props.bitKey, true)
  
  const keys = props.keys ? props.keys : []

  if (props.key) keys.push(props.key)

  if (keys.length) await Promise.all(keys.map(k => revalidate(createQueryKey(k))))

  if (props.bitKey) scope.bits.set(props.bitKey, false)
}
