/**
 * 🧚‍♀️ How to access:
 *     - import { createQueryKey } from '@ace/createQueryKey'
 */


import type { AceKey } from './types'


export function createAceKey(queryKey?: AceKey): string {
  let result = ''

  if (typeof queryKey === 'string') result = queryKey
  else if (Array.isArray(queryKey)) result = queryKey.join(':')

  return result
}
