/**
 * 🧚‍♀️ How to access:
 *     - import { date2Iso } from '@ace/date2Iso'
 */


import { DateLike } from './types'
import { date2Iso } from './date2Iso'


/**
 * IF d is falsy we'll give back a empty string ELSE we'll convert the date into a string value that can be given to input type `date` or `datetime-local`
 * @param d - If string is passed we'll put it in a `new Date()`. If number is passed we'll see it as an epoch and pass to `new Date()`. If `Date` is passed we'll just use it to get the iso.
 * @param type Input type
 * @returns 
 */
export function date2Input(d: DateLike, type: 'date' | 'datetime-local'): string {
  return d ? date2Iso(d).slice(0, type === 'datetime-local' ? 16 : 10) : ''
}
