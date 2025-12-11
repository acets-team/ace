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



/** How many seconds in a second */
export const sec = 1

/** How many seconds in a minute */
export const secMinute = sec * 60

/** How many seconds in an hour */
export const secHour = secMinute * 60

/** How many seconds in a day */
export const secDay = secHour * 24

/** How many seconds in a week */
export const secWeek = secDay * 7
