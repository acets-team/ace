/**
 * 🧚‍♀️ How to access:
 *     - import { holdUp } from '@ace/holdUp'
 */


import { randomBetween } from './randomBetween'


/**
 * - Wait a random amount of time between 2 numbers
 * - For no random, set `min` & `max` to the same value 🤓
 * @param min Defaults to 1200ms
 * @param max Defaults to 3000ms
 */
export async function holdUp(min = 1200, max = 3000): Promise<void> {
  const timeout = randomBetween(min, max)
  await new Promise(r => setTimeout(r, timeout))
}
