import type { FlatMessages } from './fundamentals/types'
import { defaultMessageName } from './fundamentals/vars'


/**
 * - In `valibot` / `zod`, messages are `[string, string[]][]`
 * - On the `BE` messages are: `Record<string, string[]>`
 * - On the `FE` messages are: `Map<string, Signal<string[]>>`
 */
export class BEMessages {
  messages: FlatMessages


  constructor() {
    this.messages = {}
  }


  push(message: string, name: string = defaultMessageName) {
    const current = this.messages[name] || []

    current.push(message)

    this.messages[name] = current
  }


  get() {
    return this.messages
  }


  has() {
    return Boolean(Object.keys(this.messages).length)
  }
}
