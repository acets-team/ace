import { createSignal, type Signal } from 'solid-js'
import { defaultMessageName } from './fundamentals/vars'
import { AceErrorType } from './fundamentals/types'


/**
 * - String Array Signal Management! 👷‍♀️
 *     - In `valibot` / `zod`, messages are `Record<string, string[]>`
 *     - On the `BE` messages are: `Record<string, string[]>`
 *     - On the `FE` messages are: `Map<string, Signal<string[]>>`
 */
export class FEMessages {
  #messages: Map<string, Signal<string[]>> = new Map()


  /**
   * @param value - Value to set onto
   * @param name - Messages are grouped by name
   * @param clearOnSubmit - If on form submit should this signal reset, default to true
   */
  set({ name = defaultMessageName, value }: { name?: string, value: string | string[] }): Signal<string[]> {
    let signal$ = this.#messages.get(name)
    const v = Array.isArray(value) ? value : [value]

    if (signal$) signal$[1](v)
    else {
      signal$ = createSignal(v)
      this.#messages.set(name, signal$)
    }

    return signal$
  }
  


  /**
   * If the signal has not been gotten yet, set it, this way no matter if the set or get happens first the signal will render
   * @param name - Messages are grouped by name
   */
  get(name: string = defaultMessageName): Signal<string[]> {
    const current$ = this.#messages.get(name)
    return (current$) ? current$ : this.clear(name)
  }


  /**
   * @param value - If `value` is an array => concat `value` w/ `#messages`, if `value` is a `string` => push `value` onto `#messages`
   * @param name - Messages are grouped by name
   */
  push({ name = defaultMessageName, value }: { name?: string, value: string | string[] }): void {
    const [current, setCurent] = this.get(name)

    if (Array.isArray(value)) setCurent(current().concat(value))
    else setCurent([ ...current(), value ])
  }


  /** 
   * - Reset
   * - Clear messages at one name
   * - May also be used to init messages at a name
   */
  clear(name: string): Signal<string[]> {
    return this.set({ name, value: [] })
  }


  /** Clear all messages */
  clearAll() {
    this.#messages.forEach((signal, name) => {
      if (signal[0]().length) this.clear(name)
    })
  }


  /**
   * - Align error message, or messages, with signals
   */
  align(res: any) {
    if (res && typeof res === 'object') {
      if (res?.isAceError === true) this.#align(res)
      else if (res?.error?.isAceError === true) this.#align(res.error)
    }
  }


  #align(error: AceErrorType) {
    if (error.messages) {
      for (const name in error.messages) { // messages are grouped by name
        const signal$ = this.#messages.get(name)

        if (Array.isArray(error.messages[name])) {
          if (signal$) signal$[1](error.messages[name]) // call setter
          else this.set({ name, value: error.messages[name] }) // create setter
        }
      }
    }

    if (error.message) {
      const signal$ = this.#messages.get(defaultMessageName)

      if (signal$) signal$[1]([error.message])
      else this.set({ name: defaultMessageName, value: error.message })
    }
  }
}
