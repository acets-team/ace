/**
 * 🧚‍♀️ How to access:
 *     - import { createRouteUrl, createApiGetUrl, creatApiPostUrl } from '@ace/url'
 */


import { buildURL } from './buildURL'
import type { Routes, GETPaths, GETPath2Params, POSTPaths, RoutePath2Params, POSTPath2Params } from './types'


/**
 * Create a url to a current route w/ intellisense
 * @param path As it appears at `new Route()`
 * @param params Object w/ keys from `path` & custom values, that when defined, get be placed into the `path`
 * @returns URL route string, w/o the env build url addded to the beginning
 */
export const createRouteUrl = <T extends Routes>(path: T, params?: RoutePath2Params<T>): string => buildURL(path, params)


/**
 * Create a url to a current api GET w/ intellisense
 * @param path As it appears at `new API()`
 * @param params Object w/ keys from `path` & custom values, that when defined, get be placed into the `path`
 * @returns URL api GET string, w/o the env build url addded to the beginning
 */
export const createApiGetUrl = <T extends GETPaths>(path: T, params?: GETPath2Params<T>): string => buildURL(path, params)


/**
 * Create a url to a current api POST w/ intellisense
 * @param path To the route
 * @param params Object w/ keys from `path` & custom values, that when defined, get be placed into the `path`
 * @returns URL api POST string, w/o the env build url addded to the beginning
 */
export const creatApiPostUrl = <T extends POSTPaths>(path: T, params?: POSTPath2Params<T>): string => buildURL(path, params)
