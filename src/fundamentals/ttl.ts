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
export const ttlSecond = 1000

/** How many ms in a minute */
export const ttlMinute = ttlSecond * 60

/** How many ms in an hour */
export const ttlHour = ttlMinute * 60

/** How many ms in a day */
export const ttlDay = ttlHour * 24

/** How many ms in a week */
export const ttlWeek = ttlDay * 7



/**
 * @example
  ```ts
  const ttl = ttlDay * 3 // Three days

  const resCreateSession = await db().insert(sessions)
    .values({ userId, expiration: nowPlus(ttl) })
    .returning({ sessionId: sessions.id })
  ```
 * @param ttlMs - Amount of time in `ms` in the future
 * @returns Date object of future time
 */
export const nowPlus = (ttlMs: number) => new Date(Date.now() + ttlMs)
