/**
 * 🧚‍♀️ How to use:
 *   import { zParse } from '@ace/zParse'
 *   import type { ZodParse2Input } from '@ace/zParse'
 */


import { AceError } from './aceError'
import type { FlatMessages } from './types'
import { z, type ZodError, type ZodTypeAny } from 'zod'



/**
 * Parsers provide a validate + parse function, This parse function is for those using the **zod** plugin
 * 1. Safely parses the entire input
 * 2. On success, returns the validated output
 * 3. On failure, throws an AceError with flattened messages
 * @param schema - Zod schema to validate against
 * @returns a function that takes unknown input and returns parsed output or throws AceError
 */
export function zParse<T_Schema extends ZodTypeAny>(schema: T_Schema): (input: unknown) => z.infer<T_Schema> {
  return (input: unknown) => zParseInner(input, schema)
}



/** @returns valid parsed input or `AceError` */
function zParseInner<T_Schema extends ZodTypeAny>(input: unknown, schema: T_Schema): z.infer<T_Schema> {
  const result = schema.safeParse(input)

  if (result.success) return result.data

  const messages = flattenErrors(result.error)
  throw new AceError({ messages })
}



/** Flatten ZodError issues into a flat key→messages map */
function flattenErrors(error: ZodError): FlatMessages {
  const messages: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_root' // build key from path (e.g. ['user','email'] => 'user.email')

    if (!messages[key]) messages[key] = []

    messages[key].push(issue.message)
  }

  return messages
}



/**
 * - Receives: Zod Parser
 * - Gives: The type for the input
 */
export type ZodParse2Input<P> = P extends (input: unknown) => infer U ? U : never
