/**
 * 🧚‍♀️ How to access:
 *     - import { createQueryKey } from '@ace/createQueryKey'
 */


import type { AceKey } from './types'


export function createAceKey(key?: AceKey): string {
  let res = ''

  if (typeof key === 'string') res = key
  else if (Array.isArray(key)) res = key.join(':')

  return res
}
