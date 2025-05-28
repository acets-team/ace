/**
 * 🧚‍♀️ How to access:
 *     - import '@ace/slideshow.styles.css'
 *     - import { Slideshow } from '@ace/slideshow'
 *     - import type { SlideshowProps } from '@ace/slideshow'
 */


import { createSignal, createEffect, onCleanup, createMemo, Show, Index, type JSX } from 'solid-js'


export function Slideshow({ items, dots = true, autoPlay = true, showPlayControl = true, interval = 6000, ...sectionProps }: SlideshowProps) {
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
    <section class="ace-slideshow" aria-roledescription="carousel" aria-label="Slideshow" {...sectionProps}>
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


export type SlideshowProps = JSX.HTMLAttributes<HTMLElement> & {
  /** Anonymous function returning an array of JSX elements */
  items: () => JSX.Element[]
  /** Show or hide navigation dots; default = true */
  dots?: boolean
  /** Autoplay on load; default = true */
  autoPlay?: boolean
  /** Show or hide play/pause control; default = true */
  showPlayControl?: boolean
  /** Slide interval in milliseconds; default = 6000 */
  interval?: number
}
