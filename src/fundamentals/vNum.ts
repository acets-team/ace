/**
 * 🧚‍♀️ How to access:
 *     - import { vNum } from '@ace/vNum'
 */


import { number, picklist, pipe, regex, string, transform, union } from 'valibot'


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
    union([ string(), number() ]),
    transform(String),
    regex(regularExpression),
    transform(Number),
    number()
  )

  return options?.picklist
    ? pipe(base, picklist(options.picklist))
    : base
}


type vNumProps = {
  /** Optional, defaults to `false`, may the number have decimals */
  allowDecimals?: boolean,
  /** Optional, defaults to `false`, may the number be negative */
  allowNegative?: boolean,
  /** Optional, defaults to empty array, array of numbers that this number must be one of, if empty array then any number is valid */
  picklist?: number[]
}
