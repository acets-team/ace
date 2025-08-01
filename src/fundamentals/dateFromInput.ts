/**
 * 🧚‍♀️ How to access:
 *     - import { dateFromInput } from '@ace/dateFromInput'
 */


/**
 * - Receives: input value
 * - Gives: Date object that is in the local timezone (date & time) to where the input (browser) is
 * @param value Input Value
 * @param type Input Type
 * @link https://epoch.vercel.app/
 * @link https://orm.drizzle.team/docs/guides/timestamp-default-value
 */
export function dateFromInput(value: string, type: 'date' | 'datetime-local') : Date {
  switch (type) {
    case 'date':
      const parts = value.split('-').map(Number)
      const [year, month, day] = parts as [number, number, number]

      if (parts.some(n => Number.isNaN(n))) throw new Error(`Invalid date value @ dateFromInput(), value: ${value}`)

      return new Date(year, month - 1, day)
    case 'datetime-local':
      let padded

      switch(value.length) {
        case 23:
          padded = value
          break
        case 19:
          padded = `${value}.000`
          break
        case 16:
          padded = `${value}:00.000`
          break
        default:
          throw new Error(`Invalid datetime-local value @ dateFromInput, value: ${value}`)
      }

      return new Date(padded)
  }
}
