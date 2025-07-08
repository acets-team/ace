import { number, pipe, string, regex, transform } from 'valibot'


/**
 * Helpful when you have a string (like all url path or search params) that you'd love to parse into a number
 * @param options.allowDecimals - Optional, defaults to `false`, may the number have decimals
 * @param options.allowNegative - Optional, defaults to `false`, may the number be negative
 */
export function valibotString2Int(options?: { allowDecimals: boolean, allowNegative: boolean }) {
  const regularExpression =  options?.allowDecimals && options?.allowNegative
    ? /^-?\d+(\.\d+)?$/
    : !options?.allowDecimals && options?.allowNegative
    ? /^-?\d+$/
    : options?.allowDecimals && !options?.allowNegative
    ? /^\d+(\.\d+)?$/
    : /^\d+$/ // allow positive whole numbers

  return pipe(string(), regex(regularExpression), transform(Number), number())
}
