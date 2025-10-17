/**
 * 🧚‍♀️ How to use:
 *   Plugin: chartjs
 *   import { ChartJs } from '@ace/chartjs'
 *   import type { CharJsProps } from '@ace/chartjs'
 */


import { useChartJs } from './useChartJs'
import { feComponent } from './feComponent'
import { onCleanup, type JSX, Setter } from 'solid-js'
import type { Chart, ChartTypeRegistry } from 'chart.js'




function Source<T extends keyof ChartTypeRegistry>(props: {
  setChart?: Setter<Chart<T> | undefined>,
  $canvas?: JSX.HTMLAttributes<HTMLCanvasElement>,
  map: Parameters<typeof useChartJs>[0]['map'],
  config: Parameters<typeof useChartJs>[0]['config'],
  globalFontSize?: Parameters<typeof useChartJs>[0]['globalFontSize'],
}) {
  let canvasRef: HTMLCanvasElement | undefined

  const chart = useChartJs({
    map: props.map,
    ref: () => canvasRef,
    config: props.config,
    globalFontSize: props.globalFontSize
  })

  // ✅ Call the accessor to pass the value, not the function
  if (props.setChart) props.setChart(chart() as Chart<T> | undefined)

  // 🔹 Cleanup on unmount
  onCleanup(() => {
    const c = chart()
    if (c) c.destroy()
  })

  return <canvas {...props.$canvas} ref={canvasRef} />
}


export const ChartJs = feComponent(Source)



declare global {
  interface Window {
    Chart?: typeof Chart
  }
}


export type CharJsProps = Parameters<typeof ChartJs>[0]
