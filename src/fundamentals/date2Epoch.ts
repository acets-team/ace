/**
 * 🧚‍♀️ How to access:
 *     - import { date2Epoch } from '@ace/date2Epoch'
 */


import type { DateLike } from './types'
import { dateLike2Date } from './dateLike2Date'


/**
 * - Convert a date to an epoch number (ms since January 1, 1970, 00:00:00 UTC)
 * @param d - If string is passed we'll put it in a `new Date()`. If number it is as an epoch already so just returned. If `Date` is passed we'll just use it to get the epoch.
 * @returns Epoch Number
 * @link https://epoch.vercel.app/
 * @link https://orm.drizzle.team/docs/guides/timestamp-default-value
 */
export function date2Epoch (d: DateLike): number {
  return dateLike2Date(d).getTime()
}
