/**
 * 🧚‍♀️ How to access:
 *     - import { goStatuses, defaultError, apiMethods, defaultMessageName } from '@ace/vars'
 */


import { Enums } from './enums'


/** 
 * - Messages are grouped by name: `Map<string, Signal<string[]>>`
 * - Messages are read from `response.error.messages` & typically have `valibot` / `zod` errors
 * - If `response.error.message` is defined, we'll put that value @ `mesages[defaultMessageName] = [response.error.message]`
 */
export const defaultMessageName = '_info'


/** If no other error is provided we'll show this */
export const defaultError = '❌ Sorry but an error just happened'


/** The api methods we support */
export const apiMethods = new Enums(['GET', 'POST', 'PUT', 'DELETE'])


/** If we use a 3xx response then feFetch() tries to do redirects so then it'll do a fetch() for the next page which is wrong so this fools that */
export const goStatusCode = 200

/**
 * 
 * - By using Location as the header name, query() actually handles server side redirects which is helpful when doing a queryType of 'stream'
 * - By putting the url in the header & not the body => no json parsing is necessary
 */
export const goHeaderName = 'ace_go'


/** 
 * - Atom's in Ace = frontend data that can be persisted to all the locations mentioned here:
 * - **idb** is Index Db: `~ hundreds of MBs` - Persists post page refresh, across all tabs & through browser refreh (best @ home, they trust this device a lot & got tons of space)
 * - **ls** is Local Storage: `~5 MB` - Persists post page refresh, across all tabs & through browser refreh (good @ home, they trust this device a lot & got some space)
 * - **ss** is Session Storage: `~5 MB` - Persists post page refresh, across all tabs but not through browser refreh, (best @ library, when I close the browser my data is gone)
 * - **m** is Memory: `available RAM` - Not shared between tabs, and not persisted after any refresh, (best for ephemeral or private data that can exist on the sceen and that's it)
 */
export const atomPersit = new Enums(['idb', 'ls', 'ss', 'm'])


/** 
 * - Atom's in Ace = frontend data that can be persisted to all the locations mentioned @ `AtomSaveLocations`
 * - `AtomIs` helps us ensure that we serialize and deserialize to and from persistance correctly
 */
export const atomIs = new Enums(['string', 'number', 'boolean', 'date', 'json'])


/** Index db default database name */
export const idbDefaultDbName = 'ace_db'


/** Index db default store name */
export const idbDefaultStoreName = 'kv'


/** @link https://github.com/acets-team/ace?tab=readme-ov-file#call-apis > full explanation of `queryType` */
export const queryType = new Enums(['stream', 'direct', 'maySetCookies'])
