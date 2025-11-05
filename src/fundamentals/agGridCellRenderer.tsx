/**
 * 🧚‍♀️ How to use:
 *   Plugin agGrid
 *   import { agGridComponent } from '@ace/agGridComponent'
 *   import type { AgGridCellRendererProps } from '@ace/agGridComponent'
 */


import { render } from 'solid-js/web'
import { untrack, type JSX } from 'solid-js'
import type { AgGridParams, AgGridComponentProps } from './agGrid.types'


/**
 * ### Creates an AG Grid cell renderer w/ a Solid component
 * @example
    ```ts
    <AgGrid 
      gridOptions={() => ({
        rowData: store.transactions,
        defaultColDef: { flex: 1, sortable: true, resizable: true },
        columnDefs: [
          {
            sort: 'desc',
            field: 'date',
            filter: 'agDateColumnFilter',
            cellRenderer: agGridCellRenderer({ component: TableCellDate }),
          },
          { field: 'description', filter: 'agTextColumnFilter', },
          {
            field: 'amount',
            sortable: false,
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
 * @param props.component - The component to render in the cell
 * @param props.onDestroy - Optional, callback when this cell is destroyed
 * @param props.refresh - Optional, default is true, ON `params` aka ON `cell data` update => IF `props.refresh` = `true` THEN AG Grid maintains component (default / standard / b/c we can do updates in the component) ELSE AG Grid destroys component and then calls `init()` to create a new one component (not standard / optional)
 */
export function agGridCellRenderer(props: {
  /** The component to render in the cell */
  component: (props: AgGridComponentProps<any>) => JSX.Element,
  /** Optional, default is true, ON `params` aka ON `cell data` update => IF `props.refresh` = `true` THEN AG Grid maintains component (default / standard / b/c we can do updates in the component) ELSE AG Grid destroys component and then calls `init()` to create a new one component (not standard / optional) */
  refresh?: boolean,
  /** Optional, callback when this cell is destroyed */
  onDestroy?: () => void,
}) {
  return class { // this class aligns w/ the class ag grid is expecting for a cell & we're just placing a compiled solid component in it
    dispose?: () => void
    $div?: HTMLDivElement

    init(params: AgGridParams<any>) {
      if (this.$div) this.dispose?.()
      this.$div = document.createElement('div')

      this.dispose = render(() => untrack(() => (
        <props.component params={params} />
      )), this.$div!)
    }

    getGui() {
      return this.$div
    }

    /** Gets called once by grid after rendering is finished - if your renderer needs to do any cleanup, do it here */
    destroy() {
      if (this.dispose) this.dispose()
      if (props.onDestroy) props.onDestroy()
    }

    /**
     * - Tells AG Grid whether your custom cell renderer can handle data updates without being recreated
     * - AG Grid calls refresh() whenever The row’s data changes (ex: sorting) but the same DOM element is being reused for performance reasons
     * - If your refresh() returns:
     *     - true → AG Grid keeps your existing DOM element and assumes you updated it yourself.
     *     - false → AG Grid destroys your renderer, removes it from the DOM, and calls init() again to create a new one.
     */
    refresh() {
      return props.refresh ?? true
    }
  }
}


export type AgGridCellRendererProps = Parameters<typeof agGridCellRenderer>[0]
