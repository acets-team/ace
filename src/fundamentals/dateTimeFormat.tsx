/**
 * 🧚‍♀️ How to access:
 *     - import { DateTimeFormat } from '@ace/dateTimeFormat'
 */


/**
 * @example
 * ```tsx
 * <DateTimeFormat date={createdAt} options={{ year: 'numeric', month: '2-digit', day: '2-digit' }} />
 * ```
 * @param date - Will be placed into: `new Date(date)`. If you have date object, call w/ `date.toISOString()`
 * @param options [`Intl.DateTimeFormatOptions`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
 * @param falsyValue What to show if date is falsy, default is `-`
 * @returns A string component, with your `toLocaleDateString()` formatted date
 */
export function DateTimeFormat({ date, options, falsyValue: defaultValue }: { date: any, options: Intl.DateTimeFormatOptions, falsyValue?: string }) {
  return <>{ typeof date === 'string' ? (new Date(date)).toLocaleDateString(undefined, options): defaultValue || '-' }</>
}
