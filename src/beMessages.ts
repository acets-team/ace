import type { FlatMessages } from './fundamentals/types'
import { DEFAULT_MESSAGE_NAME } from './fundamentals/vars'


/**
 * - In `valibot` / `zod`, messages are `[string, string[]][]`
 * - On the `BE` messages are: `Map<string, string[]>`
 * - On the `FE` messages are: `Map<string, Signal<string[]>>`
 */
export class BEMessages {
  messages: FlatMessages


  constructor() {
    this.messages = {}
  }


  push(message: string, name: string = DEFAULT_MESSAGE_NAME) {
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
