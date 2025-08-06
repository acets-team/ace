/**
 * 🧚‍♀️ How to access:
 *     - import { vString } from '@ace/vString'
 */


import { pipe, string, nonEmpty, nonNullish } from 'valibot'


/**
 * Non empty string validation
 * @param errorMessage Optional, default is whataver valibot says for a specific case
 */
export function vString(errorMessage?: string) {
  return nonNullish(
    pipe(string(errorMessage), nonEmpty(errorMessage)),
    errorMessage
  )
}
