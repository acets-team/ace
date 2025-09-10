/**
 * 🧚‍♀️ How to access:
 *     - import { dateRelative, defaultDateRelativeOptions, defaultDateRelativeWords } from '@ace/dateRelative'
 *     - import type { DateRelativeOptions, DateRelativeWords } from '@ace/dateRelative'
 */



import type { DateLike } from './types'
import { dateLike2Date } from './dateLike2Date'



const defaultDateRelativeOptions: DateRelativeOptions = {
  natural: true,
  specificity: 'minutes',
  long: true,
  includeComma: true,
  includeAnd: true,
}


const defaultDateRelativeWords = {
  justNow: 'just now', yesterday: 'yesterday', tomorrow: 'tomorrow', ago: 'ago', in: 'in', and: 'and',
  second: 'second', seconds: 'seconds', minute: 'minute', minutes: 'minutes', hour: 'hour', hours: 'hours', day: 'day', days: 'days',
  week: 'week', weeks: 'weeks', month: 'month', months: 'months', year: 'year', years: 'years',
  shortSecond: 's', shortHour: 'h', shortMinute: 'm', shortDay: 'd', shortWeek: 'w', shortMonth: 'mo', shortYear: 'y',
}


/**
 * ### Show date relative to now `in 3 years, 6 months, and 9 days`
 * @param params.date - Optional, if `falsy` an empty string is returned
 * @param params.options.natural - Optional, defaults to `true`, include words like tomorrow or yesterday
 * @param params.options.specificity - Optional, defaults to `true`, most granular specificity
 * @param params.options.long - Optional, defaults to `true`, long or short words
 * @param params.options.includeComma - Optional, defaults to `true`, include comma(s) in oputput
 * @param params.options.includeAnd - Optional, defaults to `true`, include `and` in oputput
 * @param params.words Optional, defaults to `defaultDateRelativeOptions`, can overwrite some and rest of defaults still apply
 * @returns `1 year, 1 month, and 1 day ago`
 */
export function dateRelative({ date, options = defaultDateRelativeOptions, words = defaultDateRelativeWords }: { date?: DateLike, options?: DateRelativeOptions, words?: DateRelativeWords }): string {
  if (!date) return ''

  const o = { ...defaultDateRelativeOptions, ...options } // override passed in w/ defaults

  const w = { ...defaultDateRelativeWords, ...words }

  const d = dateLike2Date(date)

  const now = new Date()

  const diffMs = d.getTime() - now.getTime()

  // signed rounded units (keeps existing behavior)
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr  = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHr / 24)

  // absolute values for threshold checks
  const absSec = Math.abs(diffSec)
  const absMin = Math.abs(diffMin)
  const absHr  = Math.abs(diffHr)
  const absDay = Math.abs(diffDay)

  const future = diffMs > 0
  let parts: string[] = []

  // natural shortcuts (preserve original ordering & behavior)
  if (o.natural && o.long) {
    if (absSec < 5) return w.justNow
    if (diffDay === -1) return w.yesterday
    if (diffDay === 1) return w.tomorrow
  }

  // unified helper to push a unit only when non-zero (long/short)
  const pushUnit = (value: number, singular: string, plural: string, shortLabel: string) => {
    if (value === 0) return
    if (o.long) {
      parts.push(`${Math.abs(value)} ${Math.abs(value) === 1 ? singular : plural}`)
    } else {
      parts.push(`${Math.abs(value)}${shortLabel}`)
    }
  }

  // join parts with optional commas, Oxford comma when includeComma=true and 3+ items,
  // and 'and' (from words map) inserted before the last item when 2+ items.
  const joinParts = (list: string[]): string => {
    if (list.length === 0) return ''
    if (list.length === 1) return (list[0] as string)

    const last = list[list.length - 1]
    if (list.length === 2) {
      return `${list[0]} ${w.and} ${last}`
    }

    // 3 or more items
    if (o.includeComma) {
      // use comma separators and Oxford comma before 'and'
      const firstPart = list.slice(0, -1).join(', ')
      return `${firstPart}, ${w.and} ${last}`
    } else {
      // no commas, separate earlier items with space
      const firstPart = list.slice(0, -1).join(' ')
      return `${firstPart} ${w.and} ${last}`
    }
  }

  const formatAndReturn = () => {
    const joined = joinParts(parts)
    if (o.long) {
      return (future ? w.in + ' ' : '') + (joined || w.justNow) + (future ? '' : (joined ? ' ' + w.ago : ''))
    } else {
      return (joined || w.justNow) + (future ? '' : ` ${w.ago}`)
    }
  }

  // compute calendar months difference (signed)
  const monthDiff = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth())

  // If the caller forced a specificity, honor it first (matching original behavior)
  if (o.specificity === 'months') {
    pushUnit(monthDiff, w.month, w.months, w.shortMonth)
    return formatAndReturn()
  }

  if (o.specificity === 'weeks') {
    const weekCount = Math.round(diffDay / 7)
    pushUnit(weekCount, w.week, w.weeks, w.shortWeek)
    return formatAndReturn()
  }

  // Special: if specificity === 'days' and it's >= 1 year, show breakdown years + months + days
  if (o.specificity === 'days') {
    if (absDay >= 365) {
      // Use monthDiff to get calendar-accurate years/months, then compute leftover days precisely
      const totalMonths = monthDiff // signed
      const years = Math.trunc(totalMonths / 12) // signed
      const months = totalMonths - (years * 12) // signed remainder months

      // build temp date by adding years + months to `now` to compute leftover days
      const temp = new Date(now.getTime())
      temp.setMonth(temp.getMonth() + years * 12 + months) // equivalent to adding monthDiff total

      const msPerDay = 1000 * 60 * 60 * 24
      const leftoverDaysSigned = Math.round((d.getTime() - temp.getTime()) / msPerDay)

      parts = []
      // push years, months, days — pushUnit omits zero values automatically
      pushUnit(years, w.year, w.years, w.shortYear)
      pushUnit(months, w.month, w.months, w.shortMonth)
      pushUnit(leftoverDaysSigned, w.day, w.days, w.shortDay)

      return formatAndReturn()
    }

    // otherwise, keep original behavior (single days)
    pushUnit(diffDay, w.day, w.days, w.shortDay)
    return formatAndReturn()
  }

  if (o.specificity === 'hours' || absHr >= 1) {
    pushUnit(diffHr % 24, w.hour, w.hours, w.shortHour)
    if (o.specificity === 'hours') return formatAndReturn()
  }

  if (o.specificity === 'minutes' || absMin >= 1) {
    pushUnit(diffMin % 60, w.minute, w.minutes, w.shortMinute)
    if (o.specificity === 'minutes') return formatAndReturn()
  }

  if (o.specificity === 'seconds' || absSec >= 1) {
    pushUnit(diffSec % 60, w.second, w.seconds, w.shortSecond)
    if (o.specificity === 'seconds') return formatAndReturn()
  }

  // Automatic hierarchy (when specificity wasn't forced):
  // months (if calendar month changed) -> weeks (>=7 days) -> days -> hours/minutes/seconds
  // But if monthDiff indicates >= 12 months, show years + months + days.
  if (monthDiff !== 0) {
    // If >= 12 months, show years+months+(days leftover)
    if (Math.abs(monthDiff) >= 12) {
      const totalMonths = monthDiff
      const years = Math.trunc(totalMonths / 12)
      const months = totalMonths - (years * 12)

      const temp = new Date(now.getTime())
      temp.setMonth(temp.getMonth() + years * 12 + months)

      const msPerDay = 1000 * 60 * 60 * 24
      const leftoverDaysSigned = Math.round((d.getTime() - temp.getTime()) / msPerDay)

      parts = []
      pushUnit(years, w.year, w.years, w.shortYear)
      pushUnit(months, w.month, w.months, w.shortMonth)
      pushUnit(leftoverDaysSigned, w.day, w.days, w.shortDay)
      return formatAndReturn()
    }

    // otherwise show months (same as before, but with leftover days)
    const months = monthDiff
    const temp = new Date(now.getTime())
    temp.setMonth(temp.getMonth() + months)
    const msPerDay = 1000 * 60 * 60 * 24
    const leftoverDaysSigned = Math.round((d.getTime() - temp.getTime()) / msPerDay)

    parts = []
    pushUnit(months, w.month, w.months, w.shortMonth)
    pushUnit(leftoverDaysSigned, w.day, w.days, w.shortDay)
    return formatAndReturn()
  }

  if (absDay >= 7) {
    parts = []
    const weekCount = Math.round(diffDay / 7)
    pushUnit(weekCount, w.week, w.weeks, w.shortWeek)
    return formatAndReturn()
  }

  if (absDay >= 1) {
    parts = []
    pushUnit(diffDay, w.day, w.days, w.shortDay)
    return formatAndReturn()
  }

  if (absHr >= 1) {
    parts = []
    pushUnit(diffHr % 24, w.hour, w.hours, w.shortHour)
    return formatAndReturn()
  }

  if (absMin >= 1) {
    parts = []
    pushUnit(diffMin % 60, w.minute, w.minutes, w.shortMinute)
    return formatAndReturn()
  }

  if (absSec >= 1) {
    parts = []
    pushUnit(diffSec % 60, w.second, w.seconds, w.shortSecond)
    return formatAndReturn()
  }

  return w.justNow
}


type DateRelativeOptions = {
  /** Optional, defaults to `true`, include words like tomorrow or yesterday */
  natural?: boolean
  /** Optional, defaults to `true`, most granular specificity */
  specificity?: 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds'
  /** Optional, defaults to `true`, long or short words */
  long?: boolean
  /** Optional, defaults to `true`, include comma(s) in oputput */
  includeComma?: boolean
  /** Optional, defaults to `true`, include `and` in oputput */
  includeAnd?: boolean
}


type DateRelativeWords = typeof defaultDateRelativeWords
