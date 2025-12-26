/**
 * 🧚‍♀️ How to access:
 *     - Plugin: solid
 */


import type { Accessor } from 'solid-js'
import type { PopoverPosition } from './fundamentals/types'


export function createPositionPopover(props: { aimElement: HTMLElement, position: Accessor<PopoverPosition>, popoverElement: Accessor<undefined | HTMLDivElement>, isDropdown?: boolean }) {
  return () => {
    const _popoverElement = props.popoverElement()
    if (!_popoverElement) return

    let top = 0, left = 0
    const aimElementRect = props.aimElement.getBoundingClientRect()
    const tooltipRect = _popoverElement.getBoundingClientRect()

    switch (props.position()) {
      case 'topCenter':
        top = aimElementRect.top - tooltipRect.height
        left = aimElementRect.left + aimElementRect.width / 2 - tooltipRect.width / 2 // 🔮
        break
      case 'topLeft':
        top = aimElementRect.top - tooltipRect.height
        left = aimElementRect.left
        break
      case 'topRight':
        top = aimElementRect.top - tooltipRect.height
        left = aimElementRect.right - tooltipRect.width
        break
      case 'bottomLeft':
        top = aimElementRect.bottom
        left = aimElementRect.left
        break
      case 'bottomRight':
        top = aimElementRect.bottom
        left = aimElementRect.right - tooltipRect.width
        break
      case 'bottomCenter':
      default:
        top = aimElementRect.bottom
        left = aimElementRect.left + aimElementRect.width / 2 - tooltipRect.width / 2
    }

    // getBoundingClientRect() gives coordinates relative to the visible viewport, not the full page, so below we adjust for scroll
    _popoverElement.style.top = `${top + window.scrollY}px`
    _popoverElement.style.left = `${left + window.scrollX}px`

    if (props.isDropdown) {
      const content = _popoverElement.querySelector<HTMLDivElement>('.ace-dropdown-content')

      if (content) content.style.maxHeight = `calc(100vh - ${top + 20}px)`
    }
  }
}
