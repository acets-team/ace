/**
 * 🧚‍♀️ How to use:
 *   Plugin: agGrid
 *   import { AgGrid, defaultStyle } from '@ace/agGrid'
 *   import type { AgGridProps } from '@ace/agGrid'
 */


import { mergeStrings } from './merge'
import { feComponent } from './feComponent'
import { createEffect, type JSX, type Setter, type Accessor } from 'solid-js'
import { createGrid, type GridApi, type GridOptions } from 'ag-grid-community'


/**
 * - Create an AgGrid
 * 
 * - Requires the following npm dev imports:
 *     - `ag-grid-community`
 * - Provides 2 elements:
 *     1. A full-stack `div` that accepts props via `$div` & has a defualt class of `ace-ag-grid-wrapper`. Full stack let's us set styling which avoid jitter when we have `FE` components and can only style the `FE` elements
 *     1. A `FE` component that is just a div that has a default class of `ace-ag-grid`. Defining as a `FE` component ensures `ag-grid-community` does not enter your `BE` build
 * @link https://www.ag-grid.com/
 * @example
  ```tsx
  import type { GridApi } from 'ag-grid-community'

  const [usersGridApi, setUsersGridApi] = createSignal<GridApi<any>>()

  <AgGrid 
    setGridApi={setUsersGridApi}
    gridOptions={() => ({
      rowData: users(),
      columnDefs: [
        { field: 'id', filter: 'agNumberColumnFilter' },
        { field: 'name', filter: 'agTextColumnFilter' },
        ...agShowColumn<ApiName2Data<'apiGetUsers'>>(props.source === 'admin', {
          field: 'isNewsletterSubscriber',
          headerName: 'Email Subscriber'
        }),
        {
          field: 'amount',
          cellStyle: { textAlign: 'right' },
          cellRenderer: agGridCellRenderer({ component: TableCellAmount }),
        }
      ],
    })}
  />

  const TableCellAmount = agGridComponent<Transaction>(params => {
    const amount = params.data?.amount ?? 0

    return <>
      <div classList={{ up: amount > 0 }} class="table-amount">
        {formatter.format(Math.abs(amount))}
      </div>
    </>
  })
  ```
 * @example
  ```css
  .ace-ag-grid-wrapper {
    width: 100%;
    height: 45rem;

    .ace-ag-grid {
      height: 100%;
      width: 100%;
    }
  }
  ```
 * @param props.gridOptions - Passed to `agGrid.createGrid(grid, gridOptions)`
 * @param props.$div - Optional, dom props to place onto wrapper `<div>`, class of 'ace-ag-grid-wrapper' is added automatically, to style the div that get agGrid applied to it just do `.ace-ag-grid-wrapper .ace-ag-grid {}`
 * @param props.setGridApi - Provide setter if you'd like to work w/ gridApi
 * @param props.register - By passing the register function to the component we can ensure the grid is registered before being created
 */
export function AgGrid<T_Data>(props: {
  /** Passed to `agGrid.createGrid(grid, gridOptions)` */
  gridOptions: Accessor<GridOptions<T_Data>>
  /** Optional, dom props to place onto wrapper `<div>`, class of 'ace-ag-grid-wrapper' is added automatically, to style the div that get agGrid applied to it just do `.ace-ag-grid-wrapper .ace-ag-grid {}` */
  $div?: JSX.HTMLAttributes<HTMLDivElement>
  /** Provide setter if you'd like to work w/ gridApi */
  setGridApi?: Setter<GridApi<any> | undefined>
  /** By passing the register function to the component we can ensure the grid is registered before being created */
  register?: () => void
}) {
  return <>
    <div {...props.$div} class={mergeStrings('ace-ag-grid-wrapper', props.$div?.class)}>
      <AgGridFE {...props} />
    </div>
  </>
}


const AgGridFE = feComponent(function Source<T_Data>(props: Omit<AgGridProps<T_Data>, '$div'>) {
  if (props.register) props.register()

  let gridDiv: undefined | HTMLDivElement
  let gridApi: GridApi<T_Data> | undefined

  createEffect(() => {
    const opts = props.gridOptions()
    if (!opts || !gridDiv) return

    if (gridApi) gridApi.updateGridOptions(opts) // grid already exists — update it
    else { // frirst time — create the grid
      gridApi = createGrid(gridDiv, opts)
      if (props.setGridApi) props.setGridApi(gridApi)
    }
  })

  return <div class="ace-ag-grid" ref={gridDiv}></div>
})


export type AgGridProps<T_Data extends any> = Parameters<typeof AgGrid<T_Data>>[0]
