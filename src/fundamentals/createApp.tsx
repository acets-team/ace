/**
* 🧚‍♀️ How to access:
*     - import { createApp } from '@ace/createApp'
*     - import type { ParentComponentEntry, ParentComponentEntryWithProps } from '@ace/createApp'
*/


import { Layout } from './layout'
import { Route404 } from './route404'
import { Route as AceRoute } from './route'
import { MetaProvider } from '@solidjs/meta'
import { FileRoutes } from '@solidjs/start/router'
import { MessagesCleanup } from '../messagesCleanup'
import { setScopeComponentChildren } from '../scopeComponentChildren'
import { scope, ScopeComponentContextProvider } from './scopeComponent'
import { createMemo, lazy, Suspense, type JSX, type ParentComponent } from 'solid-js'
import { Route, Router, useLocation, useParams, type RouteSectionProps } from '@solidjs/router'



/** 
 * @param requestedParentComponents - The first component is the outermost, at the end of your list will automatically be added: `[FEContextProvider, MetaProvider, Suspense]` so if you provide `export default createApp([AuthProvider])` the result is `[AuthProvider, FEContextProvider, MetaProvider, Suspense]`
 * @returns A function that when called provided an <App /> component
 * @example
```ts
import './app.css'
import '@ace/toast.styles.css'
import '@ace/tooltip.styles.css'
import '@ace/loading.styles.css'
import { createApp } from '@ace/createApp'
import { AuthProvider } from '@src/AuthProvider/AuthProvider'


export default createApp([AuthProvider])
```
 */
export function createApp(requestedParentComponents: ParentComponentEntry<any>[] = []) {
  const parentComponents = [...requestedParentComponents, ...defaultParentComponents]

  const Root: ParentComponent<any> = (props: RouteSectionProps) => {
    let RootAccumulator: ParentComponent<any> = (p) => <>{p.children}</> // will become our Root, starts w/ the children and with each loop adds a Wrapper

    for (let i = parentComponents.length - 1; i >= 0; i--) {
      const entry = parentComponents[i]
      if (!entry) continue

      const { parentComponent: Wrapper, props } = normalizeParentComponent(entry)

      const CurrentRoot = RootAccumulator // get Wrapper children

      // place ParentComponent around CurrentRoot AND update the RootAccumulator
      RootAccumulator = (p) => <>
        <Wrapper {...props}>
          <CurrentRoot>{p.children}</CurrentRoot>
        </Wrapper>
      </>
    }

    return <RootAccumulator>{props.children}</RootAccumulator> // now render RootAccumulator around props.children
  }

  return function App(): JSX.Element {
    return <>
      <Router root={Root}>
        <FileRoutes />
{/* gen */}
      </Router>
    </>
  }
}



const defaultParentComponents: ParentComponentEntry<any>[] = [
  ScopeComponentContextProvider,
  MetaProvider,
  Suspense,
]



function lazyRoute(loader:() => Promise<any>) {
  return lazy(async () => {
    const mod = await loader()

    return {
      default: () => {
        const route = mod?.default
        if (!(route instanceof AceRoute) && !(route instanceof Route404)) throw new Error('invalid route module')

        const component = route.values.component
        if (!component) throw new Error('!component')

        if (route instanceof AceRoute) {
          scope.pathParams = { ...(route.values.pathParamsParser ? route.values.pathParamsParser({...(useParams())}) : useParams()) }

          scope.PathParams = createMemo(() => {
            return { ...(route.values.pathParamsParser ? route.values.pathParamsParser({...(useParams())}) : useParams()) }
          })

          scope.searchParams = route.values.searchParamsParser
            ? route.values.searchParamsParser(Object.fromEntries(new URLSearchParams(useLocation().search).entries()))
            : Object.fromEntries(new URLSearchParams(useLocation().search).entries())

          scope.SearchParams = createMemo(() => {
            const params =  Object.fromEntries(new URLSearchParams(useLocation().search).entries())
            return { ...(route.values.searchParamsParser ? route.values.searchParamsParser(params) : params) }
          })
        } else {
          scope.pathParams = { ...(useParams()) }

          scope.PathParams = createMemo(() => {
            return { ...(useParams()) }
          })

          scope.searchParams = Object.fromEntries(new URLSearchParams(useLocation().search).entries())

          scope.SearchParams = createMemo(() => {
            return Object.fromEntries(new URLSearchParams(useLocation().search).entries())
          })
        }

        const jsx = component(scope)

        return !jsx ? undefined : <>
          {jsx}
          <MessagesCleanup />
        </>
      }
    }
  })
}



function lazyLayout(props: RouteSectionProps<unknown>, loader:() => Promise<any>) {
  const LazyRootLayout = lazy(async () => {
    const mod = await loader()

    const layout = mod.default
    if (!(layout instanceof Layout)) throw new Error('invalid layout module')
        
    return {
      default (props: RouteSectionProps<unknown>) {
        if (!layout.values.component) throw new Error('!layout.values.component')
        setScopeComponentChildren(scope, props.children)
        return layout.values.component(scope)
      }
    }
  })

  return <LazyRootLayout {...props} />
}



function normalizeParentComponent<T_Props extends Record<string, any> = {}>(entry: ParentComponentEntry<T_Props>): ParentComponentEntryWithProps<T_Props> {
  if (typeof entry === 'function') return { parentComponent: entry, props: {} as T_Props }  // bare ParentComponent<P>
  else return { parentComponent: entry.parentComponent, props: entry.props ?? ({} as T_Props) } // obj ParentComponent
}



export type ParentComponentEntry<T_Props extends Record<string, any> = {}> = ParentComponent<T_Props> | ParentComponentEntryWithProps<T_Props>



export type ParentComponentEntryWithProps<T_Props extends Record<string, any> = {}> = {
  parentComponent: ParentComponent<T_Props>
  props: T_Props
}
