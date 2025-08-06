/** How many seconds in a minute */
export const ttlMinute = 60

/** How many seconds in an hour */
export const ttlHour = 60 * ttlMinute

/** How many seconds in a day */
export const ttlDay = 24 * ttlHour

/** How many seconds in a week */
export const ttlWeek = 7 * ttlDay

/**
 * @example
  ```ts
  const ttl = ttlDay * 3 // Three days

  const resCreateSession = await db().insert(sessions)
    .values({ userId, expiration: nowPlus(ttl) })
    .returning({ sessionId: sessions.id })
  ```
 * @param ttl - Amount of time in seconds in the future
 * @returns Date object of future time
 */
export const nowPlus = (ttl: number) => new Date(Date.now() + ttl * 1000)
