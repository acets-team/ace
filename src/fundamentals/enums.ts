/**
 * 🧚‍♀️ How to access:
 *     - import { Enums } from '@ace/enums'
 *     - import type { InferEnums } from '@ace/enums'
 */


/**
 * - Helpful when you've got a param that can be a set of different string values `(enums)`
 *     - Provides a type for the enums
 *     - Provides a toString() for the enums
 *     - Provides a set() for enum lookup 
 *
 * @example
 * ```ts
 * const elementEnums = new Enums('fire','water','air','earth')
 * 
 * if (!elementEnums.has(params.element)) {
 *   throw new Error(`🔔 Please send a valid element, "${params.element}" is not a valid element, the valid elements are: ${elementEnums}`)
 * }
 * 
 * type Element = InferEnums<typeof elementEnums> // 'earth' | 'fire' | 'water' | 'air'
 * ```
 */
export class Enums<const T_Enums extends readonly string[]> {
  #enums: T_Enums
  #set: Set<string>
  readonly values: { [K in T_Enums[number]]: K }

  constructor(...enums: T_Enums) {
    this.#enums = enums
    this.#set = new Set(enums)

    const vals = {} as { [K in T_Enums[number]]: K }

    for (const e of enums) {
      (vals as any)[e] = e
    }

    this.values = vals
  }


  /**
   * Determines if the potential enum recieved by `has()` is a valid enum according to the current `this.#set`
   * @param potentialEnum The value we are wondering is an enum
   * @returns Boolean, Is the potential enum valid or not
   */
  has(potentialEnum: unknown): potentialEnum is T_Enums[number] {
    return typeof potentialEnum === 'string' && this.#set.has(potentialEnum)
  }


  /**
   * The enums as a string joined together
   * @param joinedBy How the enums are joined, defaults to " | "
   */
  toString(joinedBy = ' | '): string {
    return this.#enums.join(joinedBy)
  }
}


/**
 * - Receives a `enums` object
 * - Gives back the enums's type, example: `'yin' | 'yang'`
 *
 * @example
 * ```ts
 * export type Category = InferEnums<typeof categoryEnums>
 * ```
 * */
export type InferEnums<T_Enums extends Enums<readonly string[]>> = T_Enums extends Enums<infer T_Values>
  ? T_Values[number]
  : never
