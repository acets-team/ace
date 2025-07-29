/**
 * 🧚‍♀️ How to access:
 *     - import { randomArrayItem } from '@ace/randomArrayItem'
 */


import { randomBetween } from './randomBetween'


/**
 * - Helpful when you'd love to pick a random item in an array
 * @param array - Array we are picking from
 * @returns - The random item from the `array`
 */
export function randomArrayItem<T>(array: readonly T[]): T {
  const value = array[randomBetween(0, array.length - 1)]
  if (value === undefined) throw new Error('')

  return value
}
