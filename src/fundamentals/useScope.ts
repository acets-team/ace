import { useContext } from 'solid-js'
import { ScopeComponentContext } from './scopeComponentContext'


export function useScope() {
  const context = useContext(ScopeComponentContext)

  if (!context) {
    throw new Error('useScope: cannot find ScopeComponentContext')
  }

  return context
}
