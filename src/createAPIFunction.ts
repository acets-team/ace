import { BE } from './fundamentals/be'
import { redirect } from '@solidjs/router'
import type { API } from './fundamentals/api'
import { callAPIResolve } from './callAPIResolve'
import { AceError } from './fundamentals/aceError'
import { GoResponse } from './fundamentals/goResponse'
import { jwtCookieGet } from './fundamentals/jwtCookieGet'
import type { APIFnOptions, API2FEFunction } from './fundamentals/types'
import { callB4 } from './callB4'


export function createAPIFunction<T_API extends API<any, any, any, any>>(api: T_API): API2FEFunction<T_API> {
  return async (options?: APIFnOptions<T_API>) => {
    try {
      const o = options ?? {} as APIFnOptions<T_API>
  
      const params = (o as any).params ?? {}
      const search = (o as any).search ?? {}
      const body   = (o as any).body ?? {}
  
      const be = BE.CreateFromFn(params, search, body)
  
      if (typeof api.values.b4 === 'function') {
        const b4Response = await callB4(api, await jwtCookieGet())
        if (b4Response) return b4Response as any
      }

      return await callAPIResolve(api, be)
    } catch (error) {
      if (error instanceof GoResponse) throw redirect(error.url)
      else throw AceError.catch({ error })
    }
  }
}
