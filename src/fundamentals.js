// @ts-check
// It is easiest for `fun build` to read js files, so that is why this is a js file


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
   * @param {'solid' | 'mongoose' | 'valibot'} pluginName - Name of plugin
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
  ['api', new Fundamental('ts', 'solid', 'copy')],
  ['apis', new Fundamental('ts', 'solid', 'copy')],
  ['app', new Fundamental('tsx', 'solid', 'custom')],
  ['animatedFor', new Fundamental('tsx', 'solid', 'copy')],
  ['be', new Fundamental('ts', 'solid', 'copy')],
  ['bits', new Fundamental('ts', 'solid', 'helper')],
  ['carousel', new Fundamental('tsx', 'solid', 'copy')],
  ['carousel.styles', new Fundamental('css', 'solid', 'copy')],
  ['createAPIFunction', new Fundamental('ts', 'solid', 'helper')],
  ['cuteLog', new Fundamental('ts', 'solid', 'copy')],
  ['beMessages', new Fundamental('ts', 'solid', 'helper')],
  ['buildURL', new Fundamental('ts', 'solid', 'helper')],
  ['clear', new Fundamental('ts', 'solid', 'copy')],
  ['createContextProvider', new Fundamental('tsx', 'solid', 'copy')],
  ['createOnSubmit', new Fundamental('ts', 'solid', 'copy')],
  ['dateTimeFormat', new Fundamental('tsx', 'solid', 'copy')],
  ['env', new Fundamental('ts', 'solid', 'custom')],
  ['eventToPathname', new Fundamental('ts', 'solid', 'helper')],
  ['fe', new Fundamental('ts', 'solid', 'copy')],
  ['feComponent', new Fundamental('tsx', 'solid', 'copy')],
  ['feFetch', new Fundamental('ts', 'solid', 'helper')],
  ['feMessages', new Fundamental('ts', 'solid', 'helper')],
  ['aceError', new Fundamental('ts', 'solid', 'helper')],
  ['getMiddleware', new Fundamental('ts', 'solid', 'copy')],
  ['go', new Fundamental('ts', 'solid', 'copy')],
  ['holdUp', new Fundamental('ts', 'solid', 'copy')],
  ['layout', new Fundamental('ts', 'solid', 'copy')],
  ['load', new Fundamental('ts', 'solid', 'copy')],
  ['loadSpin.styles', new Fundamental('css', 'solid', 'copy')],
  ['lorem', new Fundamental('ts', 'solid', 'copy')],
  ['messages', new Fundamental('tsx', 'solid', 'copy')],
  ['messagesCleanup', new Fundamental('tsx', 'solid', 'helper')],
  ['mongoConnect', new Fundamental('ts', 'mongoose', 'copy')],
  ['mongoModel', new Fundamental('ts', 'mongoose', 'copy')],
  ['onAPIEvent', new Fundamental('ts', 'solid', 'copy')],
  ['onMiddlewareRequest', new Fundamental('ts', 'solid', 'copy')],
  ['paramEnums', new Fundamental('ts', 'solid', 'copy')],
  ['parseNumber', new Fundamental('ts', 'solid', 'copy')],
  ['pathnameToMatch', new Fundamental('ts', 'solid', 'helper')],
  ['pathnameToPattern', new Fundamental('ts', 'solid', 'copy')],
  ['pick', new Fundamental('ts', 'solid', 'copy')],
  ['randomBetween', new Fundamental('ts', 'solid', 'copy')],
  ['route', new Fundamental('ts', 'solid', 'copy')],
  ['route404', new Fundamental('ts', 'solid', 'copy')],
  ['resolveAlias', new Fundamental('ts', 'solid', 'helper')],
  ['selectPlaceholder', new Fundamental('ts', 'solid', 'copy')],
  ['session', new Fundamental('ts', 'solid', 'copy')],
  ['shimmer.styles', new Fundamental('css', 'solid', 'copy')],
  ['submit', new Fundamental('tsx', 'solid', 'copy')],
  ['types', new Fundamental('ts', 'solid', 'custom')],
  ['url', new Fundamental('ts', 'solid', 'copy')],
  ['valibotSchema', new Fundamental('ts', 'valibot', 'copy')],
  ['vars', new Fundamental('ts', 'solid', 'copy')],
])
