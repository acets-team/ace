/**
 * 🧚‍♀️ How to access:
 *     - import { createContextProvider } from '@ace/createContextProvider'
 */


import type { JSX, Context } from 'solid-js'


/**
 * - Helpful when you'd love to share data between pages & components
 * @example
  ```ts
  import { createContext, createSignal } from 'solid-js'
  import { createContextProvider } from '@ace/createContextProvider'

  export const AuthContext = createContext({
    currentUserId: createSignal<string | undefined>(),
    currentUserName: createSignal<string | undefined>(),
  })

  export const AuthContextProvider = createContextProvider(AuthContext)
  ```
 * 
 * ---
 * @example
  ```ts
  import './Dashboard.css'
  import { Layout } from '@ace/layout'
  import { createEffect, useContext } from 'solid-js'
  import { beAsync, beGET, beParse } from '@ace/beAsync'
  import { AuthContext, AuthContextProvider } from '@src/contexts/AuthContext'


  const _user = beAsync(() => beGET('/api/user'), 'user')


  export default new Layout()
    .component((fe) => {
      const authContext = useContext(AuthContext)

      const user = beParse(() => _user())

      createEffect(() => {
        authContext.currentUsersId[1](user()?.data?.id)
        authContext.currentUsersName[1](user()?.data?.name)
      })

      return <>
        <div class="dashboard">
          <AuthContextProvider>
            {fe.getChildren()}
          </AuthContextProvider>
        </div>
      </>
    })
  ```
 * 
 * ---
 * @example
  ```ts
  import { useContext } from 'solid-js'
  import { AuthContext } from '@src/contexts/AuthContext'

  function Component() {
    const auth = useContext(AuthContext)
  }
  ```
 * @param Context 
 * @returns 
 */
export function createContextProvider<T_Initial_Value extends object>(Context: Context<T_Initial_Value>) {
  return function (props: GeneratedProviderProps<T_Initial_Value>) {
    const initialValue = props.initialValue ?? Context.defaultValue
    // const store = createStore(initialValue)

    return <>
      <Context.Provider value={initialValue}>
        {props.children}
      </Context.Provider>
    </>
  }
}


interface ProviderProps {children?: JSX.Element}


/**
* - Props for a generated context provider
* - Allows overrides of the initial state
*/
interface GeneratedProviderProps<T_Initial_Value extends object> extends ProviderProps {
  /** If omitted, Context.defaultValue is used */
  initialValue?: T_Initial_Value
}
