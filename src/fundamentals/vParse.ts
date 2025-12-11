/**
 * 🧚‍♀️ How to use:
 *   import { vParse } from '@ace/vParse'
 */


import type { FlatMessages } from './types'
import { issuesErrorCauseKey } from './vars'
import { flatten, safeParse, type GenericSchema, type InferOutput, type Config, type SafeParseResult } from 'valibot'


/**
 * Parsers provide a validate + parse function, This parse function is for those using the **valibot** plugin (🚨 Highly recommended)
 * 1. Safely parses the entire input
 * 2. On success, returns the validated output
 * 3. On failure, throws an AceError with flattened messages
  @example
  ```
  export const GET = new API('/api/get-amsterdam-registration/:userId?', 'apiGetAmterdamRegistration')
    .pathParams(vParse(object({ userId: optional(vNum()) })))
  ```
 * @param schema - Schema the input should look like
 * @param config - Config to pass to safeParse via `safeParse(schema, input, config)`
 */
export function vParse<T_Schema extends GenericSchema<any>>(schema: T_Schema, config?: Config<any>) {
  return (input: unknown) => vParseInner(input, schema, config)
}


/** @returns valid parsed input or `AceError` */
function vParseInner<T_Schema extends GenericSchema<any>>(input: unknown, schema: T_Schema, config?: Config<any>): InferOutput<T_Schema> {
  // Use the schema as GenericSchema<any> to bypass the complex type recursion check
  const genericSchema = schema as GenericSchema<any>;

  // Call safeParse with the generic type
  const result = safeParse(genericSchema, input, config);

  if (!result.issues) {
    // Cast the output back to the specific T_Schema output type
    return result.output as InferOutput<T_Schema>;
  }

  throw new Error('Please provide valid data', { cause: { [issuesErrorCauseKey]: flattenErrors(result) }})
}


/** Flatten `result.issues` into a flat key→messages map */
function flattenErrors<T_Schema extends GenericSchema<any>>(result: SafeParseResult<T_Schema>) {
  const messages: FlatMessages = {}

  if (result.issues && result.issues.length > 0) {
    const flat = flatten(result.issues as [typeof result.issues[0], ...typeof result.issues])

    if (flat.nested) {
      for (const key in flat.nested) {
        const errs = flat.nested[key]
        if (Array.isArray(errs)) messages[key] = errs
      }
    }
  }

  return messages
}
