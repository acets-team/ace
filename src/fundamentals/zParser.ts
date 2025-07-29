import { ZodTypeAny, ZodError, z } from 'zod'
import { AceError } from './aceError'
import type { FlatMessages } from './types'

/**
 * Flatten ZodError issues into a flat key→messages map
 */
function flattenZodErrors(error: ZodError): FlatMessages {
  const messages: Record<string, string[]> = {}
  for (const issue of error.issues) {
    // build key from path (e.g. ['user','email'] => 'user.email')
    const key = issue.path.length > 0 ? issue.path.join('.') : '_root'
    if (!messages[key]) {
      messages[key] = []
    }
    messages[key].push(issue.message)
  }
  return messages
}

/**
 * Parse and validate using Zod, throwing AceError with flattened messages on failure
 * @param input - data to validate
 * @param schema - Zod schema to validate against
 * @returns parsed data of type z.infer<S>
 * @throws AceError if validation fails
 */
export function zParse<Schema extends ZodTypeAny>(
  input: unknown,
  schema: Schema
): z.infer<Schema> {
  const result = schema.safeParse(input)
  if (result.success) {
    return result.data
  } else {
    const messages = flattenZodErrors(result.error)
    throw new AceError({ messages })
  }
}

/**
 * Create a Zod-based parser function
 * @param schema - Zod schema to validate against
 * @returns a function that takes unknown input and returns parsed output or throws AceError
 */
export function zParser<Schema extends ZodTypeAny>(
  schema: Schema
): (input: unknown) => z.infer<Schema> {
  return (input: unknown) => zParse(input, schema)
}

/**
 * Infer the output type of a zParser
 */
export type InferZodParser<P> = P extends (input: unknown) => infer U ? U : never
