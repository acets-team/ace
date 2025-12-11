/**
 * 🧚‍♀️ How to access:
 *     - import { Loading } from '@ace/loading'
 */


import type { JSX, Component } from 'solid-js'
import { mergeObjects, mergeStrings } from './merge'


/**
 * ### Aria compliant loading spinner!
 * Add to `app.tsx` => `import '@ace/loading.styles.css'` & then:
 * @example
  ```tsx
  <Loading color="black" />

  <Loading type="two" color="black" twoColor="white" />

  <Loading label="Processing..." $span={{ id: "loader" }} />
  ```
  @example
  ```css
  .ace-loading {
    --ace-loading-color: var(--primary-color);
  }

  .brand {
    color: white;
    border: none;
    background-color: var(--primary-color);

    .ace-loading {
      --ace-loading-color: white;
    }
  }
  ```
 * 
 * ### 🎨 Custom CSS Variables:
 * - `--ace-loading-color`: Primary color, default: `gold`
 * - `--ace-loading-two-color`: Secondary color for `type="two"`, default: `white`
 * - `--ace-loading-size`: Spinner height & width, default: `2.1rem`
 * - `--ace-loading-thickness`: Spinner thickness, default: `0.3rem`
 * - `--ace-loading-speed`: Spin speed, default: `1s`
 * 
 * @param props.type - Optional, spinner type: `'one' (default) or 'two'`
 * @param props.size - Optional, spinner height & width, `default: 2.1rem`
 * @param props.thickness - Optional, spinner thickness, `default: 0.3rem`
 * @param props.speed - Optional, spinner speed, `default: 1s`
 * @param props.twoColor - Optional, if type is `two`, this will set the color for the 2nd spinner, `default: white`
 * @param props.label - Optional, text to announce to screen readers, `default: 'Loading...'`
 * @param props.$span - Optional, additional props to spread onto the outer `span`
 */
export const Loading: Component<LoadingProps> = ({ type, size, thickness, color, speed, twoColor, label, $span }) => {
  const requestedStyle = typeof $span?.style === 'object' ? $span.style : {}

  const propsStyle: JSX.CSSProperties = {}

  if (size) propsStyle['--ace-loading-size'] = size
  if (thickness) propsStyle['--ace-loading-thickness'] = thickness
  if (color) propsStyle['--ace-loading-color'] = color
  if (speed) propsStyle['--ace-loading-speed'] = speed
  if (twoColor) propsStyle['--ace-loading-two-color'] = twoColor

  return <>
    <span
      role="status"
      aria-live="polite"
      {...$span}
      style={mergeObjects({ base: propsStyle, request: requestedStyle })}
      class={mergeStrings('ace-loading', type === 'two' ? 'ace-loading--two' : '', $span?.class)}
    >
      <span class="label">{label || 'Loading...'}</span>
    </span>
  </>
}


export type LoadingProps = {
  /** Optional, spinner type: 'one' (default) or 'two' */
  type?: 'one' | 'two'
  /** Optional,  spinner height & width, default: `2.1rem` */
  size?: string
  /** Optional, spinner thickness, `default: 0.3rem` */
  thickness?: string
  /** Optional, spinner color, `default: gold` */
  color?: string
  /** Optional, spinner speed, `default: 1s` */
  speed?: string
  /** Optional, if type is `two`, this will set the color for the 2nd spinner, `default: white` */
  twoColor?: string
  /** Optional, text to announce to screen readers, `default: 'Loading...'` */
  label?: string
  /** Optional, additional props to spread onto the outer `span` */
  $span?: JSX.HTMLAttributes<HTMLSpanElement>
}
