/**
 * 🧚‍♀️ How to access:
 *     - import { createQueryKey } from '@ace/createQueryKey'
 */


import type { QueryKey } from './types'


export function createQueryKey(queryKey: QueryKey): string {
  let result: string | undefined

  if (typeof queryKey === 'string') result = queryKey
  else if (Array.isArray(queryKey)) result = queryKey.join(':')

  if (!result || typeof result !== 'string') throw new Error('!queryKey created')

  return result
}
