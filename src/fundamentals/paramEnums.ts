/**
 * 🧚‍♀️ How to access:
 *     - import { ParamEnums } from '@ace/paramEnums'
 *     - import type { InferEnums } from '@ace/paramEnums'
 */


/**
 * - Helpful when you've got a param that can be a set of different string values `(enums)`
 *     - Provides a type for the enums
 *     - Provides a toString() for the enums
 *     - Provides a set() for enum lookup 
 *
 * @example
 * ```ts
 * const elementEnums = new ParamEnums('fire','water','air','earth')
 * 
 * if (!elementEnums.has(params.element)) {
 *   throw new Error(`🔔 Please send a valid element, "${params.element}" is not a valid element, the valid elements are: ${elementEnums}`)
 * }
 * 
 * type Element = InferEnums<typeof elementEnums> // 'earth' | 'fire' | 'water' | 'air'
 * ```
 */
export class ParamEnums<const T_Enums extends readonly string[]> {
  readonly enums: T_Enums
  #set: Set<string>

  constructor(...enums: T_Enums) {
    this.enums = enums
    this.#set = new Set(enums)
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
    return this.enums.join(joinedBy)
  }
}


/**
 * - Receives a `paramEnums` object
 * - Gives back the enums's type, example: `'yin' | 'yang'`
 *
 * @example
 * ```ts
 * export type Category = InferEnums<typeof categoryEnums>
 * ```
 * */
export type InferEnums<T_ParamEnums extends ParamEnums<readonly string[]>> = T_ParamEnums extends ParamEnums<infer T_Values>
  ? T_Values[number]
  : never
