import type { BE } from './fundamentals/be'
import type { API } from './fundamentals/api'
import { GoResponse } from './fundamentals/goResponse'
import type { API2FullAPIResponse, PrunedAPIResponse } from './fundamentals/types'


export async function callAPIResolve<T_API extends API<any, any, any, any>>(api: T_API, be: BE): Promise<Response | undefined> {
  if (typeof api.values.resolve === 'function') {
    const originalResponse = await api.values.resolve(be)

    if (!(originalResponse instanceof Response)) throw new Error(`Error w/ API ${api.values.fn} aka ${api.values.path} -- API\'s must return a Response, please return from your api w/ respond(), be.success(), be.Success(), be.error(), be.Error(), be.go(), be.Go(), or throw a new Error() or throw a new AceError(). the current response is not an instanceOf Response, current: ${originalResponse}`)

    const inferResponse: API2FullAPIResponse<T_API> = (await originalResponse.json())

    if (inferResponse.go) throw new GoResponse(inferResponse.go)

    const newResponse: PrunedAPIResponse = {}

    if (inferResponse.data) newResponse.data = inferResponse.data
    if (inferResponse.error) newResponse.error = inferResponse.error

    return new Response(JSON.stringify(newResponse), {
      status: originalResponse.status,
      headers: new Headers(originalResponse.headers)
    })
  }
}
