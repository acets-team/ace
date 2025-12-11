/**
 * 🧚‍♀️ How to access:
 *     - import '@ace/slideshow.styles.css'
 *     - import { Slideshow } from '@ace/slideshow'
 *     - import type { SlideshowProps } from '@ace/slideshow'
 */


import { mergeStrings } from './merge'
import { createSignal, createEffect, onCleanup, createMemo, Show, Index, type JSX } from 'solid-js'


/**
 * ### Display lovely slideshow
 * - Slides are tsx, so they can be images and / or html :)
 * - Add to `app.tsx` => `import '@ace/slideshow.styles.css'` & then:
 * @example
  ```tsx
  import './Home.css'
  import slide1 from './slide1.webp'
  import slide2 from './slide2.webp'
  import slide3 from './slide3.webp'
  import slide4 from './slide4.webp'
  import slide5 from './slide5.webp'
  import { Route } from '@ace/route'
  import { Slideshow } from '@ace/slideshow'


  export default new Route('/')
    .component(() => {
      const slides = [
        <img src={slide1} />,
        <img src={slide2} />,
        <img src={slide3} />,
        <img src={slide4} />,
        <img src={slide5} />,
      ]

      return <>
        <main class="home">
          <Slideshow items={() => slides} />
        </main>
      </>
    })
  ```
 * @param props.items - Anonymous function returning an array of JSX elements
 * @param props.dots - Optional, show or hide navigation dots; `default = true`
 * @param props.autoPlay - Optional, autoplay on load;` default = true`
 * @param props.showPlayControl - Optional, show or hide play/pause control; `default = true`
 * @param props.interval - Optional, slide interval in milliseconds; `default = 6000`
 * @param props.$section - Optional, any additional props that you'd love to add to the `<section class="ace-slideshow">` 
 */
export function Slideshow({ items, dots = true, autoPlay = true, showPlayControl = true, interval = 6000, $section }: SlideshowProps) {
  const [current, setCurrent] = createSignal(0)
  const [paused, setPaused] = createSignal(false)
  const itemsMemo = createMemo(() => items() || []) // derived, read-only & cached reactive computation
  const next = () => setCurrent(i => (i + 1) % itemsMemo().length) // advance current slide by one & loop back to 0 when we reach the end

  createEffect(() => {
    if (!autoPlay || paused()) return // if autoPlay config is off OR paused checkbox is active => no autoPlay
    const timer = setInterval(next, interval) // autoPlay
    onCleanup(() => clearInterval(timer))
  })

  return <>
    <section aria-roledescription="carousel" aria-label="Slideshow" {...$section} class={mergeStrings('ace-slideshow', $section?.class)}>
      <div class="track">
        <Index each={itemsMemo()} fallback={null}>{
          (item, i) => <>
            <div classList={{ slide: true, active: current() === i }} role="group" aria-roledescription="slide" aria-label={`Slide ${i + 1} of ${itemsMemo().length}`}>
              {item()}
            </div>
          </>
        }</Index>
      </div>

      <Show when={dots || showPlayControl}>
        <div class="controls">
          <Show when={dots}>
            <div class="dots" role="tablist" aria-label="Slide selection">
              <Index each={itemsMemo()} fallback={null}>{
                (_, i) => <>
                  <button type="button" onClick={() => { setCurrent(i); setPaused(true); }} classList={{ dot: true, active: current() === i }} role="tab" aria-label={`Go to slide ${i + 1}`} aria-selected={current() === i} />
                </>
              }</Index>
            </div>
          </Show>

          <Show when={showPlayControl}>
            <label class="play">
              <input type="checkbox" checked={!paused()} onChange={e => setPaused(!e.currentTarget.checked)} />
              <span>Play</span>
            </label>
          </Show>
        </div>
      </Show>
    </section>
  </>
}


export type SlideshowProps = {
  /** Anonymous function returning an array of JSX elements */
  items: () => JSX.Element[]
  /** Show or hide navigation dots; default = true */
  dots?: boolean
  /** Autoplay on load; default = true */
  autoPlay?: boolean
  /** Show or hide play/pause control; default = true */
  showPlayControl?: boolean
  /** Slide interval in milliseconds; default = 6000 */
  interval?: number,
  /** Any additional props that you'd love to add to the `<section class="ace-slideshow">`  */
  $section?: JSX.HTMLAttributes<HTMLElement>,
}
