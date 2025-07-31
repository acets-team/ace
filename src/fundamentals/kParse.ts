/**
 * 🧚‍♀️ How to use:
 *   import { kParse } from '@ace/kParse'
 */


import type { AnyValue, Parser } from './types'

/**
 * - The input type to a parser is unknown
 * - Sometimes we'd love to get some typescript feedback that we are calling a parser with the proper keys
 * - `kParse()` will let you know what keys need to be sent for an input, the `k` stands for `keys`
 * @example
  ```ts
  const onSubmit = createOnSubmit(async (fd) => {
    const body = kParse(signInParser, {email: fd('email'), password: fd('password')})
    const errorMessage = (await apiSignIn({ bitKey: 'signIn', body })).error?.message

    if (errorMessage) showToast({ type: 'info', value: errorMessage })
    else showToast({ type: 'success', value: 'Success!' })
  })
  ```
 * @param parser - A parser function validates and optionally parses an input
 * @param input - The input you'd love to validate & optionally parse
 */
export function kParse<T>(parser: Parser<T>, input: AnyValue<T>) {
  return parser(input)
}
