/**
 * 🧚‍♀️ How to use:
 *   import { agShowColumn } from '@ace/agShowColumn'
 */


import type { ColDef } from 'ag-grid-community'


/**
 * Conditionally add a column to a table
 * @param condition - If true the column shows
 * @param colDef - Column definition
 * @dxample
  ```tsx
  import type { GridApi } from 'ag-grid-community'

  const [usersGridApi, setUsersGridApi] = createSignal<GridApi<any>>()

  <AgGrid 
    setGridApi={setUsersGridApi}
    gridOptions={{
      rowData: users(),
      columnDefs: [
        { field: 'id', filter: 'agNumberColumnFilter', width: 72 },
        { field: 'name', filter: 'agTextColumnFilter', width: 210 },
        ...agShowColumn<ApiName2Data<'apiGetUsers'>>(props.source === 'admin', { field: 'isNewsletterSubscriber', headerName: 'Email Subscriber', width: 170 }),
      ],
    }}
  />
  ```
 */
export function agShowColumn<T_Data extends readonly any[]>(condition: boolean, colDef: ColDef<T_Data[number]>): ColDef<T_Data[number]>[] {
  return condition ? [colDef] : []
}
