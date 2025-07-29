/**
 * 🧚‍♀️ How to access:
 *     - import { vBool } from '@ace/vBool'
 */


import { boolean, pipe, string, regex, transform, union } from 'valibot'


/**
 * - Recieves a string or a boolean
 * - Ensures value can be parsed into a boolean
 * - Turns 0 to false and 1 to true
 * - Turns true of any case to true
 * - Turns false of any case to false
 */
export function vBool() {
  return pipe(
    union([ string(), boolean() ]),
    transform(String),
    regex(/^(true|false|1|0)$/i),
    transform((input) => input === '1' || input.toLowerCase() === 'true'),
    boolean()
  )
}
