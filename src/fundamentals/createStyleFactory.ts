/**
 * 🧚‍♀️ How to access:
 *     - Plugin: solid
 *     - import { createStyleFactory } from '@ace/createStyleFactory'
 *     - import type { CreateStyleProps, CreateStyleTransformer, CreateStyleTuple } from '@ace/createStyleFactory'
 */


import { createMemo, type JSX } from 'solid-js'



/**
 * Helpful when we'd love to build a component that alters css variables based on props
 * @param props.componentProps All component props
 * @param props.requestStyle Optional, typically something like `props.$div.style`, IF provided as an object THEN we will merge these styles w/ the computed style(), is highest precedent, IF provided as a string THEN we will error b/c we can't merge a string into an object w/o unnecessary/combuersome hacks so use an object please
 */
export function createStyleFactory<T_Props extends Record<string, any>>(props: {
  /** All component props */
  componentProps: T_Props
  /** Optional, typically something like `props.$div.style`, IF provided as an object THEN we will merge these styles w/ the computed style(), is highest precedent, IF provided as a string THEN we will error b/c we can't merge a string into an object w/o unnecessary/combuersome hacks so use an object please */
  requestStyle?: JSX.CSSProperties | string
}) {
  return { sm, createStyle }

  /**
   * ### Style Map Function
   * @example
    ```ts
    const style = createStyle([
      sm('bg', '--tron-bg'),
      sm('colors', '--tron-colors'),
      sm('color', (propsValue) => ({ '--tron-colors': `transparent, ${propsValue}` })),
    ])
    ```
   * @param propsKey Key is props object
   * @param cssVarOrTransformer The css var we'd love to bind to OR a transformer
   * @returns Typesafe tuple w/ provided values for `createStyle()`
   */
  function sm<T_Key extends keyof T_Props>(
    /** Key is props object */
    propsKey: T_Key,
    /** The css var we'd love to bind to OR a transformer */
    cssVarOrTransformer: string | CreateStyleTransformer<T_Props, T_Key>
  ): CreateStyleTuple<T_Props, T_Key> {
    return [propsKey, cssVarOrTransformer]
  }


  /**
   * - Creates a `style()` `memo` that takes into consideration requested styles (ex: `$div.style`) & the provided style `maps`
   * - 🚨 IF `propValue` is undefined THEN no addition is made to responded `style() memo`, so no empty variables are added to our HTML
   * - 🚨 IF multiple map items produce the same CSS variable as seen in the example below THEN last takes precedence (this is why maps is an array)
   * @example
    ```ts
    const style = createStyle([
      sm('bg', '--tron-bg'),
      sm('colors', '--tron-colors'),
      sm('color', (propsValue) => ({ '--tron-colors': `transparent, ${propsValue}` })),
    ])
    ```
   * @param maps Typesafe Tuples, created w/ `sm()`
   */
  function createStyle(
    /** Typesafe Tuples, created w/ `sm()` */
    maps: CreateStyleTuple<T_Props>[]
  ) {
    return createMemo<JSX.CSSProperties>(() => {
      const style: JSX.CSSProperties = {}

      // apply mapped CSS variables
      for (const [propKey, cssVarOrTransformer] of maps) {
        const value = props.componentProps[propKey]

        if (value !== undefined) {
          if (typeof cssVarOrTransformer === 'function') Object.assign(style, cssVarOrTransformer(value, props.componentProps))
          else style[cssVarOrTransformer as keyof JSX.CSSProperties] = value
        }
      }

      // merge requested inline style
      if (props.requestStyle) {
        if (typeof props.requestStyle === 'string') {
          throw new Error('This component requires `style` to be an object, not a string.', { cause: { requestStyle: props.requestStyle }})
        }

        Object.assign(style, props.requestStyle)
      }

      return style
    })
  }
}



export type CreateStyleProps = Parameters<typeof createStyleFactory>[0]



/**
 * - Receives: Props value & props
 * - Gives: Styles to be applied
 */
export type CreateStyleTransformer<
  T_Props extends Record<string, any>,
  T_Key extends keyof T_Props
> = (propsValue: T_Props[T_Key], props: T_Props) => Record<string, string>



/**
 * - `T_Key`: Each key in `T_Props`
 * - `[T_K in T_Key]`: For each key in `T_Key`, create an object property
 * - `[T_K, string | CreateStyleTransformer<T_Props, T_K> ]`
 *     - The `tuple`
 *     - Index `0` is the object property key
 *     - Index `1` is the css variable or the transformer
 * - `[T_Key]`
 *     - Indexing an object type with a union of keys produces a union of the corresponding value types
 */
export type CreateStyleTuple<
  T_Props extends Record<string, any>,
  T_Key extends keyof T_Props = keyof T_Props
> = {
  [ T_K in T_Key]: [T_K, string | CreateStyleTransformer<T_Props, T_K> ]
}[T_Key]
