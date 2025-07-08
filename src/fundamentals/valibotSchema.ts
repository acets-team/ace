/**
 * 🧚‍♀️ How to access:
 *     - import { ValibotSchema } from '@ace/valibotSchema'
 *     - import type { InferValibotSchema } from '@ace/valibotSchema'
 */


import { AceError } from './aceError'
import type { FlatMessages } from './types'
import { flatten, safeParse, type BaseSchema, type InferOutput, type Config } from 'valibot'



/**
 * - Ensures that we validate an entire schema before thowing
 * - When we throw, the error is formatted as a `AceError`, aka same shape as all errors we throw
 * - Comes w/ a convenience InferValibotSchema
 */
export class ValibotSchema<T extends BaseSchema<any, any, any>> {
  schema: T;

  constructor(schema: T) {
    this.schema = schema;
  }

  /**
   * 1. Validbot safe parse an entire input
   * - On Success: Return parsed
   * - On Fail: Throw AceError w/ flattened errors
   * @param input - Input to parse
   * @param schema - Schema the input should look like
   * @returns - Parsed output or throws an error if any issues
   */
  parse(input: AnyValue<InferOutput<T>>, config?: Config<any>): InferOutput<T> {
    const result = safeParse(this.schema, input, config)

    if (!result.issues) return result.output
    else {
      const res: Record<string, string[]> = {} // obj data structure b/c it's what valibot already knows & works over the wire to the fe
      const nested = flatten(result.issues).nested

      for (const key in nested) {
        if (Array.isArray(nested[key as keyof typeof nested])) {
          res[key] = nested[key as keyof typeof nested] as string[] // all these type asertions are of things we learn on the previous line but ts forgets
        }
      }

      const messages: FlatMessages = res
      throw new AceError({ messages })
    }
  }
}


/**
 * - Recieves: ValibotSchema 
 * - Gives: The type of that schema / shape
 */
export type InferValibotSchema<T_ValibotSchema> = T_ValibotSchema extends ValibotSchema<infer T_Shape>
  ? InferOutput<T_Shape>
  : never


/**
 * Goal w/ 3 types below: Enforce the exact shape of keys from InferOutput<T> @ `parse()`
 * Allow more flexible values (e.g., string | null instead of just string) b/c `fd()` has no guarantee's on response but valibot will guarantee that but atleast the object shape going into parse can be enforced, let valibot do the actual value enforcing
 * Disallow extra keys not in the inferred shape.
 */


/**
 * - What:
 *     - Loop through each key in T
 *     - Assign the type `unknown` to each key
 * - Why:
 *     - Remember the goal above, correct keys, any (unknown) value
 * - So:
 *     - IF T is { aloha: boolean } THEN AllowAnyValue<T> is { aloha: unknown }
 */
type AllowAnyValue<T> = { [K in keyof T]: unknown }


/**
 * - Exclude<keyof U, keyof T>
 *     - Ensures U has no extra keys in it
 *     - Puts U keys into array and then removes keys also in T
 *     - So if U has any extra keys we don't match exact keys amongst objects
 * - If `Exclude<keyof T, keyof U>` is truthy we don't have exact keys which will throw a ts errow with the extends `never` and if we do we'll return U aka the object keys
 */
type ExactKeys<T, U> = Exclude<keyof U, keyof T> extends never
  ? Exclude<keyof T, keyof U> extends never
    ? U
    : never
  : never;


/**
 * - From the shape T
 * - Replace its values w/ unknown
 * - Enforce that the keys are exactly that of T
 */
type AnyValue<T> = ExactKeys<T, AllowAnyValue<T>>
