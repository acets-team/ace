import type { API } from './fundamentals/api'
import type { Route } from './fundamentals/route'
import { GoResponse } from './fundamentals/goResponse'
import { getRequestEvent } from './fundamentals/getRequestEvent'
import type { APIBody, FetchEvent, URLPathParams, URLSearchParams } from './fundamentals/types'


export async function callB4(api: API | Route, { body, pathParams, searchParams }: { body?: APIBody, pathParams: URLPathParams, searchParams: URLSearchParams }, event?: FetchEvent): Promise<Response | undefined> {
  if (!api.values.b4 || !api.values.b4.length) return

  for (const fn of api.values.b4) {
    const response = await fn({ event: event || getRequestEvent(), pathParams, searchParams, body })

    if (response) {
      if (!(response instanceof Response)) throw new Error('b4 function must return a Response object')
      else {
        const clonedResponse = response.clone()
        const jsonResponse = await clonedResponse.json()

        if (jsonResponse.go) throw new GoResponse(jsonResponse.go)
        else return response
      }
    }
  }
}
