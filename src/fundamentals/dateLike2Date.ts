/**
 * 🧚‍♀️ How to access:
 *     - import { dateLike2Date } from '@ace/dateLike2Date'
 */


import { DateLike } from './vanilla'


/**
 * - Recieves:
 *     - Date is already a `new Date()`
 *     - String is passed to `new Date()`
 *     - Number is `epoch` and passed to `new Date()` assumed to be in milliseconds
 * - Gives: Date object
 */
export function dateLike2Date(input: DateLike) {
  return typeof input === 'string' || typeof input === 'number'
    ? new Date(input)
    : input
}
