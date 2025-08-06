/**
 * 🧚‍♀️ How to access:
 *     - import { vBool } from '@ace/vBool'
 */


import { pipe, string, regex, boolean, transform, nonNullish } from 'valibot'


/**
 * - Turns 0 to false and 1 to true
 * - Turns true of any case to true
 * - Turns false of any case to false
 * @param errorMessage Optional, default is whataver valibot says for a specific case
 */
export function vBool(errorMessage?: string) {
  return nonNullish(
    pipe(
      string(errorMessage),
      regex(/^(true|false|1|0)$/i),
      transform((input) => input === '1' || input.toLowerCase() === 'true'),
      boolean(errorMessage)
    ),
    errorMessage
  )
}
