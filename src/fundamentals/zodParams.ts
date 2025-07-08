import type { ZodType } from 'zod'
import { ValidateSchema } from './types'


export function zodParams<T_Schema>(schema: ZodType<T_Schema>): ValidateSchema<T_Schema> {
  return {
    parse(raw) {
      const res = schema.safeParse(raw)
      if (!res.success) throw res.error
      return res.data
    }
  }
}