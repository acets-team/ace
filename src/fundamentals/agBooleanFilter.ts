/**
 * 🧚‍♀️ How to access:
 *     - import { agBooleanFilter } from '@ace/agBooleanFilter'
 */


import type { INumberFilterParams } from 'ag-grid-community'


/** 
 * #### Helpful when using turso (recommended) and booleans are stored as 0 or 1 and you'd love a filter on an ag grid column
 * @example
  ```ts
  const columnDefs = [
  {
    filterParams: agBooleanFilter,
    filter: 'agNumberColumnFilter',

    width: 150,
    editable: true,
    headerName: 'Made Deposit',
    field: 'hasMadeAmsterdamDeposit',
    cellEditor: 'agCheckboxCellEditor',
    cellRenderer: 'agCheckboxCellRenderer',
    cellRendererParams: { suppressPadding: true },
  },
  ```
 */
export const agBooleanFilter: INumberFilterParams = {
  filterOptions: [
    'empty',
    {
      numberOfInputs: 0, // how many inputs are present
      displayKey: 'true', // ag grid unique identifier
      displayName: 'True',
      predicate: (_, cellValue) => Number(cellValue) === 1, // condition function
    },
    {
      numberOfInputs: 0,
      displayKey: 'false',
      displayName: 'False',
      predicate: (_, cellValue) => Number(cellValue) === 0,
    }
  ]
}
