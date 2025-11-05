import { config } from 'ace.config'
import { createSignal, type Signal } from 'solid-js'
import { defaultMessageName } from './fundamentals/vars'
import type { AceErrorProps } from './fundamentals/aceError'


/**
 * - Messages are grouped by name: `Map<string, Signal<string[]>>`
 * - Messages are read from `response.error.messages` & typically have `valibot` / `zod` errors
 * - If `response.error.message` is defined, we'll put that value @ `mesages[defaultMessageName] = [response.error.message]`
 */
export class ScopeComponentMessages {
  #messages: Map<string, Signal<string[]>> = new Map()


  /**
   * @param value - Value to set onto
   * @param name - Messages are grouped by name
   * @param clearOnSubmit - If on form submit should this signal reset, default to true
   */
  set({ name = config.defaultMessageName || defaultMessageName, value }: { name?: string, value: string | string[] }): Signal<string[]> {
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
  get(name: string = config.defaultMessageName || defaultMessageName): Signal<string[]> {
    const current$ = this.#messages.get(name)
    return (current$) ? current$ : this.clear(name)
  }


  /**
   * @param value - If `value` is an array => concat `value` w/ `#messages`, if `value` is a `string` => push `value` onto `#messages`
   * @param name - Messages are grouped by name
   */
  push({ name = config.defaultMessageName || defaultMessageName, value }: { name?: string, value: string | string[] }): void {
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
      if (res?.isAceError === true || res?.message) this.#align(res)
      else if (res?.error?.isAceError === true) this.#align(res.error)
    }
  }


  #align(error: AceErrorProps) {
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
