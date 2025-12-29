/**
 * 🧚‍♀️ How to access:
 *     - Plugin: solid
 *     - import { Loading } from '@ace/loading'
 *     - import type { LoadingProps } from '@ace/loading'
 */


import type { JSX } from 'solid-js'
import { mergeStrings } from './merge'
import { createStyleFactory } from './createStyleFactory'


/**
 * ### Aria compliant loading spinner!
 * Add to `app.tsx` => `import '@ace/loading.styles.css'` & then:
 * @example
  ```tsx
  <Loading color="black" />

  <Loading type="two" color="red" twoColor="blue" />

  <Loading label="Processing..." $span={{ id: "loader" }} />
  ```
 * @param props.variant Optional, defaults to `one`, IF `one` THEN one spinner shows, IF `two` THEN two spinners show
 * @param props.color Optional, color of first spinner, IF defined THEN sets value of `--ace-loading-color
 * @param props.size Optional, spinner height/width, IF defined THEN sets value of `--ace-loading-size`
 * @param props.thickness Optional, thickness of spinner, IF defined THEN sets value of `--ace-loading-thickness`
 * @param props.speed Optional, spinning speed, IF defined THEN sets value of `--ace-loading-speed`
 * @param props.twoColor Optional, IF `props.variant` is `two` THEN `props.twoColor` will set the color for the 2nd spinner w/ the css variable `--ace-loading-two-color`
 * @param props.label Optional, text to announce to screen readers, `default: 'Loading...'`
 * @param props.$span Optional, html props to add to wrapper span, class of `ace-loading` is added by default, IF setting `style` THEN must be of type object
 */
export function Loading (props: {
  /** Optional, defaults to `one`, IF `one` THEN one spinner shows, IF `two` THEN two spinners show */
  variant?: 'one' | 'two'
  /** Optional, color of first spinner, IF defined THEN sets value of `--ace-loading-color` */
  color?: string
  /** Optional, spinner height/width, IF defined THEN sets value of `--ace-loading-size` */
  size?: string
  /** Optional, thickness of spinner, IF defined THEN sets value of `--ace-loading-thickness` */
  thickness?: string
  /** Optional, spinning speed, IF defined THEN sets value of `--ace-loading-speed` */
  speed?: string
  /** Optional, IF `props.variant` is `two` THEN `props.twoColor` will set the color for the 2nd spinner w/ the css variable `--ace-loading-two-color` */
  twoColor?: string
  /** Optional, text to announce to screen readers, `default: 'Loading...'` */
  label?: string
  /** Optional, html props to add to wrapper span, class of `ace-loading` is added by default, IF setting `style` THEN must be of type object */
  $span?: JSX.HTMLAttributes<HTMLSpanElement>
}) {
  if (props.variant == undefined) props.variant = 'one'

  const { sm, createStyle } = createStyleFactory({ componentProps: props, requestStyle: props.$span?.style })
  
  const style = createStyle([
    sm('size', '--ace-loading-size'),
    sm('thickness', '--ace-loading-thickness'),
    sm('color', '--ace-loading-color'),
    sm('speed', '--ace-loading-speed'),
    sm('twoColor', '--ace-loading-two-color'),
  ])

  return <>
    <span
      role="status"
      aria-live="polite"
      {...props.$span}
      style={style()}
      class={mergeStrings('ace-loading', props.$span?.class, props.variant === 'two' ? 'ace-loading--two' : '')}
    >
      <span class="label">{props.label || 'Loading...'}</span>
    </span>
  </>
}


export type LoadingProps = Parameters<typeof Loading>[0]
