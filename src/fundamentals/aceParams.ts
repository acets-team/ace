/**
 * 🧚‍♀️ How to access:
 *     - import { aceParams, assertAceParamsObject } from '@ace/aceParams'
 */


import type { ValidateSchema } from './types'


/**
 * ### When you'd love to validate and parse params w/o importing valibot or zod
 * @example
    ```
    import { aceParams } from '@ace/aceParams'

    export const GET = new API('/api/example/:id', 'apiExample')
      .pathParams(aceParams(({ id }) => {
        if (typeof id !== 'number') throw new Error('id must be a number')
        return { id }
      }))
      .resolve(async (be) => {
        return be.success(be.pathParams.id)
      })
    ```
 * @param validator 
 * @returns 
 */
export function aceParams<T_Data>(validator: (params: any) => T_Data): ValidateSchema<T_Data> {
  return {
    parse(input: any): T_Data {
      assertAceParamsObject(input)
      return validator(input)
    }
  }
}


/** Throws if params is not an object */
function assertAceParamsObject(params: any): asserts params is Record<string, unknown> {
  if (!params || typeof params !== 'object') throw new Error('params must be an object')
}
