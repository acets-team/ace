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



/** 1 second */
export const sec = 1

/** Number of seconds in a minute */
export const secMinute = sec * 60

/** Number of seconds in an hour */
export const secHour = secMinute * 60

/** Number of seconds in a day */
export const secDay = secHour * 24

/** Number of seconds in a week */
export const secWeek = secDay * 7
