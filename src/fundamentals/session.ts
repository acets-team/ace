/**
 * 🧚‍♀️ How to access:
 *     - import { setSessionData, getSessionData, clearSessionData } from '@ace/session'
 */


import { useSession } from 'vinxi/http'
import { config, type SessionData } from 'ace.config'



/** 
 * - `setSessionData()` sets `session.data[sessionDataKey]` to `sessionData`
 * - Thanks to Solid Start, all site visitors, have a browser cookie that has a key and value
 * - The cookie key is configured  @ `./ace.config.js` w/ the `cookieKey` prop and the value is a stringified and encrypted object that Solid Start calls a session
 * - `session.data` is an object that can hold whatever we want. @ `session.data[sessionDataKey]` we hold the sessionData
 * - The `SessionData` type is configured via JSDOC @ `./ace.config.js`
 * - & session data is added onto each request @ `onMiddlewareRequest()` 
 * - The data you store in a session could be a `name` or `email`, we recommend an `id` or 2 and to get the rest of the data about a user from the database when verifying the session is also in the db
 * - We recomend also storing a sessionId in the database so then if you'd ever love to sign anyone out, that can be done with a simple db update
 */
export async function setSessionData(sessionData: SessionData): Promise<void> {
  await _setSessionData(await getSession(), sessionData)
}



/** 
 * - `getSessionData()` returns: `null` if not defined or `SessionData` if defined
 * - It is meant to be an inner function w/ business logic wrapped around it, w/in your application, for example:
    ```tsx
    import { go } from '@ace/go'
    import type { SessionData } from 'ace.config'
    import { _getSessionData } from '@ace/session'


    export async function parseSessionData(): Promise<SessionData> {
      const sessionData = await _getSessionData()

      if (!sessionData) throw go('/sign-in/:messageId?', {messageId: '1'})

      return sessionData
    }
```
 * - Next anywhere => `import { parseSessionData } from '@src/lib/parseSessionData'`
 * - The `SessionData` type is configured via JSDOC @ `./ace.config.js`
 */
export async function getSessionData(): Promise<null | SessionData> {
  const session = await getSession()
  const strSessionData = session.data[sessionDataKey] // session data as a string
  return strSessionData ? JSON.parse(strSessionData) : null // JSON.parse() string session data
}



/** 
 * - `clearSessionData()` sets `session.data[sessionDataKey]` to `null`
 * - Thanks to Solid Start, all site visitors, have a browser cookie that has a key and value
 * - The cookie key is configured  @ `./ace.config.js` w/ the `cookieKey` prop and the value is a stringified and encrypted object that Solid Start calls a session
 * - `session.data` is an object that can hold whatever we want. @ `session.data[sessionDataKey]` we hold the sessionData
 * - The `SessionData` type is configured via JSDOC @ `./ace.config.js`
 * - The data you store in a session could be a `name` or `email`, we recommend an `id` or 2 and to get the rest of the data about a user from the database when verifying the session is also in the db
 * - We recomend also storing a sessionId in the database so then if you'd ever love to sign anyone out, that can be done with a simple db update
 */
export async function clearSessionData(): Promise<void> {
  await _setSessionData(await getSession(), null)
}



const sessionDataKey = 'sessionData'



async function _setSessionData<T extends SessionData>(session: SolidStartSession, sessionData: null | T): Promise<void> {
  await session.update((d) => (d[sessionDataKey] = sessionData ? JSON.stringify(sessionData) : null))
}



async function getSession(): Promise<SolidStartSession> {
  if (!process.env.SESSION_CRYPT_PASSWORD) throw new Error('Please set process.env.SESSION_CRYPT_PASSWORD')
  return await useSession<SessionData>({ name: config.cookieKey, password: process.env.SESSION_CRYPT_PASSWORD })
}



type SolidStartSession = Awaited<ReturnType<typeof useSession>>
