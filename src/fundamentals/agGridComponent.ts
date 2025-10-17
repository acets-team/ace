/**
 * 🧚‍♀️ How to use:
 *   Plugin agGrid
 *   import { agGridComponent } from '@ace/agGridComponent'
 */


import type { JSX } from 'solid-js'
import type { AgGridParams, AgGridComponentProps } from './agGrid.types'


/**
 * ### Creates a reusable Solid component for AG Grid cell renderers
 * @param createComponent A function that receives the AG Grid params and returns Solid JSX
 * @returns A fully typed Solid function component that can be used in your 'cellRenderer'.
 * @example
  ```ts
  const TableCellAmount = agGridComponent<Transaction[]>(params => {
    const amount = params.data?.amount ?? 0

    return <>
      <div classList={{ up: amount > 0 }} class="table-amount">
        {formatter.format(Math.abs(amount))}
      </div>
    </>
  })
  ```
 */
export function agGridComponent<T extends object>(createComponent: (params: AgGridParams<T>) => JSX.Element): (solidProps: AgGridComponentProps<T>) => JSX.Element {
  return (props: AgGridComponentProps<T>) => {
    return createComponent(props.params) // calls the provided JSX function, passing the AG Grid params
  }
}
