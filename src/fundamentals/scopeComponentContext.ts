import { createContext, useContext } from 'solid-js'
import type { ScopeComponent } from './scopeComponent'

export const ScopeComponentContext = createContext<ScopeComponent>()
