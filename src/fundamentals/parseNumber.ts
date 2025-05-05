/**
 * 🧚‍♀️ How to access:
 *     - import { parseNumber } from '@ace/parseNumber'
 */


/**
 * - Typically called if you'd love to ensure a param is a number
 * - Optionally send a min / max if would love to check if less then, greater then, between or exact 🤓
 * - Typically used for GET or Route params, for POST body validation we recommend `valibot`!
 */
export function parseNumber({ potential, min, max, error }: {potential: any, min?: number, max?: number, error: string}): number {
  const id = Number(potential) 

  if (Number.isNaN(id) || !Number.isInteger(id)
    || (min !== undefined && id < min)
    || (max !== undefined && id > max)) throw new Error(error)

  return id
}
