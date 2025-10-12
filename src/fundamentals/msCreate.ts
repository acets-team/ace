/**
 * 🧚‍♀️ How to access:
 *     - import { msCreate } from '@ace/msCreate'
 */



import { msDay, msHour, msMinute, msSecond, msWeek } from './ms'


/**
 * Generate ms in plain english
 * @example
  ```ts
  const ms = msCreate({ hours: 2, minutes: 4 })
  ```
 */
export const msCreate = ({ seconds = 0, minutes = 0, hours = 0, days = 0, weeks = 0 }: { seconds?: number, minutes?: number, hours?: number, days?: number, weeks?: number }) => {
  return (
    m(seconds, msSecond) +
    m(minutes, msMinute) +
    m(hours, msHour) +
    m(days, msDay) +
    m(weeks, msWeek)
  )
}
  

/** Multiply: `value * ttl` */
function m(v: number, ttl: number) {
  return (v ?? 0) * ttl 
}