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
   * @param {'solid' | 'zod' | 'valibot' | 'turso' | 'agGrid' | 'brevo'} pluginName - Name of plugin
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
  ['agGrid', new Fundamental('tsx', 'agGrid', 'copy')],
  ['api', new Fundamental('ts', 'solid', 'copy')],
  ['animatedFor', new Fundamental('tsx', 'solid', 'copy')],
  ['base64UrlDecode', new Fundamental('ts', 'solid', 'copy')],
  ['base64UrlEncode', new Fundamental('ts', 'solid', 'copy')],
  ['bits', new Fundamental('ts', 'solid', 'helper')],
  ['buildUrl', new Fundamental('ts', 'solid', 'helper')],
  ['callAPIResolve', new Fundamental('ts', 'solid', 'helper')],
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
  ['createRouteUrl', new Fundamental('ts', 'solid', 'copy')],
  ['date2Epoch', new Fundamental('ts', 'solid', 'copy')],
  ['date2Iso', new Fundamental('ts', 'solid', 'copy')],
  ['dateFromInput', new Fundamental('ts', 'solid', 'copy')],
  ['dateLike2Date', new Fundamental('ts', 'solid', 'copy')],
  ['dateTimeFormat', new Fundamental('tsx', 'solid', 'copy')],
  ['destructureReady', new Fundamental('ts', 'solid', 'copy')],
  ['enums', new Fundamental('ts', 'solid', 'copy')],
  ['eventToPathname', new Fundamental('ts', 'solid', 'helper')],
  ['fadeInOnMount', new Fundamental('ts', 'solid', 'copy')],
  ['feComponent', new Fundamental('tsx', 'solid', 'copy')],
  ['feMessages', new Fundamental('ts', 'solid', 'helper')],
  ['getGoUrl', new Fundamental('ts', 'solid', 'copy')],
  ['getSearchParams', new Fundamental('ts', 'solid', 'helper')],
  ['getRequestEvent', new Fundamental('ts', 'solid', 'copy')],
  ['goResponse', new Fundamental('ts', 'solid', 'copy')],
  ['hashCreate', new Fundamental('ts', 'solid', 'copy')],
  ['hashValidate', new Fundamental('ts', 'solid', 'copy')],
  ['holdUp', new Fundamental('ts', 'solid', 'copy')],
  ['jwtCreate', new Fundamental('ts', 'solid', 'copy')],
  ['jwtValidate', new Fundamental('ts', 'solid', 'copy')],
  ['kParse', new Fundamental('ts', 'solid', 'copy')],
  ['layout', new Fundamental('ts', 'solid', 'copy')],
  ['load', new Fundamental('ts', 'solid', 'copy')],
  ['loading', new Fundamental('tsx', 'solid', 'copy')],
  ['loading.styles', new Fundamental('css', 'solid', 'copy')],
  ['lorem', new Fundamental('ts', 'solid', 'copy')],
  ['modal', new Fundamental('tsx', 'solid', 'copy')],
  ['modal.styles', new Fundamental('css', 'solid', 'copy')],
  ['messages', new Fundamental('tsx', 'solid', 'copy')],
  ['messagesCleanup', new Fundamental('tsx', 'solid', 'helper')],
  ['onAPIEvent', new Fundamental('ts', 'solid', 'copy')],
  ['parseResponse', new Fundamental('ts', 'solid', 'helper')],
  ['pathnameToMatch', new Fundamental('ts', 'solid', 'helper')],
  ['pathnameToPattern', new Fundamental('ts', 'solid', 'copy')],
  ['pick', new Fundamental('ts', 'solid', 'copy')],
  ['radioCards', new Fundamental('tsx', 'solid', 'copy')],
  ['radioCards.styles', new Fundamental('css', 'solid', 'copy')],
  ['randomArrayItem', new Fundamental('ts', 'solid', 'copy')],
  ['randomBetween', new Fundamental('ts', 'solid', 'copy')],
  ['reload', new Fundamental('ts', 'solid', 'copy')],
  ['resolveAlias', new Fundamental('ts', 'solid', 'helper')],
  ['route', new Fundamental('ts', 'solid', 'copy')],
  ['route404', new Fundamental('ts', 'solid', 'copy')],
  ['sendBrevoTemplate', new Fundamental('ts', 'brevo', 'copy')],
  ['scopeBE', new Fundamental('ts', 'solid', 'copy')],
  ['scopeComponent', new Fundamental('tsx', 'solid', 'copy')],
  ['scopeComponentChildren', new Fundamental('ts', 'solid', 'helper')],
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
  ['ttl', new Fundamental('ts', 'solid', 'copy')],
  ['tursoConnect', new Fundamental('ts', 'turso', 'copy')],
  ['types', new Fundamental('ts', 'solid', 'custom')],
  ['vBool', new Fundamental('ts', 'valibot', 'copy')],
  ['vDate', new Fundamental('ts', 'valibot', 'copy')],
  ['vEmail', new Fundamental('ts', 'valibot', 'copy')],
  ['vNum', new Fundamental('ts', 'valibot', 'copy')],
  ['vString', new Fundamental('ts', 'valibot', 'copy')],
  ['vParse', new Fundamental('ts', 'valibot', 'copy')],
  ['validateBody', new Fundamental('ts', 'solid', 'helper')],
  ['validateParams', new Fundamental('ts', 'solid', 'helper')],
  ['vars', new Fundamental('ts', 'solid', 'copy')],
  ['zParse', new Fundamental('ts', 'zod', 'copy')],
])
