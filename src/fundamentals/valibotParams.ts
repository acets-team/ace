import type { ValidateSchema } from './types'
import {parse, type GenericSchema, type InferOutput} from 'valibot'


export function valibotParams<T_Schema extends GenericSchema<any>>(schema: T_Schema): ValidateSchema<InferOutput<T_Schema>> {
  return {
    parse(raw) {
      return parse(schema, raw)
    }
  }
}
