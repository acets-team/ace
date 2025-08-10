/**
 * 🧚‍♀️ How to access:
 *     - import { destructureReady } from '@ace/destructureReady'
 */


/**
 * #### Without this, if we destructure `scope.success()` and w/in `scope.success()` it calls `this.respond()`, `this` is undefined
 * @param instance - Object that we want to be destructure ready
 * @example
    ```
    constructor() {
      destructureReady(this)
    }
    ```
 */
export function destructureReady(instance: any) {
  const proto = Object.getPrototypeOf(instance) // instance property map, key is property name, value is the method or getters, shared across all instances
  const descriptors = Object.getOwnPropertyDescriptors(proto) // instance property map that tell us is each property a method or a getter

  for (const [key, descriptor] of Object.entries(descriptors)) { // loop instance properties
    if (key === 'constructor') continue // skip b/c no need to bind the constructor
    if (typeof descriptor.value === 'function') instance[key] = descriptor.value.bind(instance) // if method => bind (descriptor.value is the method), (.bind(instance) creates a new function where this inside the function is fixed to the current instance object) (instance[key] = ... assigns the bound function to the instance)

    if (descriptor.get) { // redefine getter on the instance so the getter is bound to the instance
      Object.defineProperty(instance, key, {
        enumerable: true, // so it show up when enumerating properties
        configurable: true, // keeps class instance property default behavior, can be changed / deleted
        get: descriptor.get.bind(instance) // bind getter to instance
      })
    }
  }
}
