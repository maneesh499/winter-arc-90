import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz'
import {
  format,
  parseISO,
  differenceInCalendarDays,
  addDays,
  isBefore,
  isAfter,
  isEqual,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns'

export const TIMEZONE = 'Asia/Kolkata'
export const PROGRAM_START_STR = '2026-10-01'
export const PROGRAM_END_STR = '2026-12-29'
export const PROGRAM_DAYS = 90

// Get current date in IST
export function getNowIST(): Date {
  return toZonedTime(new Date(), TIMEZONE)
}

// Get today's date string in IST (YYYY-MM-DD)
export function getTodayIST(): string {
  const now = getNowIST()
  return format(now, 'yyyy-MM-dd')
}

// Parse a YYYY-MM-DD string as a local date (no UTC shift)
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Get program start/end as local dates
export function getProgramStart(): Date {
  return parseLocalDate(PROGRAM_START_STR)
}

export function getProgramEnd(): Date {
  return parseLocalDate(PROGRAM_END_STR)
}

// Get day number for a given date (1–90, or null if outside program)
export function getDayNumber(dateStr: string): number | null {
  const date = parseLocalDate(dateStr)
  const start = getProgramStart()
  const end = getProgramEnd()

  if (isBefore(date, start) || isAfter(date, end)) return null

  const diff = differenceInCalendarDays(date, start)
  return diff + 1
}

// Get day number for today
export function getTodayDayNumber(): number | null {
  return getDayNumber(getTodayIST())
}

// Get program status
export type ProgramStatus = 'before' | 'active' | 'completed'

export function getProgramStatus(): ProgramStatus {
  const today = parseLocalDate(getTodayIST())
  const start = getProgramStart()
  const end = getProgramEnd()

  if (isBefore(today, start)) return 'before'
  if (isAfter(today, end)) return 'completed'
  return 'active'
}

// Days remaining
export function getDaysRemaining(): number {
  const today = parseLocalDate(getTodayIST())
  const end = getProgramEnd()
  const diff = differenceInCalendarDays(end, today)
  return Math.max(0, diff)
}

// Days until program starts
export function getDaysUntilStart(): number {
  const today = parseLocalDate(getTodayIST())
  const start = getProgramStart()
  const diff = differenceInCalendarDays(start, today)
  return Math.max(0, diff)
}

// Get all program dates
export function getAllProgramDates(): string[] {
  const start = getProgramStart()
  const end = getProgramEnd()
  const days = eachDayOfInterval({ start, end })
  return days.map((d) => format(d, 'yyyy-MM-dd'))
}

// Format date for display
export function formatDate(dateStr: string, fmt = 'MMM d, yyyy'): string {
  return format(parseLocalDate(dateStr), fmt)
}

// Format time string (HH:MM) for display
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`
}

// Check if wake time is on target, close, or late
export function getWakeStatus(
  wakeTime: string,
  targetTime: string
): 'on_target' | 'close' | 'late' {
  const [wH, wM] = wakeTime.split(':').map(Number)
  const [tH, tM] = targetTime.split(':').map(Number)
  const wakeMinutes = wH * 60 + wM
  const targetMinutes = tH * 60 + tM
  const diff = wakeMinutes - targetMinutes

  if (diff <= 15) return 'on_target'
  if (diff <= 45) return 'close'
  return 'late'
}

// Get week dates (Monday–Sunday) for a given date
export function getWeekDates(dateStr: string): string[] {
  const date = parseLocalDate(dateStr)
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'))
}

// Get month dates
export function getMonthDates(year: number, month: number): string[] {
  const start = new Date(year, month - 1, 1)
  const end = endOfMonth(start)
  return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'))
}

// Check if date is today
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayIST()
}

// Check if date is in the past
export function isPast(dateStr: string): boolean {
  const date = parseLocalDate(dateStr)
  const today = parseLocalDate(getTodayIST())
  return isBefore(date, today)
}

// Get month name
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return months[month - 1]
}

// Get day of week name
export function getDayOfWeek(dateStr: string): string {
  return format(parseLocalDate(dateStr), 'EEEE')
}

// Format relative date
export function formatRelative(dateStr: string): string {
  const today = getTodayIST()
  if (dateStr === today) return 'Today'
  const yesterday = format(addDays(parseLocalDate(today), -1), 'yyyy-MM-dd')
  if (dateStr === yesterday) return 'Yesterday'
  return formatDate(dateStr, 'MMM d')
}

// Calculate streak for an array of sorted date strings (ascending)
export function calculateStreak(
  dates: string[],
  status: string[] // array of dates where habit was successful
): { current: number; best: number } {
  if (dates.length === 0) return { current: 0, best: 0 }

  const successSet = new Set(status) // treated as dates
  let current = 0
  let best = 0
  let streak = 0

  // Sort dates descending to calculate current streak
  const allDates = [...dates].sort().reverse()
  const today = getTodayIST()

  // Current streak: count back from today
  for (let i = 0; i < allDates.length; i++) {
    const expected = format(
      addDays(parseLocalDate(today), -i),
      'yyyy-MM-dd'
    )
    if (successSet.has(expected)) {
      current++
    } else {
      break
    }
  }

  // Best streak: scan all dates ascending
  const sorted = [...dates].sort()
  for (let i = 0; i < sorted.length; i++) {
    if (successSet.has(sorted[i])) {
      streak++
      best = Math.max(best, streak)
    } else {
      streak = 0
    }
  }

  return { current, best }
}

// Get program month number (1 = October, 2 = November, 3 = December)
export function getProgramMonth(dateStr: string): number | null {
  const dayNum = getDayNumber(dateStr)
  if (!dayNum) return null
  if (dayNum <= 31) return 1
  if (dayNum <= 61) return 2
  return 3
}

// Get program month name for program month number
export function getProgramMonthName(month: number): string {
  return ['October', 'November', 'December'][month - 1] || ''
}

/**
 * Get IST-safe current month bounds.
 * Returns { monthStart: 'YYYY-MM-01', monthEnd: 'YYYY-MM-DD' } in IST.
 * Use this instead of new Date().toISOString() which gives UTC date.
 */
export function getISTMonthBounds(): { monthStart: string; monthEnd: string } {
  const now = getNowIST()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-indexed
  const monthStart = format(new Date(year, month, 1), 'yyyy-MM-dd')
  // Last day of current month
  const lastDay = new Date(year, month + 1, 0).getDate()
  const monthEnd = format(new Date(year, month, lastDay), 'yyyy-MM-dd')
  return { monthStart, monthEnd }
}

/**
 * Get IST-safe date string N days ago.
 * Use this instead of new Date().toISOString() which gives UTC date.
 */
export function getISTDateNDaysAgo(n: number): string {
  const now = getNowIST()
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - n)
  return format(date, 'yyyy-MM-dd')
}

/**
 * Get IST-safe current month as 'YYYY-MM' string.
 */
export function getISTCurrentMonth(): string {
  const now = getNowIST()
  return format(now, 'yyyy-MM')
}
