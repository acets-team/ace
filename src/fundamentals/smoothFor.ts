/**
 * 🧚‍♀️ How to access:
 *     - Plugin: solid
 *     - import { SmoothFor, defaultSmoothForAnimateOptions, defaultSmoothForAnimateKeyframesFeed, defaultSmoothForAnimateKeyframesChat } from '@ace/smoothFor'
 *     - import type { ScrollDirection } from '@ace/smoothFor'
 */


export class SmoothFor {
  #parent: null | Element = null
  firstLocations = new Map<Element, DOMRect>()
  querySelectorAll: {
    parent: string,
    children: string,
  }


  /**
   * - Smooth list (`<For />`) animations
   * @example
    ```tsx
    const {sync, store} = useStore()

    const smoothFor = new SmoothFor({ parent: '#smooth-fortunes', children: '.fortune' })

    const onClick = createOnSubmit(() => {
      apiGetItems({
        onSuccess (d) {
          smoothFor.preSync()
          sync('items', [d, ...store.items])
          smoothFor.postSync()
        }
      })
    })

    <For each={store.items}>{
      (item) => <div class="items" ref={smoothFor.ref()}>{item.text}</div>
    }</For>
    ```
   * @param props.parent - Wrapper DOM element, value is passed to `document.querySelector()`
   * @param props.children - DOM elements that we want to move smoothly, value is passed to `document.querySelector()`
   */
  constructor(props: {
    /** Wrapper DOM element, value is passed to `document.querySelector()` */
    parent: string,
    /** DOM elements that we want to move smoothly, value is passed to `document.querySelector()` */
    children: string
  }) {
    this.querySelectorAll = {
      parent: props.parent,
      children: props.children,
    }
  }


  get nodes() {
    return document.querySelectorAll(this.querySelectorAll.children)
  }


  /** Scrolls the parent element the requested direction */
  scrollParent(direction: ScrollDirection) {
    if (!this.#parent) this.#parent = document.querySelector(this.querySelectorAll.parent) // get on need & cache
    if (!this.#parent) throw new Error('Please provide a valid parent prop to new SmoothFor() that will work w/ document.querySelector()')

    this.#parent.scrollTop = direction === 'top'
      ? 0
      : this.#parent.scrollHeight
  }


  /** saves the starting positions of all existing child elements before the DOM is changed aka before sync() is called */
  preSync () {
    const _nodes = this.nodes
    if (_nodes.length === 0) return

    this.firstLocations.clear()

    for (const node of _nodes) {
      this.firstLocations.set(node, node.getBoundingClientRect())
    }
  }


  /**
   * - Crucial for making new elements enter smoothly
   * - Default is `defaultSmoothForAnimateKeyframesFeed` or item fades in from above
   * - Another prebuilt option is `defaultSmoothForAnimateKeyframesChat` or item fades in from below
   * @example
    ```ts
    import { SmoothFor, defaultSmoothForAnimateKeyframesChat } from '@ace/smoothFor'

    // feed (enter from above) (default)
    <For each={store.fortunes}>{
      (item) => <div class="fortune" ref={smoothFor.ref()}>{item.text}</div>
    }</For>

    // chat (enter from below)
    <For each={store.chatMessages}>{
      (m) => <div ref={ smoothFor.ref({animateKeyframes: defaultSmoothForAnimateKeyframesChat}) }>{m.message}</div>
    }</For>
    ```
   * @param props.animateKeyframes - Define the start and end animation css for how items enter into the DOM
   * @param props.animateOptions - Like `duration` or `easing`
   * @returns Ref function ready to be placed on items
   */
  ref(props?: { animateKeyframes?: Keyframe[], animateOptions?: KeyframeAnimationOptions }) {
    return (el: HTMLElement | null) => { // how to update dom element when it is added to the DOM (onMount won't work if waiting for API)
      if (!el) return

      requestAnimationFrame(() => { // ensures the element is fully mounted and has its correct dimensions and final position calculated by the browser preventing a flash or jump upon entrance
        if (!el) return

        const options = props?.animateOptions ?? defaultSmoothForAnimateOptions

        const keyframes = props?.animateKeyframes ?? defaultSmoothForAnimateKeyframesFeed

        el.animate(keyframes, options) // this only animates on load and the new items but not the existing items that move for layout shift
      })
    }
  }


  /**
   * - `preSync()` records the starting position of all child elements
   * - `sync()` is called but then immediately after `postSync()` is called w/ a `requestAnimationFrame()`
   * - `postSync()` calculates the `Last` position and uses `node.animate()` to instantaneously move the element back to its `First` position
   * - Crucially, this `Invert` step and the subsequent `Play` step are both inside a single `requestAnimationFrame()` block which ensures the browser never paints the intermediate, jumped position
   * @param props.scrollParent - Helpful when you'd like the parent to scroll to the `top` or `bottom` after the addition is made to see recent additions immediately
   * @param props.animateOptions - Like `duration` or `easing`
   */
  postSync(props?: { scrollParent?: ScrollDirection, animateOptions?: KeyframeAnimationOptions }) {
    requestAnimationFrame(() => {
      const _nodes = this.nodes // no child nodes in DOM to animate
      if (_nodes.length === 0) return

      for (const node of _nodes) {
        const ogDomRect = this.firstLocations.get(node)
        if (!ogDomRect) continue // the current item in the DOM that we are reviewing was not there before (so we don't need to animate it b/c the ref() takes care of animating new dom insertions)

        const aimDomRect = node.getBoundingClientRect() // where we want to move this node too is where it is now
        const invertY = ogDomRect.top - aimDomRect.top // how much we need to move to get to the aim dom rect

        if (invertY !== 0) { // if movement is required => move
          const options = props?.animateOptions ?? defaultSmoothForAnimateOptions

          node.animate([
            { transform: `translateY(${invertY}px)` },
            { transform: 'translateY(0)' }
          ], options)
        }
      }
    })

    if (props?.scrollParent) this.scrollParent(props.scrollParent)
  }
}


export const defaultSmoothForAnimateOptions: KeyframeAnimationOptions = {
  duration: 300,
  easing: 'ease-out',
  fill: 'forwards'
}


/**
 * - Animation for how items come into existance
 * - This animation resembles a feed where new items come in from the top
 */
export const defaultSmoothForAnimateKeyframesFeed: Keyframe[] = [
  { opacity: 0, transform: 'translateY(-18px)' }, // start css
  { opacity: 1, transform: 'translateY(0)' } // end css
]


/**
 * - Animation for how items come into existance
 * - This animation resembles a feed where new items come in from the top
 * - Works well w/ `smoothFor.postSync({ scrollParentToBottom: true })` or `smoothFor.scrollParentToBottom()`
 */
export const defaultSmoothForAnimateKeyframesChat: Keyframe[] = [
  { opacity: 0, transform: 'translateY(18px)' }, // start css
  { opacity: 1, transform: 'translateY(0)' } // end css
]


export type ScrollDirection = 'top' | 'bottom'
