/**
 * 🧚‍♀️ How to access:
 *     - import { refs } from '@ace/refs'
 */


/** 
 * - Add multiple ref functions to 1 element
*/
export function refs<T extends HTMLElement>( ...refs: ((el: T) => void)[] ) {
  return (el: T) => refs.forEach(ref => ref(el))
}
