/**
 * 🧚‍♀️ How to access:
 *     - Plugin: solid
 *     - import '@ace/tooltip.styles.css'
 *     - import { refTooltip } from '@ace/refTooltip'
 *     - import type { RefTooltipProps, TooltipPosition } from '@ace/refTooltip'
 */


import { render } from 'solid-js/web'
import { mergeStrings } from './merge'
import type { PopoverPosition } from './types'
import { createPositionPopover } from '../createPositionPopover'
import { createSignal, onMount, onCleanup, createUniqueId, createMemo, createEffect, type JSX, type Accessor } from 'solid-js'


/**
 * ### Create a tooltip on any element w/ `6` position options
 * - Tooltip shows as you hover over the `aimElement` or the `tooltip`
 * - Custom props can be given to the tooltip like `id`, `class`, `style` etc.
 * - Custom show/hide animations can be applied w/ css updates to `.ace-tooltip > .visible`
 * - Updating the background color of the `tooltip` & the `arrow` can be done as seen in the example below
 * @example
  ```tsx
  <div class="info" ref={refTooltip(() => { content: 'Aloha!' })}>?</div>
  ```
 */
export function refTooltip<T extends HTMLElement>(props: Accessor<{
  /** String OR JSX content inside the tooltip */
  content: JSX.Element
  /** Optional, default is `topCenter`, position relative to the element the ref is on */
  position?: PopoverPosition,
  /** Extra HTML props (`class`, `style`, etc.) - 🚨 `style` must be set as an `object` and not a `string` for prop merging to work */
  $div?: JSX.HTMLAttributes<HTMLDivElement>
}>) {
  return (aimElement: T | null) => {
    if (!aimElement) return

    onMount(() => {
      const id = 'ace-tooltip-' + createUniqueId()

      aimElement.setAttribute('aria-describedby', id)
      aimElement.setAttribute('aria-expanded', 'false')

      const mountableElement = document.createElement('div')

      document.body.appendChild(mountableElement)

      // render the tooltip component in the mountable element
      const cleanupRender = render(() => <TooltipComponent id={id} refProps={props} aimElement={aimElement} />, mountableElement)

      // the tooltip component listens to mouseenter & mouseleave events
      const show = () => mountableElement.firstChild?.dispatchEvent(new Event('mouseenter'))
      const hide = () => mountableElement.firstChild?.dispatchEvent(new Event('mouseleave'))

      // when we toggle hover on the aim element, toggle hover on the tooltip component
      aimElement.addEventListener('mouseenter', show)
      aimElement.addEventListener('mouseleave', hide)

      onCleanup(() => { // solid’s directive lifecycle runs cleanup before removing the element from the DOM
        aimElement.removeEventListener('mouseenter', show)
        aimElement.removeEventListener('mouseleave', hide)
        cleanupRender()
        document.body.removeChild(mountableElement)
        aimElement.removeAttribute('aria-describedby')
      })
    })
  }
}



function TooltipComponent(componentProps: {
  id: string,
  refProps: RefTooltipProps,
  aimElement: HTMLElement
}) {
  let hideTimeout: number
  let tooltipElement: HTMLDivElement | undefined

  const [visible, setVisible] = createSignal(false)
  const position = createMemo(() => componentProps.refProps().position ?? 'topCenter')

  createEffect(() => {
    if (visible()) positionTooltip()
  })

  const show = () => {
    if (!tooltipElement) return
    clearTimeout(hideTimeout) // always start fresh
    setVisible(true)
    componentProps.aimElement.setAttribute('aria-expanded', 'true')
  }

  const hide = () => {
    hideTimeout = window.setTimeout(() => {
      setVisible(false)
      componentProps.aimElement.setAttribute('aria-expanded', 'false')
    }, 100)
  }

  const positionTooltip = createPositionPopover({
    position,
    popoverElement: () => tooltipElement,
    aimElement: componentProps.aimElement,
  })

  const mergedClass = createMemo(() => mergeStrings(
    'ace-tooltip',
    'position-' + position(),
    componentProps.refProps().$div?.class
  ))

  return <>
    <div
      id={componentProps.id}
      role="tooltip"
      ref={tooltipElement!}
      onMouseEnter={show}
      onMouseLeave={hide}
      aria-hidden={!visible()}
      classList={{visible: visible()}}
      {...componentProps.refProps().$div}
      class={mergedClass()}
    >
      <div class="arrow" />
      <div class="content">{componentProps.refProps().content}</div>
    </div>
  </>
}



export type RefTooltipProps = Parameters<typeof refTooltip>[0]
