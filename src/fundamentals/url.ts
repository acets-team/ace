/**
 * 🧚‍♀️ How to access:
 *     - import { createRouteUrl, createApiGetUrl, creatApiPostUrl } from '@ace/url'
 */


import { buildURL } from '../buildURL'
import type { Routes, GET_Paths, InferParamsGET, POST_Paths, InferParamsRoute, InferParamsPOST } from './types'


/**
 * Create a url to a current route w/ intellisense
 * @param path As it appears at `new Route()`
 * @param params Object w/ keys from `path` & custom values, that when defined, get be placed into the `path`
 * @returns URL route string, w/o the env build url addded to the beginning
 */
export const createRouteUrl = <T extends Routes>(path: T, params?: InferParamsRoute<T>): string => buildURL(path, params)


/**
 * Create a url to a current api GET w/ intellisense
 * @param path As it appears at `new API()`
 * @param params Object w/ keys from `path` & custom values, that when defined, get be placed into the `path`
 * @returns URL api GET string, w/o the env build url addded to the beginning
 */
export const createApiGetUrl = <T extends GET_Paths>(path: T, params?: InferParamsGET<T>): string => buildURL(path, params)


/**
 * Create a url to a current api POST w/ intellisense
 * @param path To the route
 * @param params Object w/ keys from `path` & custom values, that when defined, get be placed into the `path`
 * @returns URL api POST string, w/o the env build url addded to the beginning
 */
export const creatApiPostUrl = <T extends POST_Paths>(path: T, params?: InferParamsPOST<T>): string => buildURL(path, params)
