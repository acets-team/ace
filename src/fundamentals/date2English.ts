/**
 * 🧚‍♀️ How to access:
 *     - import { date2English, defaultDate2EnglishOptions, days, months } from '@ace/date2English'
 *     - import type { Date2EnglishOptions } from '@ace/date2English'
 */


import type { DateLike } from './types'
import { dateLike2Date } from './dateLike2Date'


/**
 * ### Convert date as string, epoch or Date into English
 * @example
  ```ts
  date2English('2025-08-01T07:00:00.000Z') // 'Friday, August 1st, 2025'
  date2English('2025-08-01T07:00:00.000Z', { includeDayOfWeek: false, fullMonth: false }) // 'Aug 1st, 2025'
  ```
 * @param date - IF `string` or `number` passed to `new Date()` ELSE is already a `Date`
 * @param options.suffix - Optional, defaults to `true`, determines if we add the `st`, `nd`, `rd` or `th` to the day that is shown as a number
 * @param options.includeDayOfWeek - Optional, defaults to `true`, determines if days are shown
 * @param options.fullDayOfWeek - Optional, defaults to `true`, determines if days are shown full (`Monday`) or short (`Mon`)
 * @param options.fullMonth - Optional, defaults to `true`, determines if months are shown full (`January`) or short (`Jan`)
 * @param options.commaPostDayOfWeek - Optional, defaults to `true`, determines if a comma is placed after the day of week
 * @param options.commaPostNumberDay - Optional, defaults to `true`, determines if a comma is placed after the day that is shown as a number
 */
export function date2English(date: DateLike, options: Date2EnglishOptions = defaultDate2EnglishOptions) {
  const d = dateLike2Date(date)

  const dayOfWeek = getDayOfWeek(d, options)

  const {month, day, daySuffix} = getMonthAndDay(d, options)

  const year = d.getUTCFullYear()

  const commaAfterNumber = options.commaPostNumberDay ? ',' : ''

  return `${dayOfWeek}${month} ${day}${daySuffix}${commaAfterNumber} ${year}`
}


function getDayOfWeek(d: Date, options: Date2EnglishOptions) {
  let dayOfWeek = ''

  if (options.includeDayOfWeek) {
    const dayIndex = d.getUTCDay()
    dayOfWeek = String(options.fullDayOfWeek ? days.full[dayIndex] : days.short[dayIndex])

    if (options.commaPostDayOfWeek) dayOfWeek += ', '
    else dayOfWeek += ' '
  }

  return dayOfWeek
}


function getMonthAndDay(d: Date, options: Date2EnglishOptions) {
  let daySuffix = ''

  const day = d.getUTCDate()

  const month = months[options.fullMonth ? 'full' : 'short'][d.getUTCMonth()]

  if (options.suffix) {
    if (day > 3 && day < 21) daySuffix = 'th'
    else {
      switch (day % 10) { // modulo = integer division: how many whole times does a number go into another, with a remainder as an integer, ex: 1 pizza, 10 people, each person get's 0 pizzas & then 1 left over is the answer
        case 1:
          daySuffix = 'st'
          break;
        case 2:
          daySuffix = 'nd'
          break;
        case 3:
          daySuffix = 'rd'
          break;
        default:
          daySuffix = 'th'
      }
    }
  }

  return {month, day, daySuffix}
}


export const defaultDate2EnglishOptions: Date2EnglishOptions = {suffix: true, includeDayOfWeek: true, fullDayOfWeek: true, fullMonth: true, commaPostDayOfWeek: true, commaPostNumberDay: true}


export const months = {
  full: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
  short: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
} as const


export const days = {
  full: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
  short: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
} as const


export type Date2EnglishOptions = {
  /** Optional, defaults to `true`, determines if we add the `st`, `nd`, `rd` or `th` to the day that is shown as a number  */
  suffix?: boolean,
  /** Optional, defaults to `true`, determines if days are shown */
  includeDayOfWeek?: boolean,
  /** Optional, defaults to `true`, determines if days are shown full (`Monday`) or short (`Mon`)  */
  fullDayOfWeek?: boolean,
  /** Optional, defaults to `true`, determines if months are shown full (`January`) or short (`Jan`)  */
  fullMonth?: boolean,
  /** Optional, defaults to `true`, determines if a comma is placed after the day of week  */
  commaPostDayOfWeek?: boolean,
  /** Optional, defaults to `true`, determines if a comma is placed after the day that is shown as a number  */
  commaPostNumberDay?: boolean,
}
