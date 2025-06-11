/**
 * 🧚‍♀️ How to access:
 *     - import { Enums } from '@ace/enums'
 *     - import type { InferEnums } from '@ace/enums'
 */


/**
 * - Provides a type for the enums
 * - Creates a `enum.values[key] = value` object that is typed 
 * - Creates a `enum.keys[key] = key` object that is typed 
 * - Creates a `enum.entries = [[key, value]]` array that is helpful @ `<For />` that is typed 
 * - Creates a new Set() for `enum.has()` boolean return enum lookup 
 * - Provides a toString() for the enums
 *
 * @example
  ```ts
  const enums = new Enums([
    'admin',
    { enum: 'mod', value: 'Moderator 🛡️' },
    { enum: 'user', value: 'User 👤' },
  ])

  type Users = InferEnums<typeof enums> // 'admin' | 'mod' | 'user'

  console.log(enums.values.admin)  // "admin"
  console.log(enums.values.mod)  // "Moderator 🛡️"
  console.log(enums.keys.user)  // "user"

  console.log(enums.has('mod'))  // true
  console.log(enums.has('example'))  // false
  
  console.log(enums.toString()) // "admin | mod: Moderator 🛡️ | user: User 👤"
  ```
 * @example
  ```tsx
  <For each={enums.entries}>
    {([key, value]) => <option value={key}>{value}</option>}
  </For>
  ```
   */
export class Enums<const T_Entries extends readonly EnumEntry[]> {
  #reqEntries: T_Entries
  #set: Set<string>
  readonly keys: MappedKeys<T_Entries>
  readonly values: MappedValues<T_Entries>
  readonly entries: ReadonlyArray<[keyof MappedValues<T_Entries>, MappedValues<T_Entries>[keyof MappedValues<T_Entries>]]>

  constructor(reqEntries: T_Entries) {
    this.#reqEntries = reqEntries
    this.#set = new Set(reqEntries.map(e => typeof e === 'string' ? e : e.key))

    const keys: any = {}
    const values: any = {}
    const entries: any[] = []

    for (const e of reqEntries) {
      const k = typeof e === 'string' ? e : e.key
      const v = typeof e === 'string' ? e : e.value

      keys[k] = k
      values[k] = v
      entries.push([k, v])
    }

    this.keys = Object.freeze(keys) as MappedKeys<T_Entries>
    this.values = Object.freeze(values) as MappedValues<T_Entries>
    this.entries = Object.freeze(entries) as ReadonlyArray<[keyof MappedValues<T_Entries>, MappedValues<T_Entries>[keyof MappedValues<T_Entries>]]>
  }



  /**
   * Determines if the potential enum recieved by `has()` is a valid enum according to the current `this.#set`
   * @param potentialEnum The value we are wondering is an enum
   * @returns Boolean, Is the potential enum valid or not
   */
  has(potentialEnum: unknown): potentialEnum is keyof MappedValues<T_Entries> {
    return typeof potentialEnum === 'string' && this.#set.has(potentialEnum)
  }



  /**
   * The enums as a string joined together
   * @param joinedBy How the enums are joined, defaults to " | "
   */
  toString(joinedBy = ' | '): string {
    return this.#reqEntries
      .map(e => typeof e === 'string' ? e : `${e.key}: ${e.value}`)
      .join(joinedBy)
  }
}



/**
 * - Receives a `enums` object
 * - Gives back the enums's type, example: `'yin' | 'yang'`
 */

export type InferEnums<T_Enums extends Enums<readonly EnumEntry[]>> = T_Enums extends Enums<infer T_Values>
  ? T_Values[number]
  : never



/**
 * - What get's passed to the Enums constructor
 */
export type EnumEntry = string | { key: string; value: string }



/**
 * - Turns enum entries into `{ key1: "value1", key2: "value2" }`
 */
type MappedValues<T extends readonly EnumEntry[]> = { 
  [P in T[number] as 
    P extends string ? P :
    P extends { key: infer K extends string } ? K : 
    never
  ]: 
    P extends string ? P :
    P extends { value: infer V } ? V : 
    never
}


/**
 * - Turns enum entries into `{ key1: "key1", key2: "key2" }`
 */
type MappedKeys<T extends readonly EnumEntry[]> = { 
  [P in T[number] as 
    P extends string ? P :
    P extends { key: infer K extends string } ? K : 
    never
  ]: 
    P extends string ? P :
    P extends { key: infer K extends string } ? K :
    never
}
