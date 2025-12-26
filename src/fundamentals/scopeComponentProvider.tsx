import { ParentComponent } from 'solid-js'
import { ScopeComponent } from './scopeComponent'
import { ScopeComponentContext } from './scopeComponentContext'


export const ScopeComponentProvider: ParentComponent = (props) => {
  const scope = new ScopeComponent()

  return <>
    <ScopeComponentContext.Provider value={scope}>
      {props.children}
    </ScopeComponentContext.Provider>
  </>
}
