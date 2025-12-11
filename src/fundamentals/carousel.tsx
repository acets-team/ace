/**
 * 🧚‍♀️ How to access:
 *     - import '@ace/carousel.styles.css'
 *     - import { Carousel } from '@ace/carousel'
 *     - import type { CarouselProps } from '@ace/carousel'
 */


import { mergeStrings } from './merge'
import { onMount, createEffect, For, type JSX } from 'solid-js'


/**
 * ### Aria compliant carousel
 * - Autoscroll
 * - Touch swipe `(touchscreen)`
 * - Scrollable `(not touchscreen)`
 * - Hover to pause `(not touchscreen)`
 * @example
    ```tsx
    <Carousel
      duration={3}
      $section={{ style: {width: '21rem'} }}
      items={() => [{title: 'relax 🏖️'}, {title: 'bliss 🌤️'}, {title: 'peace 🧘‍♀️'}]}
      render={(goal) => <div style="width: 9rem; text-align: center;">{goal.title}</div>} />
    ```
 * @example
    ```tsx
    <Carousel items={offerings} duration={18} render={(o) => <>
      <div class="offering">
        <img src={o.src} alt={o.title} />
        <div class="title">{o.title}</div>
      </div>
    </>} />
    ```
 * @param props.items Accessor (anonymous function) that returns an array of items to render
 * @param props.render Function that gets the `item` and returns the JSX to render for each item
 * @param props.duplicateCount Optional, default is `2`, minimum is `2`, We duplicate items to ensure that when we get to the end of the carousel there are still items to show
 * @param props.duration Optional, default is `9`, how many seconds it will take to get to the end of the carousel
 * @param props.$section Optional, dom props to place onto wrapper `<section>`
 */
export function Carousel<T_Item>(props: {
  /** Accessor (anonymous function) that returns an array of items to render */
  items: () => T_Item[]
  /** Function that gets the `item` and returns the JSX to render for each item */
  render: (item: T_Item) => JSX.Element
  /** Optional, default is `2`, minimum is `2`, We duplicate items to ensure that when we get to the end of the carousel there are still items to show */
  duplicateCount?: number
  /** Optional, default is `10`, how many seconds it will take to get to the end of the carousel */
  duration?: number
  /** Optional, dom props to place onto wrapper `<section>` */
  $section?: JSX.HTMLAttributes<HTMLElement>
}) {
  const _duration = props.duration ? props.duration : 9
  const _dupicateCount = (typeof props.duplicateCount !== 'number' || props.duplicateCount < 2) ? 2 : props.duplicateCount

  let rafId = 0
  let loopWidth = 0
  let paused = false
  let startX = 0, scrollX = 0
  let loopsEl: undefined | HTMLDivElement

  function measure() {
    if (!loopsEl) return

    const firstLoop = loopsEl.querySelector('.loop') as HTMLElement
    if (!firstLoop) return

    loopWidth = firstLoop.offsetWidth
    loopsEl.style.setProperty('--loop-width', `${loopWidth}px`)
    loopsEl.style.setProperty('--loop-duration', `${_duration}s`)
  }

  function startAutoScroll() {
    cancelAnimationFrame(rafId)
    const pxPerFrame = loopWidth / (_duration * 60)

    function step() {
      if (!loopsEl || paused) return

      loopsEl.scrollLeft += pxPerFrame

      if (loopsEl.scrollLeft >= loopWidth * (_dupicateCount - 1)) {
        loopsEl.scrollLeft -= loopWidth
      }

      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
  }

  function stopAutoScroll() {
    cancelAnimationFrame(rafId)
  }

  onMount(async () => {
    if (!loopsEl) return

    measure()

    const imgs = Array.from(loopsEl.querySelectorAll('img'))

    await Promise.all(
      imgs.map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>(res => { img.onload = img.onerror = () => res() })
      )
    )

    measure()
    startAutoScroll()
  })

  createEffect(() => {
    props.items()
    queueMicrotask(measure)
  })

  function onTouchStart(e: TouchEvent) {
    if (!loopsEl) return
    stopAutoScroll()
    startX = e.touches[0]?.clientX ?? 0
    scrollX = loopsEl.scrollLeft
  }

  function onTouchMove(e: TouchEvent) {
    if (!loopsEl) return
    const dx = startX - (e.touches[0]?.clientX ?? 0)
    loopsEl.scrollLeft = scrollX + dx
  }

  function onTouchEnd() {
    startAutoScroll()
  }

  function onMouseEnter() {
    if (window.matchMedia('(hover: hover)').matches) {
      paused = true
    }
  }

  function onMouseLeave() {
    if (window.matchMedia('(hover: hover)').matches) {
      paused = false
      startAutoScroll()
    }
  }

  return <>
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Image carousel"
      {...props.$section}
      class={mergeStrings('ace-carousel', props.$section?.class)}
    >
      <div
        class="loops"
        ref={el => (loopsEl = el!)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-live="off"
      >
        <For each={Array.from({ length: _dupicateCount })}>{
          () => <>
            <div class="loop">
              <For each={props.items()}>{
                (item, i) => <div role="group" aria-roledescription="slide" aria-label={`Slide ${i() + 1}`} > {props.render(item)} </div>
              }</For>
            </div>
          </>
        }</For>
      </div>
    </section>
  </>
}


export type CarouselProps<T_Item> = Parameters<typeof Carousel<T_Item>>[0]
