import type { Enums } from './enums'
import { any, check, nullish, pipe } from 'valibot'


/**
 * ### Ensure a value is w/in an array or set of enums
 * @example
  ```ts
  export const elements = ['fire', 'water', 'air', 'earth', 'ether'] as const

  export const voiceParts = new Enums(['Bass', 'Tenor', 'Alto'])

  const schema = object({
    element: vEnums(elements),
    voicePart: vEnums(voiceParts),
  })
  ```
 * @param enums - IF from the Enums class => checks to see if value is in enums set ELSE check to see if value is in enums array
 * @param error - Error to show when outside set
 */
export function vEnums(enums: unknown[] | Enums<any>, error = `Please provide one of the following: ${enums.toString()}`) {
  return pipe(
    nullish(any()),
    check(v => Array.isArray(enums) ? enums.includes(v) : enums.has(v), error)
  )
}
