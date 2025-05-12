/**
 * 🧚‍♀️ How to access:
 *     - import '@ace/carousel.styles'
 *     - import { Carousel } from '@ace/carousel'
 */



import type { JSX } from 'solid-js'


/**
 * - Create a carousel that pauses on hover and is swipable on moble w/ super simple code
 * - 1st prop is `items` which is the `For` component
 * - 2nd optional prop is `duplicateCount` which defaults to 2, we duplicate the list atleast twice so that when we get to the end there are items shown, if you want more duplicates use this prop, if `duplicateCount` is falsy of less then 2, we set it to 2
 * - B/c of how solid jsx works, this component will not work correclty if `items` or its child items are the same and just referenced, the items must be different, which is typical from a db, but not in testing, so for testing use an array where each item is unique and not just a reference to the same item and all will work gr8, as seen in the example below 🙌
 * 
 * ---
 * 
 * @example
 * ```css
 * .carousel { width: 150px; }
 * .carousel .loops { animation-duration: 15s !important; }
 * .carousel .loops .goal { width: 90px; margin-right: 18px; }
 * ```
 * 
 * ---
 * 
 * @example
 * ```tsx
 * const goals = [{title: 'relax 🏖️'}, {title: 'bliss 🌤️'}, {title: 'peace 🧘‍♀️'}]
 * 
 * return <> 
 *   <Carousel items={
 *     <For each={goals}>{
 *       (o) => <>
 *         <div class="goal">{o.title}</div>
 *       </>
 *     }</For>
 *   </Carousel>
 * </>
 * ```
 */
export function Carousel({ items, duplicateCount = 2 }: { items: JSX.Element, duplicateCount?: number }) {
  if (!duplicateCount || typeof duplicateCount !== 'number' || duplicateCount < 2) duplicateCount = 2

  return <>
    <div class="carousel">
      <div class="loops">
        {
          // To create a real seamless loop, we must physically duplicate the items, not just by reference
          // Each .map() call creates a new set of DOM nodes
          // The looped items aren’t just referenced, they’re actually rebuilt in memory & inserted `duplicateCount` times
          [...Array(duplicateCount)].map(() => <div class="loop">{items}</div>)
        }
      </div>
    </div>
  </>
}
