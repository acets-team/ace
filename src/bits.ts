import { createSignal, type Signal } from 'solid-js'


/**
 * - Boolean Signal Management! 👷‍♀️
 */
export class Bits {
  #bits: Map<string, Signal<boolean>> = new Map()


  /**
   * Set signal value for a bitKey
   * @param bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   * @param value - Set bit value
   */
  set(bitKey: string, value: boolean): Signal<boolean> {
    let signal = this.#bits.get(bitKey) 

    if (signal) signal[1](value) // if signal in map => call it's setter
    else {
      signal = createSignal(value)
      this.#bits.set(bitKey, signal) // create signal / set signal to value / add signal to map
    }

    return signal
  }
  
  
  
  /**
   * - Get the current loading value by `bitKey`
   * - If there is not a signal already @ this `bitKey` THEN `isOn()` will create one & default it to false
   * @param bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   */
  isOn(bitKey: string): boolean {
    const signal$ = this.#bits.get(bitKey) 

    if (signal$) return signal$[0]() // if signal in map => return it's current value
    else return this.set(bitKey, false)[0]() // default to false
  }
}
