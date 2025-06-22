/**
 * 🧚‍♀️ How to access:
 *     - import { Loading } from '@ace/loading'
 */


import type { JSX, Component } from 'solid-js'


/**
 * ### Aria compliant loading spinner!
 * Add to `app.tsx` => `import '@ace/loading.styles.css'` & then:
 * @example
  ```tsx
  <Loading color="black" />

  <Loading type="two" color="black" twoColor="white" />

  <Loading label="Processing..." spanProps={{ id: "loader" }} />
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
 * - `--ace-loading-width`: Spinner width, default: `2.1rem`
 * - `--ace-loading-height`: Spinner height, default: `2.1rem`
 * - `--ace-loading-thickness`: Spinner thickness, default: `0.3rem`
 * - `--ace-loading-speed`: Spin speed, default: `1s`
 * 
 * @param props.type - Optional, spinner type: `'one' (default) or 'two'`
 * @param props.width - Optional, spinner width, `default: 2.1rem`
 * @param props.height - Optional, spinner height, `default: 2.1rem`
 * @param props.thickness - Optional, spinner thickness, `default: 0.3rem`
 * @param props.speed - Optional, spinner speed, `default: 1s`
 * @param props.twoColor - Optional, if type is two, this will set the color for the 2nd spinner, `default: white`
 * @param props.label - Optional, text to announce to screen readers, `default: 'Loading...'`
 * @param props.spanProps - Optional, additional props to spread onto the outer span
 */
export const Loading: Component<LoadingProps> = ({ type, width, height, thickness, color, speed, twoColor, label, spanProps }) => {
  const style: JSX.CSSProperties = {}

  if (width) style['--ace-loading-width'] = width
  if (height) style['--ace-loading-height'] = height
  if (thickness) style['--ace-loading-thickness'] = thickness
  if (color) style['--ace-loading-color'] = color
  if (speed) style['--ace-loading-speed'] = speed
  if (twoColor) style['--ace-loading-two-color'] = twoColor

  return <>
    <span
      class="ace-loading"
      classList={{ 'ace-loading--two': type === 'two' }}
      role="status"
      aria-live="polite"
      style={style}
      {...spanProps}
    >
      <span class="label">{label || 'Loading...'}</span>
    </span>
  </>
}


export type LoadingProps = {
  /** Optional, spinner type: 'one' (default) or 'two' */
  type?: 'one' | 'two'
  /** Optional, spinner width, `default: 2.1rem` */
  width?: string
  /** Optional, spinner height, `default: 2.1rem` */
  height?: string
  /** Optional, spinner thickness, `default: 0.3rem` */
  thickness?: string
  /** Optional, spinner color, `default: gold` */
  color?: string
  /** Optional, spinner speed, `default: 1s` */
  speed?: string
  /** Optional, if type is two, this will set the color for the 2nd spinner, `default: white` */
  twoColor?: string
  /** Optional, text to announce to screen readers, `default: 'Loading...'` */
  label?: string
  /** Optional, additional props to spread onto the outer span */
  spanProps?: JSX.HTMLAttributes<HTMLSpanElement>
}
