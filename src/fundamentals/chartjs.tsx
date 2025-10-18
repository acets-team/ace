/**
 * 🧚‍♀️ How to use:
 *   Plugin: chartjs
 *   import { ChartJs } from '@ace/chartjs'
 *   import type { CharJsProps } from '@ace/chartjs'
 */


import { useChartJs } from './useChartJs'
import { feComponent } from './feComponent'
import type { ChartJsRegisterFn } from './types'
import { onCleanup, type JSX, Setter } from 'solid-js'
import type { Chart, ChartTypeRegistry } from 'chart.js'



function Source<T extends keyof ChartTypeRegistry>(props: {
  setChart?: Setter<Chart<T> | undefined>,
  $canvas?: JSX.HTMLAttributes<HTMLCanvasElement>,
  map: Parameters<typeof useChartJs>[0]['map'],
  config: Parameters<typeof useChartJs>[0]['config'],
  register?: ChartJsRegisterFn,
}) {

  let canvasRef: HTMLCanvasElement | undefined

  const chart = useChartJs({
    map: props.map,
    ref: () => canvasRef,
    config: props.config,
    register: props.register,
  })

  if (props.setChart) props.setChart(chart() as Chart<T> | undefined)

  onCleanup(() => {
    const c = chart()
    if (c) c.destroy()
  })

  return <canvas {...props.$canvas} ref={canvasRef} />
}


export const ChartJs = feComponent(Source)


export type CharJsProps = Parameters<typeof ChartJs>[0]
