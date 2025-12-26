import { Suspense } from 'solid-js'
import { Router } from '@solidjs/router'
import { MetaProvider } from '@solidjs/meta'
import { FileRoutes } from '@solidjs/start/router'
import type { RouteSectionProps } from '@solidjs/router'
import { ScopeComponentProvider } from '@ace/scopeComponentProvider'


export function BaseApp() {
  return <>
    <ScopeComponentProvider>
      <MetaProvider>
        <Router root={(props: RouteSectionProps) => <Suspense>{props.children}</Suspense>}>
          <FileRoutes />
        </Router>
      </MetaProvider>
    </ScopeComponentProvider>
  </>
}
