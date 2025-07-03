// @ts-check
// It is easiest for `ace build` to read js files, so that is why this is a js file


/**
 * - A fundamental is a file that has helpful stuff in it
 * - A collection of these files is a plugin
 * - Users opt into fundamentals by opting into plugins
 * - Types
 *     - `copy`: Simply copy the content from the src folder to their output folder
 *     - `helper`: Not a fundamental but helps them
 *     - `custom`: Copy + Custom implementation
 */
class Fundamental {
  /**
   * @param {string} ext - File extension
   * @param {'solid' | 'valibot' | 'turso' | 'mongoose'} pluginName - Name of plugin
   * @param {'copy' | 'helper' | 'custom'} type Type of fundamental
   */
  constructor(ext, pluginName, type) {
    this.ext = ext
    this.type = type
    this.pluginName = pluginName
  }
}


export const fundamentals = new Map([
  ['a', new Fundamental('tsx', 'solid', 'copy')],
  ['aceError', new Fundamental('ts', 'solid', 'copy')],
  ['api', new Fundamental('ts', 'solid', 'copy')],
  ['apis', new Fundamental('ts', 'solid', 'copy')],
  ['animatedFor', new Fundamental('tsx', 'solid', 'copy')],
  ['base64UrlDecode', new Fundamental('ts', 'solid', 'copy')],
  ['base64UrlEncode', new Fundamental('ts', 'solid', 'copy')],
  ['be', new Fundamental('ts', 'solid', 'copy')],
  ['beMessages', new Fundamental('ts', 'solid', 'helper')],
  ['bits', new Fundamental('ts', 'solid', 'helper')],
  ['buildURL', new Fundamental('ts', 'solid', 'copy')],
  ['callAPIResolve', new Fundamental('ts', 'solid', 'helper')],
  ['callB4', new Fundamental('ts', 'solid', 'helper')],
  ['carousel', new Fundamental('tsx', 'solid', 'copy')],
  ['carousel.styles', new Fundamental('css', 'solid', 'copy')],
  ['createAPIFunction', new Fundamental('ts', 'solid', 'helper')],
  ['cuteLog', new Fundamental('ts', 'solid', 'copy')],
  ['clear', new Fundamental('ts', 'solid', 'copy')],
  ['cms', new Fundamental('ts', 'turso', 'copy')],
  ['cmsApi', new Fundamental('ts', 'turso', 'copy')],
  ['cmsSchema', new Fundamental('ts', 'turso', 'copy')],
  ['cmsSQL', new Fundamental('ts', 'turso', 'copy')],
  ['createApp', new Fundamental('tsx', 'solid', 'custom')],
  ['createKey', new Fundamental('ts', 'solid', 'copy')],
  ['createOnSubmit', new Fundamental('ts', 'solid', 'copy')],
  ['dateTimeFormat', new Fundamental('tsx', 'solid', 'copy')],
  ['enums', new Fundamental('ts', 'solid', 'copy')],
  ['eventToPathname', new Fundamental('ts', 'solid', 'helper')],
  ['fe', new Fundamental('tsx', 'solid', 'copy')],
  ['feComponent', new Fundamental('tsx', 'solid', 'copy')],
  ['feChildren', new Fundamental('ts', 'solid', 'helper')],
  ['feFetch', new Fundamental('ts', 'solid', 'helper')],
  ['feMessages', new Fundamental('ts', 'solid', 'helper')],
  ['getMiddleware', new Fundamental('ts', 'solid', 'copy')],
  ['getRequestEvent', new Fundamental('ts', 'solid', 'copy')],
  ['go', new Fundamental('ts', 'solid', 'copy')],
  ['goResponse', new Fundamental('ts', 'solid', 'copy')],
  ['hashCreate', new Fundamental('ts', 'solid', 'copy')],
  ['hashValidate', new Fundamental('ts', 'solid', 'copy')],
  ['holdUp', new Fundamental('ts', 'solid', 'copy')],
  ['iso', new Fundamental('ts', 'solid', 'copy')],
  ['jwtCreate', new Fundamental('ts', 'solid', 'copy')],
  ['jwtValidate', new Fundamental('ts', 'solid', 'copy')],
  ['jwtCookieGet', new Fundamental('ts', 'solid', 'copy')],
  ['jwtCookieSet', new Fundamental('ts', 'solid', 'copy')],
  ['jwtCookieClear', new Fundamental('ts', 'solid', 'copy')],
  ['layout', new Fundamental('ts', 'solid', 'copy')],
  ['load', new Fundamental('ts', 'solid', 'copy')],
  ['loading', new Fundamental('tsx', 'solid', 'copy')],
  ['loading.styles', new Fundamental('css', 'solid', 'copy')],
  ['lorem', new Fundamental('ts', 'solid', 'copy')],
  ['messages', new Fundamental('tsx', 'solid', 'copy')],
  ['messagesCleanup', new Fundamental('tsx', 'solid', 'helper')],
  ['mongoConnect', new Fundamental('ts', 'mongoose', 'copy')],
  ['mongoModel', new Fundamental('ts', 'mongoose', 'copy')],
  ['onAPIEvent', new Fundamental('ts', 'solid', 'copy')],
  ['onMiddlewareRequest', new Fundamental('ts', 'solid', 'copy')],
  ['parseNumber', new Fundamental('ts', 'solid', 'copy')],
  ['pathnameToMatch', new Fundamental('ts', 'solid', 'helper')],
  ['pathnameToPattern', new Fundamental('ts', 'solid', 'copy')],
  ['pick', new Fundamental('ts', 'solid', 'copy')],
  ['radioCards', new Fundamental('tsx', 'solid', 'copy')],
  ['radioCards.styles', new Fundamental('css', 'solid', 'copy')],
  ['randomBetween', new Fundamental('ts', 'solid', 'copy')],
  ['respond', new Fundamental('ts', 'solid', 'copy')],
  ['route', new Fundamental('ts', 'solid', 'copy')],
  ['route404', new Fundamental('ts', 'solid', 'copy')],
  ['resolveAlias', new Fundamental('ts', 'solid', 'helper')],
  ['selectPlaceholder', new Fundamental('ts', 'solid', 'copy')],
  ['shimmer.styles', new Fundamental('css', 'solid', 'copy')],
  ['slideshow.styles', new Fundamental('css', 'solid', 'copy')],
  ['slideshow', new Fundamental('tsx', 'solid', 'copy')],
  ['submit', new Fundamental('tsx', 'solid', 'copy')],
  ['tabs', new Fundamental('tsx', 'solid', 'copy')],
  ['tabs.styles', new Fundamental('css', 'solid', 'copy')],
  ['toast', new Fundamental('tsx', 'solid', 'copy')],
  ['toast.styles', new Fundamental('css', 'solid', 'copy')],
  ['tooltip', new Fundamental('tsx', 'solid', 'copy')],
  ['tooltip.styles', new Fundamental('css', 'solid', 'copy')],
  ['tursoConnect', new Fundamental('ts', 'turso', 'copy')],
  ['types', new Fundamental('ts', 'solid', 'custom')],
  ['url', new Fundamental('ts', 'solid', 'copy')],
  ['valibotSchema', new Fundamental('ts', 'valibot', 'copy')],
  ['vars', new Fundamental('ts', 'solid', 'copy')],
])
