/**
 * 🧚‍♀️ How to use:
 *   import { vParser, type InferValibotSchema } from '@ace/vParser'
 */


import { AceError } from './aceError'
import type { FlatMessages } from './types'
import { flatten, safeParse, type GenericSchema, type InferOutput, type Config } from 'valibot'


/**
 * Parsers provide a validate + parse function, This parse function is for those using the **valibot** plugin (🚨 Highly recommended)
 * 1. Safely parses the entire input
 * 2. On success, returns the validated output
 * 3. On failure, throws an AceError with flattened messages
 * @param schema - Schema the input should look like
 * @param config - Config to pass to safeParse via `safeParse(schema, input, config)`
 */
export function vParser<Schema extends GenericSchema<any>>(schema: Schema, config?: Config<any>) {
  return (input: unknown) => vParse(input, schema, config)
}


/**
 * Parsers provide a validate + parse function, This parse function is for those using the **valibot** plugin (🚨 Highly recommended)
 * 1. Safely parses the entire input
 * 2. On success, returns the validated output
 * 3. On failure, throws an AceError with flattened messages
 * @param input - Value to parse
 * @param schema - Schema the input should look like
 * @param config - Config to pass to safeParse via `safeParse(schema, input, config)`
 */
function vParse<Schema extends GenericSchema<any>>(input: unknown, schema: Schema, config?: Config<any>): InferOutput<Schema> {
  const result = safeParse(schema, input, config)

  if (!result.issues) return result.output

  // Flatten issues for AceError
  const messages: FlatMessages = {}
  const nested = flatten(result.issues).nested as Record<string, unknown>

  for (const key in nested) {
    const errs = nested[key]

    if (Array.isArray(errs)) messages[key] = errs as string[]
  }

  throw new AceError({ messages })
}


/** 
 * - Receives: Valibot Parser
 * - Gives: The type for the input
*/
export type ValibotParser2Input<T_Parser> = T_Parser extends (input: unknown) => infer T_Input
  ? T_Input
  : never
