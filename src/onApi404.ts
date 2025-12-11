import type { AceResData } from './fundamentals/types'
import { createAceResponse } from './fundamentals/aceResponse'


export function onApi404<T_Res_Data extends AceResData>() {
  return createAceResponse<T_Res_Data>({ error: { message: 'Not Found' } }, { status: 404 })
}
