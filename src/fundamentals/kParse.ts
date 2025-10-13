/**
 * 🧚‍♀️ How to use:
 *   import { kParse } from '@ace/kParse'
 */


import type { AnyValue, Parser } from './types'


/**
 * - The input type to a parser is unknown, ex: `(input: unknown) => parse(input)`
 * - Sometimes we'd love to get some typescript feedback that we are calling a parser with the proper keys
 * - `kParse()` will let you know what keys need to be sent for an input, the `k` stands for `keys`
 * - So in the example below, if we change the `password` key to `pass` we'll get typescript feedback :)
 * - The parser will do the exact validations and `kParse()` will just steer us in the right direction telling us what keys need to be sent based on the parsers schema
 * @example
  ```ts
  const onSubmit = createOnSubmit(async ({fd}) => {
    const body = kParse(signInParser, { email: fd('email'), password: fd('password') })
    const {error} = await apiSignIn({ body, bitKey: 'signIn' })

    if (!error?.message) revalidate(apiGetJwtCookieKey)
    else showToast({ type: 'info', value: error.message })
  })
  ```
 * @param parser - A parser function validates and optionally parses an input
 * @param input - The input you'd love to validate & optionally parse
 * @param onCatch - Set if you'd love for anything to happen onCatch
 */
export function kParse<T>(parser: Parser<T>, input: AnyValue<T>, onCatch?: (e: any) => any) {
  try {
    return parser(input)
  } catch (e) {
    if (onCatch) onCatch(e)
    throw e
  }
}
