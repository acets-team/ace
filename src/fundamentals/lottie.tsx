/**
 * 🧚‍♀️ How to use:
 *   Plugin: lottie
 *   import { Lottie, refLottie, defaultLottieConfig } from '@ace/lottie'
 *   import type { LottieProps, LottieConfig } from '@ace/lottie'
 */


import { onClean } from './onClean'
import { buildOrigin } from './env'
import type { JSX } from 'solid-js'
import { feComponent } from './feComponent'
import { mergeObjects, mergeStrings } from './merge'
import { DotLottie, type Config } from '@lottiefiles/dotlottie-web'


/**
 * ### Add `lottie` doodles to your site/app!
 * - Ensures `lottie` is destroyed on page refresh, page navigation & component cleanup
 * - Requires the following npm dev imports:
 *     - `@lottiefiles/dotlottie-web`
 * - Provides 2 elements:
 *     1. A full-stack `div` that accepts props via `$div` & has a defualt class of `ace-lottie-wrapper`. Full stack let's us set styling which avoid jitter when we have `FE` components and can only style the `FE` elements
 *     1. A `FE` component that is just a canvas that has a default class of `ace-lottie` and accepts props via `$canvas`. Defining as a `FE` component ensures `@lottiefiles/dotlottie-web` does not enter your `BE` build
 * - 🚨 Styling tip: Go to the lottie editor, get the canvas dimensions and then add this css:
    ```css
    .ace-lottie-wrapper {
      width: 100%; // editable based on how wide you want

      // keeps proportions correct
      aspect-ratio: [place number width here] / [place number height here];

      .ace-lottie {
        width: 100%;
      }
    }
    ```
 * @param props.src - Get's merged w/ your `buildOrigin` automatically, so place the lottie in your `public` folder and then set this src to ex: `/lottie/lovely.lottie`
 * @param props.config - Optional lottie config, defaults to `defaultLottieConfig`, IF defined THEN props.config get's merged w/ `defaultLottieConfig`
 * @param props.$div Optional, dom props to place onto wrapper `<div>`, class of 'ace-lottie-wrapper' is added automatically
 * @param props.$canvas Optional, dom props to place onto wrapper `<canvas>`, class of 'ace-lottie' is added automatically
 */
export const Lottie = function (props: {
  src: string,
  config?: LottieConfig,
  $div?: JSX.HTMLAttributes<HTMLDivElement>,
  $canvas?: JSX.HTMLAttributes<HTMLCanvasElement>,
}) {
  return <>
    <div {...props.$div} class={mergeStrings('ace-lottie-wrapper', props.$div?.class)}>
      <LottieFE {...props} />
    </div>
  </>
}


const LottieFE = feComponent((props: Omit<LottieProps, '$div'>) => {
  return <>
    <canvas ref={refLottie(props.src, props.config)} {...props.$canvas} class={mergeStrings('ace-lottie', props.$canvas?.class)} />
  </>
})


/**
 * - Place onto a `canvas` to add Lottie functionality to the `canvas`. Used by the `Lottie` component
 * @param src - Get's merged w/ your `buildOrigin` automatically, so place the lottie in your `public` folder and then set this src to ex: `/lottie/lovely.lottie`
 * @param config - Optional lottie config, defaults to `defaultLottieConfig`, IF defined THEN props.config get's merged w/ `defaultLottieConfig`
 * @returns - Ref function to place onto any `<canvas />
 */
export function refLottie(src: string, config?: LottieConfig) {
  let lottieInstance: undefined | DotLottie

  const clear = () => {
    if (lottieInstance) {
      lottieInstance.destroy()
      lottieInstance = undefined
    }
  }

  onClean(clear)

  return (canvas: HTMLCanvasElement | null) => {
    if (canvas instanceof HTMLCanvasElement) {
      if (lottieInstance) clear()

      lottieInstance = new DotLottie(mergeObjects({
        base: defaultLottieConfig,
        request: config,
        required: { canvas, src: buildOrigin + src }
      }))
    }
  }
}



export const defaultLottieConfig: Partial<Config> = {
  loop: true,
  autoplay: true,
}


export type LottieConfig = Omit<Config, 'canvas' | 'src'>


export type LottieProps = Parameters<typeof Lottie>[0]
