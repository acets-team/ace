/**
 * 🧚‍♀️ How to access:
 *     - import '@ace/carousel.styles'
 *     - import { Carousel } from '@ace/carousel'
 *     - import type { CarouselProps } from '@ace/carousel'
 */


import { For, onMount, type JSX } from 'solid-js'


/**
 * ### Create a carousel that pauses on hover and is swipable on mobile
 * @param items - `() => JSX.Element` - Anonymous function that returns a `For` component
 * @param duplicateCount - `number` - Default / Minimum = 2 - So there are more items at the end of the carousel
 * @param speed - `number` - Pixels per second - Default is 81
 * @example
  ```tsx
    const goals = [{title: 'relax 🏖️'}, {title: 'bliss 🌤️'}, {title: 'peace 🧘‍♀️'}]

    return <> 
      <Carousel id="carousel" style="width: 21rem" duplicateCount={3} items={() =>
        <For each={goals}>{
          (o) => <>
            <div style="width: 9rem; text-align: center;">{o.title}</div>
          </>
        }</For>
      }/>
    </>
  ```
 */
export function Carousel({ items, duplicateCount = 2, speed = 81, ...props }: CarouselProps) {
  if (duplicateCount < 2) duplicateCount = 2

  let divLoops: undefined | HTMLDivElement

  const loops = Array.from({ length: duplicateCount })

  onMount(async () => {
    if (!divLoops) return

    const imgs = Array.from(divLoops.querySelectorAll('img')) as HTMLImageElement[];

    if (imgs.length) {
      await Promise.all( // allow images to load b4 checking total width
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => { img.onload = img.onerror = () => resolve()}) // IF onload or onerror => resolve
        )
      )
    }

    const firstLoop = divLoops.children[0] as HTMLElement
    const loopWidth = firstLoop.getBoundingClientRect().width

    divLoops.style.setProperty("--loop-width", `${loopWidth}px`)
    divLoops.style.setProperty("--loop-duration", `${loopWidth / speed}s`) // loop width is total pixels to go, speed is pixels per second, so divinding gives us seconds
  })

  return <>
    <section class="ace-carousel" role="region" aria-label="Carousel" aria-roledescription="Carousel" {...props}>
      <div class="loops" ref={divLoops}>
        <For each={loops}>{
          () => <div class="loop">{items()}</div>
        }</For>
      </div>
    </section>
  </>
}


type CarouselProps = JSX.HTMLAttributes<HTMLElement> & {
  /** items to render */
  items: () => JSX.Element
  /** Carousel duplicates items so that at the end of the scroll there are more items to show, minimum / default is 2 */
  duplicateCount?: number
  /** px per second, default is 81 */
  speed?: number
}
