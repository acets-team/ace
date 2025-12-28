/**
 * 🧚‍♀️ How to access:
 *     - Plugin: solid
 *     - import '@ace/dropdown.styles.css'
 *     - import { refDropdown } from '@ace/refDropdown'
 *     - import type { RefDropdownProps, DropdownPosition, DropdownContent } from '@ace/refDropdown'
 */


import { render } from 'solid-js/web'
import { onClean } from './onClean'
import { mergeStrings } from './merge'
import type { PopoverPosition } from './types'
import { isClickOutsideAll } from './isClickOutsideAll'
import { createPositionPopover } from '../createPositionPopover'
import { createOnNavigationKeyDown } from './createOnNavigationKeyDown'
import { createSignal, onMount, onCleanup, createUniqueId, createMemo, createEffect, type JSX, type Setter, type Accessor } from 'solid-js'



/**
 * ### Create a dropdown on any element w/ `6` position options
 * - Dropdown shows when you click the `aimElement`
 * - Custom props can be given to the tooltip like `id`, `class`, `style` etc via `props.$div`
 * - Custom show/hide animations can be applied w/ css updates to `.ace-tooltip > .visible`
 * @example
  ```tsx
  <div class="info" ref={refDropdown(() => { content: 'Aloha!' })}>?</div>
  ```
 * @param props.content Function that must return jsx, constructs the dropdown & is passed the `aimElement` (dropdown trigger), `isVisible` an accessor to visibility state & `setIsVisible` to update the visibility state
 * @param props.position Optional, default is `bottomRight`, position relative to the element the ref is on
 * @param props.$div Optional, default is `bottomRight`, position relative to the element the ref is on
 * @param props.setIsDropdownVisible Optional, helpful when the parent component wants to know the dropdown visibility, create a signal in the parent component, pass the setter here, and use the accessor in the parent component
 */
export function refDropdown<T extends HTMLElement>(props: Accessor<{
  /** Function that must return jsx, constructs the dropdown & is passed the `aimElement` (dropdown trigger), `isVisible` an accessor to visibility state & `setIsVisible` to update the visibility state */
  content: (props: { aimElement: HTMLElement, setIsVisible: Setter<boolean>, isVisible: Accessor<boolean> }) => JSX.Element
  /** Optional, default is `bottomRight`, position relative to the element the ref is on */
  position?: PopoverPosition
  /** Optional, extra HTML props (`class`, `style`, etc.) - 🚨 `style` must be set as an `object` and not a `string` for prop merging to work, automatically gets a class of `ace-dropdown` */
  $div?: JSX.HTMLAttributes<HTMLDivElement>,
  /** Optional, helpful when the parent component wants to know the dropdown visibility, create a signal in the parent component, pass the setter here, and use the accessor in the parent component */
  setIsDropdownVisible?: Setter<undefined | boolean>
}>) {
  return (aimElement: T | null) => {
    if (!aimElement) return

    onMount(() => { // w/o onMount we get hydration errors
      const id = 'ace-dropdown-' + createUniqueId()

      aimElement.setAttribute('aria-describedby', id)
      aimElement.setAttribute('aria-expanded', 'false')

      const mountableElement = document.createElement('div')

      document.body.appendChild(mountableElement)

      // render the tooltip component in the mountable element
      const cleanupRender = render(() => <DropdownComponent id={id} refProps={props} aimElement={aimElement} />, mountableElement)

      onCleanup(() => { // solid’s directive lifecycle runs cleanup before removing the element from the DOM
        cleanupRender()
        document.body.removeChild(mountableElement)
        aimElement.removeAttribute('aria-describedby')
      })
    })
  }
}



function DropdownComponent(componentProps: {
  id: string,
  refProps: RefDropdownProps,
  aimElement: HTMLElement,
}) {
  let dropdownRef: HTMLDivElement | undefined

  let items: undefined | NodeListOf<HTMLElement>

  const [isVisible, setIsVisible] = createSignal(false)
  const position = createMemo(() => componentProps.refProps().position ?? 'bottomRight')

  let cleanClickOusideListener: undefined | ReturnType<typeof isClickOutsideAll>

  const onNavigationKeyDown = createOnNavigationKeyDown({
    elements: () => items, 
    onEscape: () => setIsVisible(false)
  })

  createEffect(() => {
    if (isVisible()) {
      setItems()
      disableScroll()
      positionDropdown()

      document.addEventListener('keydown', onNavigationKeyDown)

      if (dropdownRef) {
        dropdownRef.focus()

        cleanClickOusideListener = isClickOutsideAll({
          fn: () => setIsVisible(false),
          aimElements: [componentProps.aimElement, dropdownRef]
        })
      }
    } else {
      enableScroll()
      if (cleanClickOusideListener) cleanClickOusideListener()
      document.removeEventListener('keydown', onNavigationKeyDown)
    }

    componentProps.refProps().setIsDropdownVisible?.(isVisible())
  })

  onClean(() => {
    enableScroll()
    if (cleanClickOusideListener) cleanClickOusideListener()
    document.removeEventListener('keydown', onNavigationKeyDown)
  })

  function setItems() {
    if (dropdownRef) {
      items = dropdownRef.querySelectorAll('.ace-dropdown__item')

      setTimeout(() => {
        items?.[0]?.focus()
      })
    }
  }

  const toggle = () => {
    setIsVisible(v => !v)
    componentProps.aimElement.setAttribute('aria-expanded', String(isVisible()))
  }

  componentProps.aimElement.addEventListener('click', toggle)

  const positionDropdown = createPositionPopover({
    position,
    isDropdown: true,
    popoverElement: () => dropdownRef,
    aimElement: componentProps.aimElement,
  })

  const mergedClass = createMemo(() => mergeStrings(
    'ace-dropdown',
    'position-' + position(),
    componentProps.refProps().$div?.class
  ))

  return <>
    <div
      id={componentProps.id}
      role="tooltip"
      ref={dropdownRef}
      aria-hidden={!isVisible()}
      classList={{ visible: isVisible() }}
      {...componentProps.refProps().$div}
      class={mergedClass()}
    >
      <div class="ace-dropdown__content">{componentProps.refProps().content({ isVisible, aimElement: componentProps.aimElement, setIsVisible })}</div>
    </div>
  </>
}



function disableScroll() {
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth

  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = `${scrollBarWidth}px`
}



function enableScroll() {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}



export type RefDropdownProps = Parameters<typeof refDropdown>[0]


export type DropdownContent = ReturnType<RefDropdownProps>['content']
