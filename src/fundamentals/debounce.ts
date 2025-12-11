/**
 * 🧚‍♀️ How to access:
 *     - Plugin: vanilla
 *     - import { debounce } from '@ace/debounce'
 */



/**
 * - Create a type-safe function that restricts how frequently `fn` is called
 * - Every time the type-safe & debounced `fn` is called we will wait `delay` till we allow `fn` implementation to occur
 * - Ex: Every time the debounced function is called, it resets the clock. & `fn` implementation only happens if the clock is allowed to run down to zero without being reset
 * @example
  ```
  const onSearchInput = debounce((value: string) => {
    console.log('value', value)
  }, 150)

  <input onInput={(e) => onSearchInput(e.currentTarget.value)} type="text" />
  ```
 * @param fn The function to debounce
 * @param delay On debounced `fn` call -> wait `delay` till we allow `fn` implementation to occur
 * @returns Type-safe `fn` that automatically debounces
 */
export function debounce <T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: number | undefined

  return (...args: Parameters<T>) => {
    // on first call they'll be no timeoutId so the timer will begin
    // then every time the `fn` is called before the delay has elapsed, this condition will be true
    if (timeoutId) {
      window.clearTimeout(timeoutId) // cancels the pending execution of the function that was scheduled during the previous call
    }

    timeoutId = window.setTimeout(() => { // set a new timeout
      fn(...args)
    }, delay)
  }
}
