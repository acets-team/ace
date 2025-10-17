import { Chart, ChartConfiguration, ChartTypeRegistry } from "chart.js"
import { Accessor, createEffect, createSignal, untrack } from "solid-js"
import { ChartJsMap } from './types'

export function useChartJs<T extends keyof ChartTypeRegistry>(props: { map: Accessor<ChartJsMap[]>, ref: Accessor<undefined | HTMLCanvasElement>, config: ChartConfiguration<T>, globalFontSize?: number }) {

  const [chart, setChart] = createSignal<undefined | Chart<T>>()

  createEffect(() => {
    if (props.map().length && props.ref()) {
      untrack(() => {
        if (!window.Chart) throw new Error('!window.Chart — Chart.js not provided via CDN')
        window.Chart.defaults.font.size = props?.globalFontSize ?? 18

        const _canvas = props.ref()
        if (!_canvas) throw new Error('!_canvas')

        const ctx = _canvas.getContext('2d')
        if (!ctx) throw new Error('!ctx')

        const _chart = chart()
        const data = []
        const labels = []

        for (const c of props.map()) {
          labels.push(c.id)
          data.push(c.amount)
        }

        if (_chart) {
          const firstDataSet = _chart.data.datasets[0]

          if (firstDataSet) firstDataSet.data = data
          
          _chart.data.labels = labels
          _chart.update()
        } else {
          const firstDataSet = props.config.data.datasets[0]

          if (firstDataSet) firstDataSet.data = data

          props.config.data.labels = labels

          setChart(
            new window.Chart(ctx, props.config) as Chart<T>
          )
        }
      })
    }
  })

  return chart
}
