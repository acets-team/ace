/**
 * 🧚‍♀️ How to use:
 *   import { AgGrid, defaultStyle, agWidth, defaultColDef } from '@ace/agGrid'
 *   import type { AgGridProps } from '@ace/agGrid'
 */


import { feComponent } from './feComponent'
import { onMount, type JSX } from 'solid-js'
import type { ColDef, GridApi, GridOptions } from 'ag-grid-community'


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
  // users = [ { "id": 3, "name": "Christopher Carrington", "email": "chris@gmail.com", "hasMadeAmsterdamDeposit": true, "isNewsletterSubscriber": true } ]

  <Show when={users()?.length}>
    <AgGrid gridOptions={{
      rowData: users(),
      defaultColDef,
      columnDefs: [
        { field: 'id', filter: 'agNumberColumnFilter', ...agWidth(72),
        { field: 'name', filter: 'agTextColumnFilter' },
        { field: 'email', filter: 'agTextColumnFilter', flex: 2 },
        {
          field: 'hasMadeAmsterdamDeposit',
          editable: true,
          ...agWidth(140),
          headerName: 'Made Deposit',
          cellEditor: 'agCheckboxCellEditor',
          cellRenderer: 'agCheckboxCellRenderer',
        },
        { field: 'isNewsletterSubscriber', headerName: 'Newsletter Subscriber', ...agWidth(200),
      ],
      async onCellValueChanged  (event) {
        if (event.column.getColId() !== 'hasMadeAmsterdamDeposit' || event.oldValue === event.newValue) return

        const { error } = await apiUpdateHasMadeAmsterdamDeposit({ body: { id: event.data.id, hasMadeAmsterdamDeposit: event.newValue } })

        if (!error?.message) showToast({ type: 'success', value: 'Success!' })
        else {
          showToast({ type: 'danger', value: error.message })
          event.api.getRowNode(String(event.data.id))?.setDataValue('hasMadeAmsterdamDeposit', event.oldValue)
        }
      }
    }} />
  ```
 * @param props.gridOptions - Passed to `window.agGrid.createGrid(grid, gridOptions)`
 * @param props.divProps - Optional, default is `{style: defaultStyle}`, Props to set onto wrapper div
 */
export const AgGrid = feComponent(Component)


function Component<T_Data>({ gridOptions, divProps = {style: defaultStyle} }: AgGridProps<T_Data>) {
  let grid: undefined | HTMLDivElement

  onMount(() => {
    if (grid) window.agGrid.createGrid(grid, gridOptions)
  })

  return <>
    <div ref={grid} {...divProps}></div>
  </>
}


export const defaultStyle: JSX.CSSProperties = { height: '45rem', width: '100%', 'margin-bottom': '2.1rem' }


export function agWidth(value: number): Partial<ColDef<any, any>> {
  return {
    width: value,
    minWidth: value,
    maxWidth: value,
    cellStyle: { flex: 0 }
  }
}

export const defaultColDef: Partial<ColDef<any, any>> = { flex: 1, resizable: true, filter: false }


export type AgGridProps<T_Data extends any> = {
  /** Passed to `window.agGrid.createGrid(grid, gridOptions)` */
  gridOptions: GridOptions<T_Data>
  /** Optional, default is `{style: defaultStyle}`, Props to set onto wrapper div */
  divProps?: JSX.HTMLAttributes<HTMLDivElement>
}


declare global {
  interface Window {
    agGrid: {
      createGrid: <T_Data>(eGridDiv: HTMLElement, gridOptions: GridOptions<T_Data>) => GridApi<T_Data>
    }
  }
}
