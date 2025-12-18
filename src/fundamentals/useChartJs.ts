/**
 * 🧚‍♀️ How to use:
 *   Plugin: chartjs
 *   import { useChartJs } from '@ace/useChartJs'
 *   import type { UseChartJsProps, ChartJsMap } from '@ace/useChartJs'
 */


import { createEffect, createSignal, untrack, type Accessor } from 'solid-js'
import { Chart, type ChartConfiguration, type ChartTypeRegistry } from 'chart.js'


/**
 * - Create a Chart.js
 * 
 * - Requires the following npm dev imports:
 *     - `chart.js`
 * @param props.map Standard way to pass data to ag grid as `{ id: string; amount: number; }`, an accessor so when the data changes the chart is rewritten
 * @param props.ref HTML DOM Canvas ref variable
 * @param props.config Chartjs configuration: type `ChartConfiguration`
 * @param props.register Optional, py passing the register function to the component we can ensure chartjs is registered w/ your desired configurations before being created
 * @returns Chartjs chart instance
 */
export function useChartJs<T extends keyof ChartTypeRegistry>(props: {
  map: Accessor<undefined | ChartJsMap[]>,
  ref: Accessor<undefined | HTMLCanvasElement>,
  config: ChartConfiguration<T>,
  register?: () => void
}) {
  const [chart, setChart] = createSignal<undefined | Chart<T>>()

  createEffect(() => {
    if (props.map()?.length && props.ref()) {
      untrack(() => {
        if (props.register) props.register()

        const _canvas = props.ref()
        if (!_canvas) throw new Error('!_canvas')

        const ctx = _canvas.getContext('2d')
        if (!ctx) throw new Error('!ctx')

        const data = []
        const labels = []
        const _chart = chart()

        for (const c of props.map() ?? []) {
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
            new Chart(ctx, props.config) as Chart<T>
          )
        }
      })
    }
  })

  return chart
}


export type UseChartJsProps = Parameters<typeof useChartJs>[0]


export type ChartJsMap = {
  /** Aligned w/ label[], Good for sync() */
  id: string
  /** Aligned w/ data[] */
  amount: number
}
