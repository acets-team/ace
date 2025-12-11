/**
 * 🧚‍♀️ How to access:
 *     - Plugin: vanilla
 *     - import { mergeStrings, mergeObjects, mergeArrays } from '@ace/merge'
 */



/**
 * - Helpful when you'd like to merge a deault prop w/ a request prop
 * - Example: IF `example1 example2` is requested the result will be `ace-lottie example1 example2`
 * @example
  ```
  const Lottie = (props: {
    src: string,
    config?: LottieConfig
    $canvas?: JSX.HTMLAttributes<HTMLCanvasElement>,
  }) => {
    return <>
      <canvas {...props.$canvas} class={mergeStrings('ace-lottie', props.$canvas?.class)} />
    </>
  }
  ```
 * @param baseStr - The prop value we would always love present
 * @param reqStr - Optional, IF defined the prop that is merged w/ the base prop
 * @returns - Merged props
 */
export function mergeStrings(baseStr: string, ...reqStrs: (string | undefined)[]): string {
  let result = baseStr

  // Loop through all request strings
  for (const reqStr of reqStrs) {
    // Check for truthiness (non-null, non-undefined, non-empty string)
    if (reqStr) {
      // Concatenate with a leading space
      result += ' ' + reqStr
    }
  }

  return result
}



/**
 * - Merges objects in the order: base, request, required
 * @param props.base - Default object
 * @param props.request - Optional, IF an object THEN we merge into base, IF duplicates request args win
 * @param props.required -  Optional, IF an object THEN we merge into (base + request), IF duplicates required args win
 * @example
  ```ts
  const config = mergeObjects({
    base: defaultLottieConfig,
    request: props.config,
    required: {
      canvas: el,
      src: buildOrigin + src,
    }
  })
  ```
 * @returns Merged object
 */
export function mergeObjects<T_Obj extends Record<string, any>, T_Request = any, T_Required = any>(props: {
  base: T_Obj,
  request?: T_Request,
  required?: T_Required
}): T_Obj & T_Request & T_Required {
  const base = (props.base && typeof props.base === 'object') ? props.base : {} as T_Obj
  const request = (props.request && typeof props.request === 'object') ? props.request : {} as T_Request
  const required = (props.required && typeof props.required === 'object') ? props.required : {} as T_Required

  return Object.assign({}, base, request, required) // the first arg to Object.assign gets mutated, {} avoids us mutating props.base
}



/**
 * - Merges arrays by concatenating them in the order: base, request, required
 * @example
  ```ts
  const result = mergeArrays(['a', 'b'], ['c']) // Result: ['a', 'b', 'c']
  ```
 * @param base - Default array (lowest priority/first elements)
 * @param request - Optional array, concatenated after base
 * @returns Concatenated array
 */
export function mergeArrays<T>(base: T[], ...requests: (T[] | undefined)[]): T[] {
  let result: T[] = Array.isArray(base) ? [...base] : [] // start with a shallow copy of the base array to maintain immutability

  
  for (const currentArray of requests) { // loop through all request arrays and concatenate them sequentially
    if (Array.isArray(currentArray)) {
      result = result.concat(currentArray) // concatenate the valid array to the result
    }
  }

  return result
}
