import type { ICellRendererParams } from 'ag-grid-community'

export type AgGridParams<T> = Omit<ICellRendererParams, 'data'> & { data?: T }

export type AgGridComponentProps<T> = { params: AgGridParams<T> }
