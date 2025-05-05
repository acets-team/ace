/**
 * 🧚‍♀️ How to access:
 *     - import { pick } from '@ace/pick'
 */


/**
 * - The `ts` utility `Pick<T, K>` returns an object containing only the specified keys with their original types
 * 
 * @example
 * ```ts
 * type User = { id: number, name: string, email: string }
 * type UserLite = Pick<User, 'id' | 'name'>
 * ```
 * - Now the type for UserPreview does not include email
 * - `pick()` does compile time & runtime `Pick<T, K>`
 */
export function pick<T extends object, K extends keyof T>(fullObject: T, keys: K[]): Pick<T, K> {
  const res: Partial<Pick<T, K>> = {} // Partial<> tells ts that we are building the object incrementally, and the result type will be complete once all the keys are picked

  for (const key of keys) {
    if (key in fullObject) res[key] = fullObject[key]
  }

  return res as Pick<T, K>
}
