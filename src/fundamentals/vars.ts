/**
 * 🧚‍♀️ How to access:
 *     - import { defaultMessageName, jwtCookieKey, defaultError } from '@ace/vars'
 *     - import type { SupportedApiMethods } from '@ace/vars'
 */


import { config } from 'ace.config'
import { Enums, type InferEnums } from './enums'


export const defaultMessageName = '_info'

export const jwtCookieKey = () => config.jwtCookieKey || 'aceJWT'

export const supportedApiMethods = new Enums(['GET', 'POST'])

export type SupportedApiMethods = InferEnums<typeof supportedApiMethods>

export const defaultError = '❌ Sorry but an error just happened'
