/**
 * 🧚‍♀️ How to use:
 *   Plugin: solid
 *   import { Pulse } from '@ace/pulse'
 */


import type { JSX } from 'solid-js'


/**
 * ### Helpful when you'd love a pulse loading effect
 * @param props.delay - Optional, default is 0, number of ms to wait before animation starts, helpful for staggering
 * @param props.$div -  Optional, additonal props to place on the wrapper html div, ex: `id`, `class`, `style`
 * @returns 
 */
export function Pulse(props?: {
  /** Optional, default is 0, number of ms to wait before animation starts, helpful for staggering */
  delay?: number,
  /** Optional, additonal props to place on the wrapper html div, ex: `id`, `class`, `style` */
  $div?: JSX.HTMLAttributes<HTMLDivElement>,
}) {
  const baseClass = 'ace-pulse'
  const mergedClass = props?.$div?.class ? `${baseClass} ${props.$div.class}`  : baseClass

  const baseStyle: JSX.CSSProperties = { '--pulse-delay': `${props?.delay || 0}ms` }
  const mergedStyle = typeof props?.$div?.style === 'object' ? { ...baseStyle, ...props.$div.style } : baseStyle

  return <>
    <div {...props?.$div} class={mergedClass} style={mergedStyle}></div>
  </>
}
