/**
 * 🧚‍♀️ How to access:
 *     import { cuteLog, cuteString } from '@ace/cuteLog'
 *     import type { StyleOptions } from '@ace/cuteLog'
 */



/**
 * ### Style and log terminal output ✨
 *
 * @example
 * ```ts
 * cuteLog('❤️ Aloha!', 'cyan', 'bold')
 * ```
 */
export function cuteLog(text: string, ...styles: StyleOptions[]): void {
  console.log(cuteString(text, ...styles))
}



/**
 * ### Returns a cute string that is ready to be grouped & logged!
 * 
 * @example
 * ```ts
 * console.log(`${cuteString('Warning:', 'yellow')} ... ${cuteString('🥳 Party Time!', 'italic')}`)
 * console.error(cuteString(`🔔 Node 22+, not ${process.version}`, 'red', 'bold', 'underline'))
 * ```
 */
export function cuteString(text: string, ...styles: StyleOptions[]): string {
  const prefix = styles.map(s => `${ESC}${styleOptions[s]}`).join('')
  return `${prefix}${text}${RESET}`
}


/**
 * Supported style keys and their raw ANSI codes
 */
const styleOptions = {
  // modifiers
  bold:         '[1m',
  dim:          '[2m',
  italic:       '[3m',
  underline:    '[4m',
  strikethrough:'[9m',

  // standard colors
  black:        '[30m',
  red:          '[31m',
  green:        '[32m',
  yellow:       '[33m',
  blue:         '[34m',
  magenta:      '[35m',
  cyan:         '[36m',
  white:        '[37m',

  // backgrounds
  blackBG:      '[40m',
  redBG:        '[41m',
  greenBG:      '[42m',
  yellowBG:     '[43m',
  blueBG:       '[44m',
  magentaBG:    '[45m',
  cyanBG:       '[46m',
  whiteBG:      '[47m',
} as const

const ESC   = '\x1b'

const RESET = `${ESC}[0m`

export type StyleOptions = keyof typeof styleOptions
