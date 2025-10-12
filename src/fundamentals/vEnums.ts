/**
 * 🧚‍♀️ How to use:
 *   import { vEnums } from '@ace/vEnums'
 */


import type { Enums, InferEnums, EnumEntry } from './enums'
import { union, literal, type GenericSchema, type LiteralSchema } from 'valibot'



/**
 * vEnums supports:
 * 1. readonly string[]  => literal union of array values
 * 2. Record<string, string> => literal union of object keys
 * 3. Enums instance => literal union of enum keys
 */
export function vEnums<T extends readonly string[]>(
  enums: T
): GenericSchema<T[number]>

export function vEnums<T extends Record<string, string>>(
  enums: T
): GenericSchema<keyof T>

export function vEnums<T_Enums extends Enums<readonly EnumEntry[]>>(
  enums: T_Enums
): GenericSchema<InferEnums<T_Enums>>

export function vEnums(
  enums: readonly string[] | Record<string, string> | Enums<readonly EnumEntry[]>
): GenericSchema<any> {

  const makeUnionFrom = (values: readonly string[]) => {
    const schemas = makeLiteralSchemasFromArray(values)
    return union(schemas)
  }

  // Case 1: Array of strings
  if (Array.isArray(enums)) return makeUnionFrom(enums)

  // Case 2: Enums instance
  if (typeof (enums as Enums<any>)?.has === 'function' && Array.isArray((enums as Enums<any>).entries)) {
    const keys = (enums as Enums<any>).entries.map(([k]) => String(k))
    return makeUnionFrom(keys)
  }

  // Case 3: Plain object
  if (typeof enums === 'object' && enums !== null) {
    return makeUnionFrom(Object.keys(enums))
  }

  throw new Error('vEnums received invalid input')
}

function makeLiteralSchemasFromArray(arr: readonly string[]): LiteralSchema<string, undefined>[] {
  return arr.map((v) => literal(v))
}
