/**
 * 🧚‍♀️ How to access:
 *     - import { vEmail } from '@ace/vEmail'
 */


import { pipe, email, string, nonEmpty, nonNullish } from 'valibot'


/**
 * - Email validation
 * @param errorMessage Optional, default is whataver valibot says for a specific case
 */
export function vEmail(errorMessage?: string) {
  return nonNullish(
    pipe(string(errorMessage), nonEmpty(errorMessage), email(errorMessage)),
    errorMessage
  )
}
