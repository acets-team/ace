/**
 * - 🚨 Important:
 *     - `new Date(ms)`
 *     - `Date.now()` is now in `ms`
 *     - `Set-Cookie: name=value; Max-Age=seconds`
 *     - `const jwtPayload = { exp: seconds }`
 * 
 * - 🚨 Recommendation:
 *    - Store dates in db as `ms`, Turso Example: `integer('createdAt', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)`
 */



/** Number of ms in a second */
export const msSecond = 1000

/** Number of ms in a minute */
export const msMinute = msSecond * 60

/** Number of ms in an hour */
export const msHour = msMinute * 60

/** Number of ms in a day */
export const msDay = msHour * 24

/** Number of ms in a week */
export const msWeek = msDay * 7
