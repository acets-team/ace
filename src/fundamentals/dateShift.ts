/**
 * ### From now, shift into the past or future, a certain amount of milliseconds
 * @example
  ```ts
  dateShift(msDay * 3) // 3 days in future
  dateShift(-msHour * 6) // 6 hours ago
  dateShift(-msCreate({ days: 1, hours: 3 })) // 1 day and 3 hours ago
  ```
 * @param ms - Amount of time in `ms` to shift into the past or future
 * @returns Date object of shifted time
 */
export const dateShift = (ms: number) => new Date(Date.now() + ms)
