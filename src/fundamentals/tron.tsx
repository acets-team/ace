/**
 * 🧚‍♀️ How to access:
 *     - Plugin: tron
 *     - import '@ace/dropdown.styles.css'
 *     - import { Tron } from '@ace/tron'
 *     - import type { TronProps, TronPropsType } from '@ace/tron'
 */


import type {  JSX } from 'solid-js'
import { mergeStrings } from './merge'
import { createStyleFactory } from './createStyleFactory'


/**
 * ### Surround an item w/ a light that looks like the game `tron`
 * - Add to `app.tsx` => `import '@ace/dropdown.styles.css'`
 * @param props.children 🚨 Will not look good if the root child item is `display: inline` (ex: `anchor`) in this case please add set display to `inline-block`
 * @param props.bg Optional, css `background` for the visible `tron-content`, default is `linear-gradient(to bottom right, rgb(0 22 26),rgb(26, 21, 21)ba(10, 10, 20, 0.9))`
 * @param props.width Optional, width of the tron light, default is `0.3rem`
 * @param props.speed Optional, speed that tron light flows around, default is `calc(var(--ace-duration-normal) * 9)`
 * @param props.color Optional, IF defined THEN we'll set style colors to `transparent, transparent, ${props.color}` which gives the visual of one tron light
 * @param props.colors Optional, visible tron lights, ending w/ the color we start w/ is helpful visually for `conic-gradient`, default is `red, yellow, orange, green, blue, violet, red`
 * @param props.zIndex Optional, zIndex for tron light, default is `var(--ace-z-content)`
 * @param props.opacitySpeed Optional, how quickly does the tron light become default is `var(--ace-duration-normal)`
 * @param props.status Optional, `off` is not visible, `infinite` always shows & `hover` shows on hover, default is `hover`
 * @param props.borderRadius Optional, tron light & inner content radius, default is `calc(var(--ace-radius) * 3)`
 * @param props.$div Optional, html props to add to wrapper div, class of `tron` is added by default
 */
export function Tron(props: {
  /** Optional, css `background` for the visible `tron-content`, default is `linear-gradient(to bottom right, rgb(0 22 26),rgb(26, 21, 21)ba(10, 10, 20, 0.9))` */
  bg?: string,
  /** Optional, width of the tron light, default is `0.3rem` */
  width?: string,
  /** Optional, speed that tron light flows around, default is `calc(var(--ace-duration-normal) * 9)` */
  speed?: string,
  /** Optional, IF defined THEN we'll set style colors to `transparent, transparent, ${props.color}` which gives the visual of one tron light */
  color?: string,
  /** Optional, visible tron lights, ending w/ the color we start w/ is helpful visually for `conic-gradient`, default is `red, yellow, orange, green, blue, violet, red` */
  colors?: string,
  /** Optional, zIndex for tron light, default is `var(--ace-z-content)` */
  zIndex?: string,
  /** Optional, tron light & inner content radius, default is `calc(var(--ace-radius) * 3)` */
  borderRadius?: string,
  /** 🚨 Will not look good if the root child item is `display: inline` (ex: `anchor`) in this case please add set display to `inline-block` */
  children: JSX.Element,
  /** Optional, how quickly does the tron light become default is `var(--ace-duration-normal)` */
  opacitySpeed?: string,
  /** Optional, `off` is not visible, `infinite` always shows & `hover` shows on hover, default is `hover` */
  status?: TronPropsStatus,
  /** Optional, html props to add to wrapper div, class of `tron` is added by default */
  $div?: JSX.HTMLAttributes<HTMLDivElement>,
}) {
  const { sm, createStyle } = createStyleFactory({ componentProps: props, requestStyle: props.$div?.style })

  const style = createStyle([
    sm('bg', '--tron-bg'),
    sm('width', '--tron-width'),
    sm('speed', '--tron-speed'),
    sm('zIndex', '--tron-z-index'),
    sm('borderRadius', '--tron-border-radius'),
    sm('opacitySpeed', '--tron-opacity-speed'),
    sm('colors', '--tron-colors'),
    sm('color', (propsValue) => ({ '--tron-colors': `transparent, transparent, ${propsValue}` })),
  ])

  return <>
    <div {...props.$div} style={style()} class={mergeStrings('tron', props.$div?.class, props.status ?? 'hover')}>
      <div class="tron-light-trim">
        <div class="tron-light-wrapper">
          <div class="tron-light"></div>
        </div>
      </div>

      <div class="tron-content">
        {props.children}
      </div>
    </div>
  </>
}


export type TronProps = Parameters<typeof Tron>[0]


export type TronPropsStatus = 'off' | 'hover' | 'infinite'
