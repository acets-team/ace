/**
 * 🧚‍♀️ How to access:
 *     - import { date2Iso } from '@ace/date2Iso'
 */


import type { DateLike } from './types'
import { dateLike2Date } from './dateLike2Date'


/**
 * - Convert a date to an iso string, assumes number epoch date is in milliseconds
 * @param d - If string is passed we'll put it in a `new Date()`. If number is passed we'll see it as an epoch and pass to `new Date()`. If `Date` is passed we'll just use it to get the iso.
 * @param includeIsoTime - Optional, defaults to `true`, when true => `2025-08-01T00:50:28.809Z` when false => `2025-08-01`
 * @returns Iso String
 * @link https://epoch.vercel.app/
 * @link https://orm.drizzle.team/docs/guides/timestamp-default-value
 */
export function date2Iso (d: DateLike, includeIsoTime = true): string {
  const iso = dateLike2Date(d).toISOString()
  const res = includeIsoTime ? iso : iso.split("T")[0]

  if (typeof res !== 'string') throw new Error(`typeof res !== 'string' @ iso, d = ${d}`)
  return res
}
