/**
 * 🧚‍♀️ How to access:
 *     - import { goStatuses, defaultMessageName, defaultError, apiMethods } from '@ace/vars'
 */


import { Enums } from './enums'

export const defaultMessageName = '_info'

export const apiMethods = new Enums(['GET', 'POST', 'PUT', 'DELETE'])

export const defaultError = '❌ Sorry but an error just happened'

/** if we use a 3xx response then query() follows it before we get to createAsync() and then createAsync() is given the html we're redirecting to, so this fools that */
export const goStatusCode = 200

/** by putting the url in the header no json parsing necessary */
export const goHeaderName = 'Location'
