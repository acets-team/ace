/**
 * 🧚‍♀️ How to access:
 *     - import { defaultMessageName, jwtCookieKey, defaultError } from '@ace/vars'
 */


import { Enums } from './enums'
import { config } from 'ace.config'


export const defaultMessageName = '_info'

export const jwtCookieKey = () => config.jwtCookieKey || 'aceJWT'

export const apiMethods = new Enums(['GET', 'POST', 'PUT', 'DELETE'])

export const defaultError = '❌ Sorry but an error just happened'
