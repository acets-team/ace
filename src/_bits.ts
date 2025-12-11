// import type { AceKey } from './fundamentals/types'
// import { createSignal, type Signal } from 'solid-js'
// import { createAceKey } from './fundamentals/createAceKey'


// /**
//  * - Boolean Signal Management! 👷‍♀️
//  */
// export class Bits {
//   #bits: Map<string, Signal<undefined | boolean>> = new Map()


//   /**
//    * - Set signal value for a bitKey
//    * - IF `get()` is called before `set()` then the accessor value will be `undefined`. This way you can know if a bit is `true`, `false`, AND not `set yet` :)
//    * @param bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
//    * @param value - Set bit value
//    */
//   set(bitKey: AceKey, value: undefined | boolean): Signal<undefined | boolean> {
//     let _bitKey = createAceKey(bitKey)

//     let signal = this.#bits.get(_bitKey)

//     if (signal) signal[1](value) // if signal in map => call it's setter
//     else {
//       signal = createSignal(value)
//       this.#bits.set(_bitKey, signal) // create signal / set signal to value / add signal to map
//     }

//     return signal
//   }



//   /**
//    * - Get the current value by `bitKey`
//    * - IF `set()` has not been called yet @ this `bitKey` but you call `get()` then we will return `undefined` as the value, this way you can know if a bit is `true`, `false`, AND `not set yet` :)
//    * @param bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
//    */
//   get(bitKey: AceKey): boolean | undefined {
//     let _bitKey = createAceKey(bitKey)

//     const signal$ = this.#bits.get(_bitKey)

//     if (signal$) return signal$[0]() // if signal in map => return it's current value
//     else return this.set(bitKey, undefined)[0]() // not set yet, so init to Accessor<undefined>
//   }
// }
