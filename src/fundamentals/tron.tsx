/**
 * 🧚‍♀️ How to access:
 *     - Plugin: tron
 *     - import '@ace/tron.styles.css'
 *     - import { Tron } from '@ace/tron'
 *     - import type { TronProps, TronPropsType } from '@ace/tron'
 */


import type {  JSX } from 'solid-js'
import { mergeStrings } from './merge'
import { createStyleFactory } from './createStyleFactory'


/**
 * ### Surround an item w/ a light that looks like the game `tron`
 * - Add to `app.tsx` => `import '@ace/dropdown.styles.css'`
 * @param props.children 🚨 Will not look good if the root child is `display: inline` (ex: `anchor`) in this case please set display to `inline-block`
 * @param props.bg Optional, Background for the visible `ace-tron__content`, IF defined sets value of `--ace-tron-bg`
 * @param props.width Optional, width of the tron light, IF defined sets value of `--ace-tron-width`
 * @param props.speed Optional, speed that tron light flows around, IF defined sets value of `--ace-tron-speed`
 * @param props.color Optional, helpful when you'd like one color rather then multiple, IF defined sets value of `--ace-tron-colors` to `transparent, transparent, color`
 * @param props.colors Optional, visible tron lights, ending w/ the color we start w/ is helpful visually for `conic-gradient`, IF defined sets value of `--ace-tron-colors`
 * @param props.zIndex Optional, zIndex for tron light, IF defined sets value of `--ace-tron-z-index`
 * @param props.opacitySpeed Optional, how quickly does the tron light become visible, IF defined sets value of `--ace-tron-opacity-speed`
 * @param props.status Optional, `off` is not visible, `infinite` always shows & `hover` shows on hover, default is `hover`
 * @param props.borderRadius Optional, tron light & inner content radius, IF defined sets value of `--ace-tron-border-radius`
 * @param props.$div Optional, html props to add to wrapper div, class of `ace-tron` is added by default, IF setting `style` THEN must be of type object
 */
export function Tron(props: {
  /** Optional, Background for the visible `ace-tron__content`, IF defined sets value of `--ace-tron-bg` */
  bg?: string,
  /** Optional, width of the tron light, IF defined sets value of `--ace-tron-width` */
  width?: string,
  /** Optional, speed that tron light flows around, IF defined sets value of `--ace-tron-speed` */
  speed?: string,
  /** Optional, helpful when you'd like one color rather then multiple, IF defined sets value of `--ace-tron-colors` to `transparent, transparent, color` */
  color?: string,
  /** Optional, visible tron lights, ending w/ the color we start w/ is helpful visually for `conic-gradient`, IF defined sets value of `--ace-tron-colors` */
  colors?: string,
  /** Optional, zIndex for tron light, IF defined sets value of `--ace-tron-z-index` */
  zIndex?: string,
  /** Optional, tron light & inner content radius, IF defined sets value of `--ace-tron-border-radius` */
  borderRadius?: string,
  /** 🚨 Will not look good if the root child is `display: inline` (ex: `anchor`) in this case please set display to `inline-block` */
  children: JSX.Element,
  /** Optional, how quickly does the tron light become visible, IF defined sets value of `--ace-tron-opacity-speed` */
  opacitySpeed?: string,
  /** Optional, `off` is not visible, `infinite` always shows & `hover` shows on hover, default is `hover` */
  status?: TronPropsStatus,
  /** Optional, html props to add to wrapper div, class of `ace-tron` is added by default, IF setting `style` THEN must be of type object */
  $div?: JSX.HTMLAttributes<HTMLDivElement>,
}) {
  const { sm, createStyle } = createStyleFactory({ componentProps: props, requestStyle: props.$div?.style })

  const style = createStyle([
    sm('bg', '--ace-tron-bg'),
    sm('width', '--ace-tron-width'),
    sm('speed', '--ace-tron-speed'),
    sm('zIndex', '--ace-tron-z-index'),
    sm('borderRadius', '--ace-tron-border-radius'),
    sm('opacitySpeed', '--ace-tron-opacity-speed'),
    sm('colors', '--ace-tron-colors'),
    sm('color', (propsValue) => ({ '--ace-tron-colors': `transparent, transparent, ${propsValue}` })),
  ])

  return <>
    <div {...props.$div} style={style()} class={mergeStrings('ace-tron', props.$div?.class, props.status ? `ace-tron--${props.status}` : 'ace-tron--hover')}>
      <div class="ace-tron__light-trim">
        <div class="ace-tron__light-wrapper">
          <div class="ace-tron__light"></div>
        </div>
      </div>

      <div class="ace-tron__content">
        {props.children}
      </div>
    </div>
  </>
}


export type TronProps = Parameters<typeof Tron>[0]


export type TronPropsStatus = 'off' | 'hover' | 'infinite'
