/**
 * 🧚‍♀️ How to use:
 *   import { AgGrid, defaultStyle } from '@ace/agGrid'
 *   import type { AgGridProps } from '@ace/agGrid'
 */


import { feComponent } from './feComponent'
import { Accessor, createEffect, onMount, type JSX, type Setter } from 'solid-js'
import type { GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community'


/**
 * - Create an AgGrid
 * 
 * - Requires the following npm dev imports:
 *     - `ag-grid-community` (🚨 Only used for types)
 * - Requires the following cdn script:
 *     - @ entry-server.tsx > below `{scripts}` > `<script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js"></script>`
 *     - Users download it once and then it's cdn from their
 *     - Avoids big script in fe or be build
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
        { field: 'id', filter: 'agNumberColumnFilter', width: 72 },
        { field: 'name', filter: 'agTextColumnFilter', width: 210 },
        ...agShowColumn<ApiName2Data<'apiGetUsers'>>(props.source === 'admin', { field: 'isNewsletterSubscriber', headerName: 'Email Subscriber', width: 170 }),
      ],
    })}
  />
  ```
 * @param props.gridOptions - Passed to `window.agGrid.createGrid(grid, gridOptions)`
 * @param props.$div - Optional, default is `{style: defaultStyle}`, Props to set onto wrapper div
 */
export const AgGrid = feComponent(Component)


function Component<T_Data>({ setGridApi, gridOptions, $div = {style: defaultStyle} }: AgGridProps<T_Data>) {
  let gridDiv: undefined | HTMLDivElement
  let gridApi: GridApi<T_Data> | undefined

  createEffect(() => {
    const opts = gridOptions()

    if (!opts || !gridDiv || !window.agGrid) return
    
    if (gridApi) gridApi.updateGridOptions(opts) // grid already exists — update it
    else { // frirst time — create the grid
        gridApi = window.agGrid.createGrid(gridDiv, opts)
        if (setGridApi) setGridApi(gridApi)
    }
  })

  return <div ref={gridDiv} {...$div}></div>
}


export const defaultStyle: JSX.CSSProperties = { height: '45rem', width: '100%', 'margin-bottom': '2.1rem' }


export type AgGridProps<T_Data extends any> = {
  /** Passed to `window.agGrid.createGrid(grid, gridOptions)` */
  gridOptions: Accessor<GridOptions<T_Data>>
  /** Optional, default is `{style: defaultStyle}`, Props to set onto wrapper div */
  $div?: JSX.HTMLAttributes<HTMLDivElement>
  /** Provide setter if you'd like to work w/ gridApi */
  setGridApi?: Setter<GridApi<any> | undefined>
}


declare global {
  interface Window {
    agGrid: {
      createGrid: <T_Data>(eGridDiv: HTMLElement, gridOptions: GridOptions<T_Data>) => GridApi<T_Data>
    }
  }
}



export type AgParams<TArr extends readonly any[]> = ICellRendererParams<TArr[number]>
