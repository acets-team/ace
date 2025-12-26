/**
 * 🧚‍♀️ How to access:
 *     - import { vNum } from '@ace/vNum'
 *     - import type { vNumProps } from '@ace/vNum'
 */


import { pipe, regex, string, union, number, minValue, maxValue, picklist, transform, nonNullish, type BaseSchema } from 'valibot'


/**
 * - Recieves a string or a number
 * - Ensures value can be parsed into a number
 * @param options.allowDecimals - Optional, defaults to `false`, may the number have decimals
 * @param options.allowNegative - Optional, defaults to `false`, may the number be negative
 * @param options.picklist - Optional, defaults to empty array, array of numbers that this number must be one of, if empty array then any number is valid
 */
export function vNum(options?: {
  /** Optional, defaults to `false`, may the number have decimals */
  allowDecimals?: boolean,
  /** Optional, defaults to `false`, may the number be negative */
  allowNegative?: boolean,
  /** Optional, defaults to empty array, array of numbers that this number must be one of, if empty array then any number is valid */
  picklist?: number[]
  /** Optional, default is whataver valibot says for a specific case */
  errorMessage?: string
  /** Optional, default is no range verification, IF defined ensures value is between range */
  range?: { min?: number, max?: number },
}) {
  const regularExpression = options?.allowDecimals && options?.allowNegative
    ? /^-?\d+(\.\d+)?$/ // allow positives, negatives, decimals AND whole numbers
    : !options?.allowDecimals && options?.allowNegative
    ? /^-?\d+$/ // allow positive AND negative whole numbers
    : options?.allowDecimals && !options?.allowNegative
    ? /^\d+(\.\d+)?$/ // allow positive whole numbers AND positive decimals
    : /^\d+$/ // allow positive whole numbers

  let schema: BaseSchema<any, number, any> = pipe(
    union([string(options?.errorMessage), number(options?.errorMessage)]),
    transform(String),
    regex(regularExpression),
    transform(Number),
    number(options?.errorMessage),
  )

  if (options?.range?.min !== undefined) {
    schema = pipe(schema, minValue(options.range.min, options?.errorMessage))
  }

  if (options?.range?.max !== undefined) {
    schema = pipe(schema, maxValue(options.range.max, options?.errorMessage))
  }

  if (options?.picklist?.length) {
    schema = pipe(schema, picklist(options.picklist, options?.errorMessage))
  }

  return nonNullish(schema, options?.errorMessage)
}


export type vNumProps = Parameters<typeof vNum>[0]
