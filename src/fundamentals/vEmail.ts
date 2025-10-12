/**
 * 🧚‍♀️ How to access:
 *     - import { vEmail } from '@ace/vEmail'
 */


import { pipe, email, string, nonNullish } from 'valibot'



/**
 * - Email validation
 * @param errorMessage Optional, default is whatever valibot says for a specific case
 */
export function vEmail(errorMessage?: string) {
  return nonNullish(
    pipe(
      string(),
      email(errorMessage)
    ),
    errorMessage
  );
}