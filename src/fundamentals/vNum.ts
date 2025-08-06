/**
 * 🧚‍♀️ How to access:
 *     - import { vNum } from '@ace/vNum'
 */


import { pipe, regex, string, union, number,  picklist, transform, nonNullish } from 'valibot'


/**
 * - Recieves a string or a number
 * - Ensures value can be parsed into a number
 * @param options.allowDecimals - Optional, defaults to `false`, may the number have decimals
 * @param options.allowNegative - Optional, defaults to `false`, may the number be negative
 * @param options.picklist - Optional, defaults to empty array, array of numbers that this number must be one of, if empty array then any number is valid
 */
export function vNum(options?: vNumProps) {
  const regularExpression = options?.allowDecimals && options?.allowNegative
    ? /^-?\d+(\.\d+)?$/ // allow positives, negatives, decimals AND whole numbers
    : !options?.allowDecimals && options?.allowNegative
    ? /^-?\d+$/ // allow positive AND negative whole numbers
    : options?.allowDecimals && !options?.allowNegative
    ? /^\d+(\.\d+)?$/ // allow positive whole numbers AND positive decimals
    : /^\d+$/ // allow positive whole numbers

  const base = pipe(
    union([ string(options?.errorMessage), number(options?.errorMessage) ]),
    transform(String),
    regex(regularExpression),
    transform(Number),
    number(options?.errorMessage)
  )

  return nonNullish(
    options?.picklist
      ? pipe(base, picklist(options.picklist, options?.errorMessage))
      : base
  , options?.errorMessage)
}


type vNumProps = {
  /** Optional, defaults to `false`, may the number have decimals */
  allowDecimals?: boolean,
  /** Optional, defaults to `false`, may the number be negative */
  allowNegative?: boolean,
  /** Optional, defaults to empty array, array of numbers that this number must be one of, if empty array then any number is valid */
  picklist?: number[]
  /** Optional, default is whataver valibot says for a specific case */
  errorMessage?: string
}
