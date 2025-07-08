import { boolean, pipe, string, regex, transform } from 'valibot'


/**
 * - Helpful when you have a string (like all url path or search params) that you'd love to parse into a boolean
 * - Turns 0 to false and 1 to true
 * - Turns true of any case to true
 * - Turns false of any case to false
 */
export function valibotString2Boolean() {
  return pipe(
    string(),
    regex(/^(true|false|1|0)$/i),
    transform((input) => input === '1' || input.toLowerCase() === 'true'),
    boolean()
  )
}
