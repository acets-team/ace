/**
 * 🧚‍♀️ How to access:
 *     - Plugin: tron
 *     - import { Tron } from '@ace/tron'
 *     - import type { TronProps, TronPropsType } from '@ace/tron'
 */


import { mergeStrings } from './merge'
import { createMemo, type JSX } from 'solid-js'


export function Tron(props: {
  bg?: string,
  width?: string,
  speed?: string,
  color?: string,
  colors?: string,
  zIndex?: string,
  padding?: string,
  children: JSX.Element,
  borderRadius?: string,
  opacitySpeed?: string,
  /** Optional, default is 'hover' */
  status?: TronPropsStatus,
  $div?: JSX.HTMLAttributes<HTMLDivElement>,
}) {
  const style = createStyle(props)

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


function createStyle(props: TronProps) {
  return createMemo<JSX.CSSProperties>(() => {
    const style: JSX.CSSProperties = {}

    if (props.bg) style['--tron-bg'] = props.bg
    if (props.width) style['--tron-width'] = props.width
    if (props.speed) style['--tron-speed'] = props.speed
    if (props.colors) style['--tron-colors'] = props.colors
    if (props.zIndex) style['--tron-z-index'] = props.zIndex
    if (props.padding) style['--tron-padding'] = props.padding
    if (props.borderRadius) style['--tron-border-radius'] = props.borderRadius
    if (props.opacitySpeed) style['--tron-opacity-speed'] = props.opacitySpeed
    if (props.color) style['--tron-colors'] = `transparent, transparent, ${props.color}`

    return style
  })
}


export type TronProps = Parameters<typeof Tron>[0]


export type TronPropsStatus = 'off' | 'hover' | 'infinite'
