/**
* 🧚‍♀️ How to access:
*     - import { createApp } from '@ace/createApp'
*     - import type { ParentComponentEntry, ParentComponentEntryWithProps } from '@ace/createApp'
*/


import { Layout } from './layout'
import { Route404 } from './route404'
import { aceParams } from './aceParams'
import { Route as AceRoute } from './route'
import { fe, FEContextProvider } from './fe'
import { MetaProvider } from '@solidjs/meta'
import { setFEChildren } from '../feChildren'
import { FileRoutes } from '@solidjs/start/router'
import { MessagesCleanup } from '../messagesCleanup'
import { Suspense, type JSX, type ParentComponent } from 'solid-js'
import { Route, Router, type RouteSectionProps } from '@solidjs/router'



/** gen1 */
const layout1 = new Layout()
  .component(() => <></>)

const routeA = new AceRoute('/a')
  .component(() => <></>)
  .layouts([layout1])

const routeB = new AceRoute('/b')
  .component(() => <></>)
  .layouts([layout1])

const routeC = new AceRoute('/c:id')
  .pathParams(aceParams(({ id }) => {
    if (typeof id !== 'number') throw new Error('id must be a number')
    return { id }
  }))
  .layouts([layout1])
  .component(fe => {
    return <>{fe.pathParams}</>
  })

export const routes = {
  '/a': routeA,
  '/b': routeB,
  '/c:id': routeC
}
/** gen2 */


const defaultParentComponents: ParentComponentEntry<any>[] = [
  FEContextProvider,
  MetaProvider,
  Suspense,
]


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
{/* gen3 */}
      </Router>
    </>
  }
}


function normalizeParentComponent<T_Props extends Record<string, any> = {}>(entry: ParentComponentEntry<T_Props>): ParentComponentEntryWithProps<T_Props> {
  if (typeof entry === 'function') return { parentComponent: entry, props: {} as T_Props }  // bare ParentComponent<P>
  else return { parentComponent: entry.parentComponent, props: entry.props ?? ({} as T_Props) } // obj ParentComponent
}



function routeComponent(route: AceRoute | Route404): JSX.Element | undefined {
  const res = route.values.component?.(fe)

  return !res ? undefined : <>
    {res}
    <MessagesCleanup />
  </>
}



function layoutComponent(props: RouteSectionProps, layout: Layout): JSX.Element {
  setFEChildren(fe, props.children)
  return layout.values.component?.(fe)
}



export type ParentComponentEntry<T_Props extends Record<string, any> = {}> = ParentComponent<T_Props> | ParentComponentEntryWithProps<T_Props>

export type ParentComponentEntryWithProps<T_Props extends Record<string, any> = {}> = {
  parentComponent: ParentComponent<T_Props>
  props: T_Props
}