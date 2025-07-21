import type { BE } from './fundamentals/be'
import type { API } from './fundamentals/api'
import { GoResponse } from './fundamentals/goResponse'
import type { API2Response } from './fundamentals/types'


export async function callAPIResolve<T_API extends API<any,any,any,any, any>>(api: T_API, be: BE): Promise<Response | undefined> {
  if (typeof api.values.resolve === 'function') {
    const originalResponse = await api.values.resolve(be)

    if (!(originalResponse instanceof Response)) throw new Error(`Error w/ API ${api.values.fn} aka ${api.values.path} -- API\'s must return a Response, please return from your api w/ respond(), be.success(), be.Success(), be.error(), be.Error(), be.go(), be.Go(), or throw a new Error() or throw a new AceError(). the current response is not an instanceOf Response, current: ${originalResponse}`)

    const inferResponse: API2Response<T_API> = (await originalResponse.json())

    if (inferResponse.go) throw new GoResponse(inferResponse.go)

    return new Response(JSON.stringify(inferResponse), {
      status: originalResponse.status,
      headers: new Headers(originalResponse.headers)
    })
  }
}
