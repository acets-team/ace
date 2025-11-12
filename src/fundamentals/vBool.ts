/**
 * 🧚‍♀️ How to access:
 *     - import { vBool } from '@ace/vBool'
 */


import { pipe, string, regex, boolean, transform, nonNullish, union } from 'valibot'


/**
 * - Parses `1` to `true`
 * - Parses `0` to `false`
 * - Parses `true` of any case to `true`
 * - Parses `false` of any case to `false`
 * @param errorMessage Optional, default is whataver valibot says for a specific case
 */
export function vBool(errorMessage?: string) {
  const stringToBool = pipe(
    string(),
    regex(/^(true|false|1|0)$/i),
    transform((input) => input === '1' || input.toLowerCase() === 'true')
  )

  return nonNullish(
    union([boolean(), stringToBool]),
    errorMessage
  )
}
