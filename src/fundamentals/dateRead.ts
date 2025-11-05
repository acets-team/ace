/**
 * 🧚‍♀️ How to access:
 *     - import { dateRead, defaultDateReadOptions, defaultDateReadWords } from '@ace/dateRead'
 *     - import type { DateReadOptions, DateReadWords } from '@ace/dateRead'
 */


import type { DateLike } from './vanilla'
import { dateLike2Date } from './dateLike2Date'



export const defaultDateReadOptions: DateReadOptions = {suffix: true, includeDayOfWeek: true, fullDayOfWeek: true, fullMonth: true, commaPostDayOfWeek: true, commaPostNumberDay: true}


export const defaultDateReadWords = {
  at: 'at',
  am: 'am', pm: 'pm',
  suffixSt: 'st', suffixNd: 'nd', suffixRd: 'rd', suffixTh: 'th',
  month1Full: 'January', month2Full: 'February', month3Full: 'March', month4Full: 'April', month5Full: 'May', month6Full: 'June', month7Full: 'July', month8Full: 'August', month9Full: 'September', month10Full: 'October', month11Full: 'November', month12Full: 'December',
  month1Short: 'Jan', month2Short: 'Feb', month3Short: 'Mar', month4Short: 'Apr', month5Short: 'May', month6Short: 'Jun', month7Short: 'Jul', month8Short: 'Aug', month9Short: 'Sep', month10Short: 'Oct', month11Short: 'Nov', month12Short: 'Dec',
  day1Full: 'Monday', day2Full: 'Tuesday', day3Full: 'Wednesday', day4Full: 'Thursday', day5Full: 'Friday', day6Full: 'Saturday', day7Full: 'Sunday', 
  day1Short: 'Mon', day2Short: 'Tue', day3Short: 'Wed', day4Short: 'Thu', day5Short: 'Fri', day6Short: 'Sat', day7Short: 'Sun', 
}



/**
 * ### Convert date to a string to be read
 * - Most commonly provided an iso timestamp & called on the `FE` to convert timestamp into local date / time
 * @example
  ```ts
  dateRead('2025-08-01T07:11:00.000Z') // 'Friday, August 1st, 2025 at 11:11am'
  dateRead('2025-08-01T07:00:00.000Z', { includeDayOfWeek: false, fullMonth: false, includeTime: false }) // 'Aug 1st, 2025'
  ```
 * @param date - IF falsy THEN string returned ELSE IF `string` or `number` THEN passed to `new Date()` ELSE is already a `Date`
 * @param options.suffix - Optional, defaults to `true`, determines if we add the `st`, `nd`, `rd` or `th` to the day that is shown as a number
 * @param options.includeDayOfWeek - Optional, defaults to `true`, determines if days are shown
 * @param options.fullDayOfWeek - Optional, defaults to `true`, determines if days are shown full (`Monday`) or short (`Mon`)
 * @param options.fullMonth - Optional, defaults to `true`, determines if months are shown full (`January`) or short (`Jan`)
 * @param options.commaPostDayOfWeek - Optional, defaults to `true`, determines if a comma is placed after the day of week
 * @param options.commaPostNumberDay - Optional, defaults to `true`, determines if a comma is placed after the day that is shown as a number
 * @param options.includeTime - Optional, defaults to `12`. IF `12` THEN shown w/ `12` hour time ELSE IF `24` then shown w/ `24` hour time ELSE IF false THEN not shown
 * @param options.lowerTime12 - Optional, defaults to `true`. IF `12` @ options.includeTime the this controls if `am` and `pm` are lowercase or uppercase
 * @param words - Optional, defaults to `englishWords`, helpful for personal language customization
 */
export function dateRead({ date, options = defaultDateReadOptions, words = defaultDateReadWords }: { date?: DateLike, options?: DateReadOptions, words?: Partial<DateReadWords>  }) {
  if (!date) return ''

  const o = {...defaultDateReadOptions, ...options} // override passed in w/ defaults

  const w = {...defaultDateReadWords, ...words}

  const d = dateLike2Date(date)

  const dayOfWeek = getDayOfWeek(d, o, w)

  const {month, day, daySuffix} = getMonthAndDay(d, o, w)

  const year = d.getFullYear()

  const commaAfterNumber = o.commaPostNumberDay ? ',' : ''

  const time = getTime(d, o, w)

  return `${dayOfWeek}${month} ${day}${daySuffix}${commaAfterNumber} ${year}${time}`
}


function getDayOfWeek(d: Date, o: DateReadOptions, w: DateReadWords) {
  let dayOfWeek = ''

  if (o.includeDayOfWeek) {
    const dayIndex = d.getDay() // Sunday = 0 → Saturday = 6
    const key = `${'day' + ((dayIndex + 1) as 1|2|3|4|5|6|7)}${o.fullDayOfWeek ? 'Full' : 'Short'}`
    dayOfWeek = (w as any)[key] as string

    if (o.commaPostDayOfWeek) dayOfWeek += ', '
    else dayOfWeek += ' '
  }

  return dayOfWeek
}


function getMonthAndDay(d: Date, o: DateReadOptions, w: DateReadWords) {
  let daySuffix = ''

  const day = d.getDate()

  const monthIndex = d.getMonth() // 0 → January, 11 → December
  const key = `${'month' + (monthIndex + 1)}${o.fullMonth ? 'Full' : 'Short'}`
  const month = (w as any)[key] as string

  if (o.suffix) {
    if (day > 3 && day < 21) daySuffix = w.suffixTh
    else {
      switch (day % 10) { // modulo = integer division: how many whole times does a number go into another, with a remainder as an integer, ex: 1 pizza, 10 people, each person get's 0 pizzas & then 1 left over is the answer
        case 1:
          daySuffix = w.suffixSt
          break;
        case 2:
          daySuffix = w.suffixNd
          break;
        case 3:
          daySuffix = w.suffixRd
          break;
        default:
          daySuffix = w.suffixTh
      }
    }
  }

  return {month, day, daySuffix}
}


function getTime(d: Date, o: DateReadOptions, w: DateReadWords) {
  let time = ''

  if (o.includeTime === 12 || o.includeTime === 24) {
    const hours = d.getHours()
    const minutes = d.getMinutes().toString().padStart(2, '0')
    
    if (o.includeTime === 24) time += ` ${w.at} ${hours.toString().padStart(2, '0')}:${minutes}`
    else {
      let suffix = hours >= 12 ? w.pm : w.am
      if (!o.lowerTime12) suffix = suffix.toUpperCase()

      const displayHours = hours % 12 === 0 ? 12 : hours % 12
      time += ` at ${displayHours}:${minutes}${suffix}`
    }
  }

  return time
}





export type DateReadOptions = {
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
  /** Optional, defaults to `12`. IF `12` THEN shown w/ `12` hour time ELSE IF `24` then shown w/ `24` hour time ELSE IF false THEN not shown */
  includeTime?: 12 | 24 | false,
  /** Optional, defaults to `true`. IF `12` @ options.includeTime the this controls if `am` and `pm` are lowercase or uppercase */
  lowerTime12?: boolean,
  /** Optional, defaults to `englishWords`,  helpful for personal language customization */
  words?: DateReadWords,
}


export type DateReadWords = typeof defaultDateReadWords
