/**
 * 🧚‍♀️ How to use:
 *   Plugin: chartjs
 *   import { ChartJS } from '@ace/chartjs'
 *   import type { CharJsProps } from '@ace/chartjs'
 */


import { feComponent } from './feComponent'
import type { Chart, ChartConfiguration } from 'chart.js'
import { createEffect, onCleanup, type JSX, type Accessor } from 'solid-js'


export const ChartJS = feComponent((props: { config: Accessor<ChartConfiguration>, globalFontSize?: number, $canvas?: JSX.HTMLAttributes<HTMLCanvasElement> }) => {
  let chart: undefined | Chart
  let canvas: undefined | HTMLCanvasElement

  createEffect(() => {
    if (!canvas) throw new Error('!canvas')
    if (!window.Chart) throw new Error('!window.Chart — Chart.js not provided via CDN')

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('!ctx')

    const _config = props.config()

    window.Chart.defaults.font.size = props?.globalFontSize ?? 18

    if (!chart) chart = new window.Chart(ctx, _config)
    else {
      chart.data = _config.data
      chart.options = _config.options || {}
      chart.update()
    }
  })

  onCleanup(() => chart?.destroy())

  return (
    <canvas ref={canvas} {...props.$canvas}></canvas>
  )
})


declare global {
  interface Window {
    Chart?: typeof Chart
  }
}


export type CharJSProps = Parameters<typeof ChartJS>[0]
