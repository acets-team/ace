/**
 * 🧚‍♀️ How to access:
 *     - import { datePast } from '@ace/datePast'
 */


import type { DateLike } from './types'
import { dateLike2Date } from './dateLike2Date'


/**
 * ### True if date is not now and not in the future
 * @param d - Parsed via `dateLike2Date()`
 */
export function datePast(d: DateLike) {
  return dateLike2Date(d) < new Date()
}
