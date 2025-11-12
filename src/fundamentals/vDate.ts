/**
 * 🧚‍♀️ How to access:
 *     - import { vDate } from '@ace/vDate'
 */


import { date2Iso } from './date2Iso'
import { dateLike2Date } from './dateLike2Date'
import { date, pipe, string, number, union, transform, nonNullish, type BaseIssue, type GenericSchema} from 'valibot'


/**
 * - Recieves:
 *     - Date is already a `new Date()`
 *     - String is passed to `new Date()`
 *     - Number is `epoch` and passed to `new Date()` assumed to be in milliseconds
 * - Gives: Parsed date in the format requested by the `to` prop
 * @param props.error - The error to return when the input is invalid 
 * @param props.to - Optional, defaults to `iso`, what type of date are we parsing to, `'date' | 'ms' | 'sec' | 'iso'`
 * @param props.includeIsoTime - Optional, defaults to `true`, when true => `2025-08-01T00:50:28.809Z` when false => `2025-08-01`
 * @returns 
 */
export function vDate<T_To extends 'date' | 'ms' | 'sec' | 'iso' = 'iso'>({to = 'iso' as T_To, includeIsoTime = true, error: errorMessage }: { to?: T_To; includeIsoTime?: boolean, error?: string } = {}): GenericSchema<string | number | Date, vDateOutput<T_To>, BaseIssue<unknown>> {
  const base = nonNullish(
    union([string(), number(), date()], errorMessage), // start w/ either a string, number or Date
    errorMessage
  )

  const asDate = pipe(base, transform(d => dateLike2Date(d)), date(errorMessage)) // transform to Date

  switch (to) { // give as requested in to
    case 'date': return asDate as any
    case 'ms': return pipe(asDate, transform(d => d.getTime()), number()) as any
    case 'sec': return pipe(asDate, transform(d => Math.floor(d.getTime() / 1000)), number()) as any
    case 'iso': return pipe(asDate, transform(d => date2Iso(d, includeIsoTime)), string()) as any
    default: throw new Error(`Unsupported to=${(to)}`)
  }
}


export type vDateProps = {
  /** Optional, defaults to `iso`, what type of date are we parsing to */
  to?: 'date' | 'ms' | 'sec' | 'iso'
  /** Optional, defaults to `true`, when true => `2025-08-01T00:03:06.009Z` when false => `2025-08-01` */
  includeIsoTime?: boolean
  /** Optional, default is whataver valibot says for a specific case */
  errorMessage?: string
}


/** Map option to output type */
export type vDateOutput<T_To extends 'date' | 'ms' | 'sec' | 'iso'> =
  T_To extends 'date' ? Date :
  T_To extends 'ms' ? number :
  T_To extends 'sec' ? number :
  T_To extends 'iso' ? string :
  never
