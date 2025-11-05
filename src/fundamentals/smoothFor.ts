export class SmoothFor {
  #parent: null | Element = null
  node2DomRect = new Map<Element, DOMRect>()
  querySelectorAll: {
    parent: string,
    children: string,
  }


  /**
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


  scrollParentToBottom() {
    if (!this.#parent) this.#parent = document.querySelector(this.querySelectorAll.parent) // get on need & cache
    if (!this.#parent) throw new Error('Please provide a valid parent prop to new SmoothFor() that will work w/ document.querySelector()')

    this.#parent.scrollTop = this.#parent.scrollHeight
  }


  preSync () { // add dom locations pre addition to map
    const _nodes = this.nodes
    if (_nodes.length === 0) return

    this.node2DomRect.clear()

    for (const node of _nodes) {
      this.node2DomRect.set(node, node.getBoundingClientRect())
    }
  }


  ref(refProps?: { animateKeyframes?: Parameters<Animatable['animate']>[0], animateOptions?: Parameters<Animatable['animate']>[1]}) {
    return (el: HTMLElement) => { // how to update dom element when it is added to the DOM (onMount won't work if waiting for API)
      requestAnimationFrame(() => {
        const options = refProps?.animateOptions ?? defaultSmoothForAnimateOptions

        const keyframes = refProps?.animateKeyframes ?? defaultSmoothForAnimateKeyframesFeed

        el.animate(keyframes, options) // this only animates on load and the new items but not the existing items that move for layout shift
      })
    }
  }


  postSync(postSyncProps?: { scrollParentToBottom?: boolean, animateOptions?: Parameters<Animatable['animate']>[1] }) {
    requestAnimationFrame(() => {
      const _nodes = this.nodes // no child nodes in DOM to animate
      if (_nodes.length === 0) return

      for (const node of _nodes) {
        const ogDomRect = this.node2DomRect.get(node)
        if (!ogDomRect) continue // the current item in the DOM that we are reviewing was not there before (so we don't need to animate it b/c the ref() takes care of animating new dom insertions)

        const aimDomRect = node.getBoundingClientRect() // where we want to move this node too is where it is now
        const invertY = ogDomRect.top - aimDomRect.top // how much we need to move to get to the aim dom rect

        if (invertY !== 0) { // if movement is required => move
          const options = postSyncProps?.animateOptions ?? defaultSmoothForAnimateOptions

          node.animate([
            { transform: `translateY(${invertY}px)` },
            { transform: 'translateY(0)' }
          ], options)
        }
      }
    })

    if (postSyncProps?.scrollParentToBottom) this.scrollParentToBottom()
  }
}


export const defaultSmoothForAnimateOptions = { duration: 300, easing: 'ease-out', fill: 'forwards' } as const


/**
 * - Top: Helpful when you'd love new items on **top**
 */
export const defaultSmoothForAnimateKeyframesFeed: Parameters<Animatable['animate']>[0] = [
  { opacity: 0, transform: 'translateY(-18px)' }, // start css
  { opacity: 1, transform: 'translateY(0)' } // end css
]


/**
 * - Bottom: Helpful when you'd love new items on **bottom**
 * - Works well w/ `smoothFor.postSync({ scrollParentToBottom: true })` or `smoothFor.scrollParentToBottom()`
 */
export const defaultSmoothForAnimateKeyframesChat: Parameters<Animatable['animate']>[0] = [
  { opacity: 0, transform: 'translateY(18px)' }, // start css
  { opacity: 1, transform: 'translateY(0)' } // end css
]
