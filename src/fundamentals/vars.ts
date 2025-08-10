/**
 * 🧚‍♀️ How to access:
 *     - import { goStatuses, defaultError, apiMethods, defaultMessageName } from '@ace/vars'
 */


import { Enums } from './enums'

export const defaultMessageName = '_info'

export const defaultError = '❌ Sorry but an error just happened'

export const apiMethods = new Enums(['GET', 'POST', 'PUT', 'DELETE'])

/** if we use a 3xx response then feFetch() tries to do redirects so then it'll do a fetch() for the next page which is wrong so this fools that */
export const goStatusCode = 200

/**
 * - By using Location as the header name, query() actually handles server side redirects which is helpful
 * - By putting the url in the header no json parsing is necessary
 */
export const goHeaderName = 'Location'
