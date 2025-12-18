/**
 * 🧚‍♀️ How to use:
 *   Plugin: chartjs
 *   import { ChartJs } from '@ace/chartjs'
 *   import type { CharJsProps } from '@ace/chartjs'
 */


import { onClean } from './onClean'
import { mergeStrings } from './merge'
import { useChartJs } from './useChartJs'
import { feComponent } from './feComponent'
import type { JSX, Setter } from 'solid-js'
import type { Chart, ChartTypeRegistry } from 'chart.js'


/**
 * - Create a Chart.js
 * 
 * - Requires the following npm dev imports:
 *     - `chart.js`
 * - Provides 2 elements:
 *     1. A full-stack `div` that accepts props via `$div` & has a defualt class of `ace-chart-js-wrapper`. Full stack let's us set styling & avoid jitter when we have `FE` components and can only style the `FE` elements
 *     1. A `FE` component that is just a canvas that has a default class of `ace-chart-js`. Defining as a `FE` component ensures `chart.js` does not enter your `BE` build
 * @link https://www.chartjs.org/
 * @param props.map Standard way to pass data to ag grid as `{ id: string; amount: number; }`, an accessor so when the data changes the chart is rewritten
 * @param props.config Chartjs configuration: type `ChartConfiguration`
 * @param props.register Optional, py passing the register function to the component we can ensure chartjs is registered w/ your desired configurations before being created
 * @param props.setChart Optional, setter, helpful when you'd love the chart instance w/in the parent component
 * @param props.$div Optional, dom props to place onto wrapper `<div>`, class of 'ace-chart-js-wrapper' is added automatically
 * @param props.$canvas Optional, dom props to place onto wrapper `<canvas>`, class of 'ace-chart-js' is added automatically
 */
export function ChartJs<T extends keyof ChartTypeRegistry>(props: {
  /** Standard way to pass data to ag grid as `{ id: string; amount: number; }`, an accessor so when the data changes the chart is rewritten */
  map: Parameters<typeof useChartJs>[0]['map'],
  /** Chartjs configuration: type `ChartConfiguration` */
  config: Parameters<typeof useChartJs>[0]['config'],
  /** Optional, py passing the register function to the component we can ensure chartjs is registered w/ your desired configurations before being created */
  register?: () => void,
  /** Optional, setter, helpful when you'd love the chart instance w/in the parent component */
  setChart?: Setter<Chart<T> | undefined>,
  /** Optional, dom props to place onto wrapper `<div>`, class of 'ace-chart-js-wrapper' is added automatically */
  $div?: JSX.HTMLAttributes<HTMLDivElement>,
  /** Optional, dom props to place onto wrapper `<canvas>`, class of 'ace-chart-js' is added automatically */
  $canvas?: JSX.HTMLAttributes<HTMLCanvasElement>,
}) {
  return <>
    <div {...props.$div} class={mergeStrings('ace-chart-js-wrapper', props.$div?.class)}>
      <ChartJsFE {...props} />
    </div>
  </>
}



export const ChartJsFE = feComponent(function Source<T extends keyof ChartTypeRegistry>(props: Omit<CharJsProps<T>, '$div'>) {
  let canvasRef: HTMLCanvasElement | undefined

  const chart = useChartJs({
    map: props.map,
    ref: () => canvasRef,
    config: props.config,
    register: props.register,
  })

  if (props.setChart) props.setChart(chart() as Chart<T> | undefined)

  onClean(() => {
    const c = chart()
    if (c) c.destroy()
  })

  return <canvas {...props.$canvas} class={mergeStrings('ace-chart-js', props.$canvas?.class)} ref={canvasRef} />
})


export type CharJsProps<T extends keyof ChartTypeRegistry> = Parameters<typeof ChartJs<T>>[0]
