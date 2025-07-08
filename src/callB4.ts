import type { API } from './fundamentals/api'
import type { Route } from './fundamentals/route'
import { GoResponse } from './fundamentals/goResponse'
import type { JwtValidateResponse } from './fundamentals/jwtValidate'
import type { URLPathParams, URLSearchParams } from './fundamentals/types'


export async function callB4(api: API | Route, jwt: JwtValidateResponse, { pathParams, searchParams }: { pathParams: URLPathParams, searchParams: URLSearchParams }): Promise<Response | undefined> {
  if (!api.values.b4) return

  const response = await api.values.b4({ jwt, pathParams, searchParams })

  if (response) { // if b4 gives us a response, give that response to the user
    if (!(response instanceof Response)) throw new Error('b4 function must return a Response object')
    else {
      const clonedResponse = response.clone()
      const jsonResponse = await clonedResponse.json()

      if (jsonResponse.go) throw new GoResponse(jsonResponse.go)
      else return response
    }
  }
}
