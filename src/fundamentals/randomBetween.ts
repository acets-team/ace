/**
 * 🧚‍♀️ How to access:
 *     - import { randomBetween } from '@ace/randomBetween'
 */


/**
 * - Get a random numberbetween 2 numbers
 * - Set `min` & `max` to the same value, for no random 🤓
 */
export function randomBetween(min: number, max: number) {
  return min === max
    ? max
    : Math.floor(Math.random() * (max - min + 1)) + min
}
