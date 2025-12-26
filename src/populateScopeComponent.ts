import { createMemo } from 'solid-js'
import { Route } from './fundamentals/route'
import { useScope } from './fundamentals/useScope'
import type { Route404 } from './fundamentals/route404'
import { ScopeComponentChildren } from './scopeComponentChildren'
import { useParams, useLocation, type RouteSectionProps } from '@solidjs/router'


export function populateScopeComponent(props: RouteSectionProps, item: Route<any> | Route404 | 'RootLayout' | 'SubLayout') {
  const scope = useScope()

  // populate routeSectionProps
  scope.routeSectionProps = () => props


  // populate children
  // SubLayout & RootLayout import populateScopeComponent() (this function)
  // So rather then importing SubLayout & RootLayout into this module & doing an instanceof RootLayout check (circular dependency)
  // we use a string, so no import SubLayout & RootLayout required aka no circular dependency
  if (item === 'SubLayout') ScopeComponentChildren.set('sub', () => props.children)
  if (item === 'RootLayout') ScopeComponentChildren.set('root', () => props.children)


  // get params
  const rawPathParams = props.params
  const rawSearchParams = Object.fromEntries(new URLSearchParams(props.location.search).entries())


  // validate params
  const parsedRequest = item instanceof Route && item.values.requestParser
    ? item.values.requestParser({ pathParams: rawPathParams, searchParams: rawSearchParams })
    : { pathParams: rawPathParams, searchParams: rawSearchParams }


  // populate pathParams
  scope.pathParams = parsedRequest.pathParams

  scope.PathParams = createMemo(() => {
    const currentRawPathParams = { ...(useParams()) }
    const currentRawSearchParams = Object.fromEntries(new URLSearchParams({ ...(useLocation()) }.search).entries())

    const currentParsedRequest = item instanceof Route && item.values.requestParser
      ? item.values.requestParser({ pathParams: currentRawPathParams, searchParams: currentRawSearchParams })
      : { pathParams: currentRawPathParams, searchParams: currentRawSearchParams }

    return currentParsedRequest.pathParams
  })


  // populate search params
  scope.searchParams = parsedRequest.searchParams

  scope.SearchParams = createMemo(() => {
    const currentRawPathParams = { ...(useParams()) }
    const currentRawSearchParams = Object.fromEntries(new URLSearchParams({ ...(useLocation()) }.search).entries())

    const currentParsedRequest = item instanceof Route && item.values.requestParser
      ? item.values.requestParser({ pathParams: currentRawPathParams, searchParams: currentRawSearchParams })
      : { pathParams: currentRawPathParams, searchParams: currentRawSearchParams }

    return currentParsedRequest.searchParams
  })


  return scope
}
