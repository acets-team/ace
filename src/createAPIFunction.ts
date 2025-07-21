import { callB4 } from './callB4'
import { BE } from './fundamentals/be'
import { redirect } from '@solidjs/router'
import type { API } from './fundamentals/api'
import { callAPIResolve } from './callAPIResolve'
import { validateParams } from './validateParams'
import { AceError } from './fundamentals/aceError'
import { GoResponse } from './fundamentals/goResponse'
import { getRequestEvent } from './fundamentals/getRequestEvent'
import type { APIFnProps, API2FEFunction } from './fundamentals/types'


export function createAPIFunction<T_API extends API<any, any, any, any, any>>(api: T_API): API2FEFunction<T_API> {
  const fn = async (options?: APIFnProps<T_API>) => {
    try {
      const o = options ?? ({} as APIFnProps<T_API>)

      const { pathParams, searchParams } = validateParams({
        rawParams: o.pathParams ?? {},
        rawSearch: o.searchParams ?? {},
        pathParamsSchema: api.values.pathParamsSchema,
        searchParamsSchema: api.values.searchParamsSchema
      })

      const be = BE.CreateFromFn(getRequestEvent(), pathParams, searchParams, o.body ?? {})

      if (api.values.b4) {
        const b4Response = await callB4(api, { pathParams, searchParams })
        if (b4Response) return b4Response as any
      }

      return await callAPIResolve(api, be)
    } catch (error) {
      if (error instanceof GoResponse) throw redirect(error.url)
      else throw AceError.catch({ error })
    }
  }

  return fn as API2FEFunction<T_API> // assert that `fn` really *is* our conditional API2FEFunction
}