/**
 * - 🚨 Important:
 *     - `new Date(ms)`
 *     - `Date.now()` is now in `ms`
 *     - `Set-Cookie: name=value; Max-Age=seconds`
 *     - `const jwtPayload = { exp: seconds }`
 * 
 * - 🚨 Recommendation:
 *    - Store dates in db as `ms`, example: `integer('expiration', { mode: 'timestamp_ms' }).notNull()`
 */



/** How many ms in a second */
export const msSecond = 1000

/** How many ms in a minute */
export const msMinute = msSecond * 60

/** How many ms in an hour */
export const msHour = msMinute * 60

/** How many ms in a day */
export const msDay = msHour * 24

/** How many ms in a week */
export const msWeek = msDay * 7
