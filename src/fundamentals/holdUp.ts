/**
 * 🧚‍♀️ How to access:
 *     - import { holdUp } from '@ace/holdUp'
 */


import { randomBetween } from './randomBetween'


/**
 * - Wait a random amount of time between 2 numbers
 * - Set `min` & `max` to the same value, for no random 🤓
 * @param min Defaults to 900ms
 * @param max Defaults to 1800ms
 */
export async function holdUp(min = 900, max = 1800): Promise<void> {
  const timeout = randomBetween(min, max)
  await new Promise(r => setTimeout(r, timeout))
}
