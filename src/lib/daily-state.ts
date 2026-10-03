/**
 * DailyStateService — Winter Arc 90
 *
 * THE SINGLE SOURCE OF TRUTH for any given day's state.
 *
 * Architecture:
 *   1. Program Configuration (what is scheduled today)
 *   2. User Logs (what was actually recorded)
 *   3. Merge → DailyState (combined, never hides unlogged items)
 *   4. Score Engine (derived from DailyState)
 *   5. Attention Engine (derived from DailyState)
 *
 * KEY RULE: A missing database record = NOT LOGGED, never "hide the activity".
 */

import { getDayNumber, getTodayIST } from '@/lib/dates'

// ─── Activity Status ────────────────────────────────────────────────────────

export type ActivityStatus =
  | 'not_logged'    // user has not entered a status
  | 'completed'     // user explicitly completed it
  | 'partial'       // user partially completed it
  | 'missed'        // user explicitly said they missed it
  | 'recovery'      // intentional recovery
  | 'skipped'       // intentionally skipped optional
  | 'not_applicable' // not scheduled today

// Map HabitLog status → ActivityStatus
export function habitStatusToActivityStatus(
  s: 'kept' | 'failed' | 'partial' | 'skipped' | 'recovery' | null | undefined
): ActivityStatus {
  if (!s) return 'not_logged'
  switch (s) {
    case 'kept': return 'completed'
    case 'failed': return 'missed'
    case 'partial': return 'partial'
    case 'recovery': return 'recovery'
    case 'skipped': return 'skipped'
    default: return 'not_logged'
  }
}

// Map GymLog status → ActivityStatus
export function gymStatusToActivityStatus(
  s: 'completed' | 'missed' | 'recovery' | null | undefined
): ActivityStatus {
  if (!s) return 'not_logged'
  switch (s) {
    case 'completed': return 'completed'
    case 'missed': return 'missed'
    case 'recovery': return 'recovery'
    default: return 'not_logged'
  }
}

// ─── DailyState types ───────────────────────────────────────────────────────

export interface HabitState {
  id: string
  name: string
  description: string | null
  category: string
  type: string
  targetValue: number | null
  unit: string | null
  isOptional: boolean
  weight: number
  sortOrder: number
  status: ActivityStatus
  value: number | null
  notes: string | null
  logId: string | null
}

export interface WaterState {
  totalMl: number
  targetMl: number
  percentage: number
  status: ActivityStatus
  logs: Array<{ id: string; amount_ml: number; logged_at: string }>
}

export interface GymState {
  status: ActivityStatus
  workoutType: string | null
  durationMinutes: number | null
  notes: string | null
  logId: string | null
}

export interface SleepState {
  status: ActivityStatus
  bedtime: string | null
  wakeTime: string | null
  durationMinutes: number | null
  quality: number | null
  targetHours: number
  notes: string | null
  logId: string | null
}

export interface CareerState {
  totalMinutes: number
  targetMinutes: number
  percentage: number
  status: ActivityStatus
  sessions: Array<{ id: string; topic: string; minutes: number; date: string; notes: string | null }>
}

export interface EnglishState {
  totalMinutes: number
  targetMinutes: number
  percentage: number
  status: ActivityStatus
  sessions: Array<{ id: string; activity_type: string; minutes: number; date: string; notes: string | null }>
}

export interface ReadingState {
  pagesRead: number
  targetPages: number
  percentage: number
  status: ActivityStatus
  sessions: Array<{ id: string; pages_read: number; date: string; book_id: string }>
}

export interface RapidoState {
  logged: boolean
  grossEarnings: number
  fuelCost: number
  netEarnings: number
  hours: number
  rides: number
  entryId: string | null
}

export interface ExpensesState {
  totalAmount: number
  entries: Array<{ id: string; category: string; amount: number; description: string | null }>
}

export interface WakeState {
  status: ActivityStatus
  wakeTime: string | null
  targetTime: string
  statusLabel: string | null
  logId: string | null
}

export interface DailyReviewState {
  status: ActivityStatus
  wentWell: string | null
  distractedBy: string | null
  improveTomorrow: string | null
  tomorrowPriority: string | null
  mood: number | null
  energy: number | null
  logId: string | null
}

export interface DailyScore {
  total: number
  discipline: number
  health: number
  career: number
  english: number
  creative: number
  productivity: number
  completedActivities: number
  totalActivities: number
  pendingActivities: number
  missedActivities: number
}

export type AttentionLevel = 'high' | 'medium' | 'info' | 'complete'

export interface AttentionItem {
  id: string
  level: AttentionLevel
  title: string
  description: string
  action: string
  href: string
}

export interface DailyState {
  date: string
  programDay: number | null
  isToday: boolean
  isBeforeProgram: boolean
  isAfterProgram: boolean
  dataStatus: 'loading' | 'loaded' | 'error'
  errorMessage: string | null
  habits: HabitState[]
  water: WaterState
  gym: GymState
  sleep: SleepState
  career: CareerState
  english: EnglishState
  reading: ReadingState
  rapido: RapidoState
  expenses: ExpensesState
  wake: WakeState
  review: DailyReviewState
  score: DailyScore
  attention: AttentionItem[]
  nextAction: AttentionItem | null
}

// ─── Program defaults ─────────────────────────────────────────────────────────

export const CAREER_TARGET_MINUTES = 90
export const ENGLISH_TARGET_MINUTES = 20
export const READING_TARGET_PAGES = 3
export const WATER_TARGET_ML = 2500
export const SLEEP_TARGET_HOURS = 7

// ─── Merge habits with logs ──────────────────────────────────────────────────

export function mergeHabitsWithLogs(
  habits: Array<{
    id: string
    name: string
    description: string | null
    category: string
    type: string
    target_value: number | null
    unit: string | null
    is_optional: boolean
    weight: number
    sort_order: number
  }>,
  logs: Array<{
    id: string
    habit_id: string
    status: 'kept' | 'failed' | 'partial' | 'skipped' | 'recovery'
    value: number | null
    notes: string | null
  }>
): HabitState[] {
  const logMap = new Map(logs.map((l) => [l.habit_id, l]))
  return habits.map((habit) => {
    const log = logMap.get(habit.id) ?? null
    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      type: habit.type,
      targetValue: habit.target_value,
      unit: habit.unit,
      isOptional: habit.is_optional,
      weight: habit.weight,
      sortOrder: habit.sort_order,
      status: habitStatusToActivityStatus(log?.status),
      value: log?.value ?? null,
      notes: log?.notes ?? null,
      logId: log?.id ?? null,
    }
  })
}

// ─── Build WaterState ────────────────────────────────────────────────────────

export function buildWaterState(
  logs: Array<{ id: string; amount_ml: number; logged_at: string }>,
  targetMl: number
): WaterState {
  const totalMl = logs.reduce((s, l) => s + l.amount_ml, 0)
  const percentage = targetMl > 0 ? Math.min(100, Math.round((totalMl / targetMl) * 100)) : 0
  let status: ActivityStatus = 'not_logged'
  if (totalMl >= targetMl) status = 'completed'
  else if (totalMl > 0) status = 'partial'
  return { totalMl, targetMl, percentage, status, logs }
}

// ─── Build GymState ──────────────────────────────────────────────────────────

export function buildGymState(
  log: { id: string; status: 'completed' | 'missed' | 'recovery'; workout_type: string | null; duration_minutes: number | null; notes: string | null } | null
): GymState {
  if (!log) return { status: 'not_logged', workoutType: null, durationMinutes: null, notes: null, logId: null }
  return {
    status: gymStatusToActivityStatus(log.status),
    workoutType: log.workout_type,
    durationMinutes: log.duration_minutes,
    notes: log.notes,
    logId: log.id,
  }
}

// ─── Build SleepState ────────────────────────────────────────────────────────

export function buildSleepState(
  log: { id: string; bedtime: string | null; wake_time: string | null; quality: number | null; notes: string | null } | null,
  targetHours = SLEEP_TARGET_HOURS
): SleepState {
  if (!log) return { status: 'not_logged', bedtime: null, wakeTime: null, durationMinutes: null, quality: null, targetHours, notes: null, logId: null }
  let durationMinutes: number | null = null
  if (log.bedtime && log.wake_time) {
    const [bH, bM] = log.bedtime.split(':').map(Number)
    const [wH, wM] = log.wake_time.split(':').map(Number)
    let bedMins = bH * 60 + bM
    let wakeMins = wH * 60 + wM
    if (wakeMins <= bedMins) wakeMins += 24 * 60
    durationMinutes = wakeMins - bedMins
  }
  const targetMins = targetHours * 60
  const status: ActivityStatus = durationMinutes != null
    ? durationMinutes >= targetMins ? 'completed' : 'partial'
    : 'partial'
  return { status, bedtime: log.bedtime, wakeTime: log.wake_time, durationMinutes, quality: log.quality, targetHours, notes: log.notes, logId: log.id }
}

// ─── Build CareerState ───────────────────────────────────────────────────────

export function buildCareerState(
  sessions: Array<{ id: string; topic: string; minutes: number; date: string; notes: string | null }>,
  targetMinutes = CAREER_TARGET_MINUTES
): CareerState {
  const totalMinutes = sessions.reduce((s, sess) => s + sess.minutes, 0)
  const percentage = targetMinutes > 0 ? Math.min(100, Math.round((totalMinutes / targetMinutes) * 100)) : 0
  let status: ActivityStatus = 'not_logged'
  if (totalMinutes >= targetMinutes) status = 'completed'
  else if (totalMinutes > 0) status = 'partial'
  return { totalMinutes, targetMinutes, percentage, status, sessions }
}

// ─── Build EnglishState ──────────────────────────────────────────────────────

export function buildEnglishState(
  sessions: Array<{ id: string; activity_type: string; minutes: number; date: string; notes: string | null }>,
  targetMinutes = ENGLISH_TARGET_MINUTES
): EnglishState {
  const totalMinutes = sessions.reduce((s, sess) => s + sess.minutes, 0)
  const percentage = targetMinutes > 0 ? Math.min(100, Math.round((totalMinutes / targetMinutes) * 100)) : 0
  let status: ActivityStatus = 'not_logged'
  if (totalMinutes >= targetMinutes) status = 'completed'
  else if (totalMinutes > 0) status = 'partial'
  return { totalMinutes, targetMinutes, percentage, status, sessions }
}

// ─── Build ReadingState ──────────────────────────────────────────────────────

export function buildReadingState(
  sessions: Array<{ id: string; pages_read: number; date: string; book_id: string }>,
  targetPages = READING_TARGET_PAGES
): ReadingState {
  const pagesRead = sessions.reduce((s, sess) => s + sess.pages_read, 0)
  const percentage = targetPages > 0 ? Math.min(100, Math.round((pagesRead / targetPages) * 100)) : 0
  let status: ActivityStatus = 'not_logged'
  if (pagesRead >= targetPages) status = 'completed'
  else if (pagesRead > 0) status = 'partial'
  return { pagesRead, targetPages, percentage, status, sessions }
}

// ─── Build WakeState ─────────────────────────────────────────────────────────

export function buildWakeState(
  log: { id: string; wake_time: string; status: string } | null,
  targetTime = '06:00'
): WakeState {
  if (!log) return { status: 'not_logged', wakeTime: null, targetTime, statusLabel: null, logId: null }
  return { status: 'completed', wakeTime: log.wake_time, targetTime, statusLabel: log.status, logId: log.id }
}

// ─── Build RapidoState ───────────────────────────────────────────────────────

export function buildRapidoState(
  entry: { id: string; gross_earnings: number; fuel_cost: number; net_earnings: number; hours: number; rides: number } | null
): RapidoState {
  if (!entry) return { logged: false, grossEarnings: 0, fuelCost: 0, netEarnings: 0, hours: 0, rides: 0, entryId: null }
  return { logged: true, grossEarnings: entry.gross_earnings, fuelCost: entry.fuel_cost, netEarnings: entry.net_earnings, hours: entry.hours, rides: entry.rides, entryId: entry.id }
}

// ─── Build DailyReviewState ───────────────────────────────────────────────────

export function buildReviewState(
  log: { id: string; went_well: string | null; distracted_by: string | null; improve_tomorrow: string | null; tomorrow_priority: string | null; mood: number | null; energy: number | null } | null
): DailyReviewState {
  if (!log) return { status: 'not_logged', wentWell: null, distractedBy: null, improveTomorrow: null, tomorrowPriority: null, mood: null, energy: null, logId: null }
  const hasContent = !!(log.went_well || log.distracted_by || log.improve_tomorrow)
  return {
    status: hasContent ? 'completed' : 'partial',
    wentWell: log.went_well,
    distractedBy: log.distracted_by,
    improveTomorrow: log.improve_tomorrow,
    tomorrowPriority: log.tomorrow_priority,
    mood: log.mood,
    energy: log.energy,
    logId: log.id,
  }
}

// ─── Score Engine ────────────────────────────────────────────────────────────

function statusScore(status: ActivityStatus, value?: number | null, target?: number | null): number {
  switch (status) {
    case 'completed': return 100
    case 'recovery': return 65
    case 'partial':
      if (value != null && target != null && target > 0) return Math.min(95, Math.round((value / target) * 100))
      return 50
    case 'missed': return 0
    case 'skipped': return 0
    case 'not_logged': return 0
    case 'not_applicable': return 100
    default: return 0
  }
}

export function calculateDailyScore(
  habits: HabitState[],
  career: CareerState,
  english: EnglishState,
  gym: GymState,
  water: WaterState,
  reading: ReadingState
): DailyScore {
  const WEIGHTS = { discipline: 20, health: 20, career: 25, english: 10, creative: 5, productivity: 15 }
  const totalWeight = Object.values(WEIGHTS).reduce((s, v) => s + v, 0)

  const disciplineHabits = habits.filter(h => h.category === 'discipline' && !h.isOptional)
  const disciplineScore = disciplineHabits.length > 0
    ? Math.round(disciplineHabits.reduce((sum, h) => sum + statusScore(h.status, h.value, h.targetValue), 0) / disciplineHabits.length)
    : 0

  const healthHabits = habits.filter(h => h.category === 'health' && !h.isOptional)
  const gymScore = statusScore(gym.status)
  const waterScore = water.totalMl >= water.targetMl ? 100 : water.totalMl > 0 ? Math.round((water.totalMl / water.targetMl) * 100) : 0
  const readingScore = reading.pagesRead >= reading.targetPages ? 100 : reading.pagesRead > 0 ? Math.round((reading.pagesRead / reading.targetPages) * 100) : 0
  const habitHealthScore = healthHabits.length > 0
    ? Math.round(healthHabits.reduce((sum, h) => sum + statusScore(h.status), 0) / healthHabits.length)
    : 0
  const healthScore = Math.round(gymScore * 0.35 + waterScore * 0.25 + readingScore * 0.2 + habitHealthScore * 0.2)

  const careerScore = career.totalMinutes >= career.targetMinutes ? 100
    : career.totalMinutes > 0 ? Math.min(95, Math.round((career.totalMinutes / career.targetMinutes) * 100)) : 0

  const englishScore = english.totalMinutes >= english.targetMinutes ? 100
    : english.totalMinutes > 0 ? Math.min(95, Math.round((english.totalMinutes / english.targetMinutes) * 100)) : 0

  const creativeHabits = habits.filter(h => h.category === 'creative' && !h.isOptional)
  const creativeScore = creativeHabits.length > 0
    ? Math.round(creativeHabits.reduce((sum, h) => sum + statusScore(h.status, h.value, h.targetValue), 0) / creativeHabits.length)
    : 0

  const productivityHabits = habits.filter(h => h.category === 'productivity' && !h.isOptional)
  const productivityScore = productivityHabits.length > 0
    ? Math.round(productivityHabits.reduce((sum, h) => sum + statusScore(h.status), 0) / productivityHabits.length)
    : 0

  const total = Math.round(
    (disciplineScore * WEIGHTS.discipline +
     healthScore * WEIGHTS.health +
     careerScore * WEIGHTS.career +
     englishScore * WEIGHTS.english +
     creativeScore * WEIGHTS.creative +
     productivityScore * WEIGHTS.productivity) / totalWeight
  )

  const allMandatory = [
    ...habits.filter(h => !h.isOptional),
    { status: gym.status },
    { status: water.status },
    { status: career.status },
    { status: english.status },
    { status: reading.status },
  ]

  return {
    total: Math.min(100, Math.max(0, total)),
    discipline: disciplineScore,
    health: healthScore,
    career: careerScore,
    english: englishScore,
    creative: creativeScore,
    productivity: productivityScore,
    completedActivities: allMandatory.filter(a => a.status === 'completed' || a.status === 'recovery').length,
    totalActivities: allMandatory.length,
    pendingActivities: allMandatory.filter(a => a.status === 'not_logged' || a.status === 'partial').length,
    missedActivities: allMandatory.filter(a => a.status === 'missed').length,
  }
}

// ─── Attention Engine ────────────────────────────────────────────────────────

export function buildAttentionItems(
  habits: HabitState[],
  career: CareerState,
  english: EnglishState,
  gym: GymState,
  water: WaterState,
  reading: ReadingState,
  sleep: SleepState,
  review: DailyReviewState,
  currentHourIST: number
): AttentionItem[] {
  const items: AttentionItem[] = []

  // Gym
  if (gym.status === 'missed') {
    items.push({ id: 'gym', level: 'high', title: 'Gym', description: 'Marked as missed', action: 'Update', href: '/dashboard/health' })
  } else if (gym.status === 'not_logged') {
    items.push({ id: 'gym', level: currentHourIST > 18 ? 'high' : 'medium', title: 'Gym', description: 'Not logged today', action: 'Log Gym', href: '/dashboard/health' })
  } else {
    items.push({ id: 'gym', level: 'complete', title: 'Gym', description: gym.status === 'recovery' ? 'Recovery day' : 'Completed', action: 'View', href: '/dashboard/health' })
  }

  // Water
  if (water.status === 'not_logged') {
    items.push({ id: 'water', level: currentHourIST > 15 ? 'high' : 'medium', title: 'Water', description: `0 / ${(water.targetMl / 1000).toFixed(1)}L`, action: 'Log Water', href: '/dashboard/today' })
  } else if (water.status === 'partial') {
    items.push({ id: 'water', level: 'medium', title: 'Water', description: `${(water.totalMl / 1000).toFixed(1)}L / ${(water.targetMl / 1000).toFixed(1)}L`, action: 'Add Water', href: '/dashboard/today' })
  } else {
    items.push({ id: 'water', level: 'complete', title: 'Water', description: `${(water.totalMl / 1000).toFixed(1)}L ✓`, action: 'View', href: '/dashboard/today' })
  }

  // Career
  if (career.status === 'not_logged') {
    items.push({ id: 'career', level: currentHourIST > 18 ? 'high' : 'medium', title: 'Career', description: `0 / ${career.targetMinutes} min`, action: 'Start Session', href: '/dashboard/career' })
  } else if (career.status === 'partial') {
    items.push({ id: 'career', level: 'medium', title: 'Career', description: `${career.totalMinutes} / ${career.targetMinutes} min`, action: 'Continue', href: '/dashboard/career' })
  } else {
    items.push({ id: 'career', level: 'complete', title: 'Career', description: `${career.totalMinutes} / ${career.targetMinutes} min ✓`, action: 'View', href: '/dashboard/career' })
  }

  // English
  if (english.status === 'not_logged') {
    items.push({ id: 'english', level: currentHourIST > 20 ? 'high' : 'medium', title: 'English', description: 'Not started', action: 'Start Practice', href: '/dashboard/english' })
  } else if (english.status === 'partial') {
    items.push({ id: 'english', level: 'medium', title: 'English', description: `${english.totalMinutes} / ${english.targetMinutes} min`, action: 'Continue', href: '/dashboard/english' })
  } else {
    items.push({ id: 'english', level: 'complete', title: 'English', description: `${english.totalMinutes} min ✓`, action: 'View', href: '/dashboard/english' })
  }

  // Reading
  if (reading.status === 'not_logged') {
    items.push({ id: 'reading', level: 'medium', title: 'Reading', description: `0 / ${reading.targetPages} pages`, action: 'Log Reading', href: '/dashboard/today' })
  } else if (reading.status === 'partial') {
    items.push({ id: 'reading', level: 'medium', title: 'Reading', description: `${reading.pagesRead} / ${reading.targetPages} pages`, action: 'Continue', href: '/dashboard/today' })
  } else {
    items.push({ id: 'reading', level: 'complete', title: 'Reading', description: `${reading.pagesRead} pages ✓`, action: 'View', href: '/dashboard/today' })
  }

  // Sleep (morning only)
  if (sleep.status === 'not_logged' && currentHourIST < 14) {
    items.push({ id: 'sleep', level: 'info', title: 'Sleep', description: "Log last night's sleep", action: 'Log Sleep', href: '/dashboard/health' })
  } else if (sleep.status !== 'not_logged') {
    const h = sleep.durationMinutes != null ? Math.floor(sleep.durationMinutes / 60) : 0
    const m = sleep.durationMinutes != null ? sleep.durationMinutes % 60 : 0
    items.push({ id: 'sleep', level: sleep.status === 'completed' ? 'complete' : 'info', title: 'Sleep', description: `${h}h ${m}m / ${sleep.targetHours}h target`, action: 'View', href: '/dashboard/health' })
  }

  // Daily Review (evening)
  if (review.status === 'not_logged' && currentHourIST >= 20) {
    items.push({ id: 'review', level: 'medium', title: 'Daily Review', description: 'End-of-day reflection not done', action: 'Write Review', href: '/dashboard/today' })
  } else if (review.status === 'completed') {
    items.push({ id: 'review', level: 'complete', title: 'Daily Review', description: 'Review completed', action: 'View', href: '/dashboard/today' })
  }

  // Discipline habits
  for (const habit of habits) {
    if (habit.isOptional || habit.category !== 'discipline') continue
    if (habit.status === 'not_logged') {
      items.push({ id: `habit-${habit.id}`, level: 'medium', title: habit.name, description: 'Not logged', action: 'Log', href: '/dashboard/today' })
    } else if (habit.status === 'missed') {
      items.push({ id: `habit-${habit.id}`, level: 'high', title: habit.name, description: 'Marked as missed', action: 'Update', href: '/dashboard/today' })
    } else if (habit.status === 'completed' || habit.status === 'recovery') {
      items.push({ id: `habit-${habit.id}`, level: 'complete', title: habit.name, description: 'Kept', action: 'View', href: '/dashboard/today' })
    }
  }

  return items
}

// ─── Assemble complete DailyState ────────────────────────────────────────────

export interface DailyStateInput {
  date: string
  habits: Array<{
    id: string; name: string; description: string | null; category: string; type: string
    target_value: number | null; unit: string | null; is_optional: boolean; weight: number; sort_order: number
  }>
  habitLogs: Array<{
    id: string; habit_id: string; status: 'kept' | 'failed' | 'partial' | 'skipped' | 'recovery'; value: number | null; notes: string | null
  }>
  waterLogs: Array<{ id: string; amount_ml: number; logged_at: string }>
  waterTargetMl?: number
  gymLog: { id: string; status: 'completed' | 'missed' | 'recovery'; workout_type: string | null; duration_minutes: number | null; notes: string | null } | null
  sleepLog: { id: string; bedtime: string | null; wake_time: string | null; quality: number | null; notes: string | null } | null
  careerSessions: Array<{ id: string; topic: string; minutes: number; date: string; notes: string | null }>
  careerTargetMinutes?: number
  englishSessions: Array<{ id: string; activity_type: string; minutes: number; date: string; notes: string | null }>
  englishTargetMinutes?: number
  bookProgressSessions: Array<{ id: string; pages_read: number; date: string; book_id: string }>
  readingTargetPages?: number
  rapidoEntry: { id: string; gross_earnings: number; fuel_cost: number; net_earnings: number; hours: number; rides: number } | null
  expenseEntries: Array<{ id: string; category: string; amount: number; description: string | null }>
  wakeLog: { id: string; wake_time: string; status: string } | null
  wakeTargetTime?: string
  reviewLog: { id: string; went_well: string | null; distracted_by: string | null; improve_tomorrow: string | null; tomorrow_priority: string | null; mood: number | null; energy: number | null } | null
  sleepTargetHours?: number
}

export function assembleDailyState(input: DailyStateInput, currentHourIST?: number): DailyState {
  const programDay = getDayNumber(input.date)
  const todayIST = getTodayIST()
  const isToday = input.date === todayIST
  const isBeforeProgram = input.date < '2026-10-01'
  const isAfterProgram = input.date > '2026-12-29'
  const hour = currentHourIST ?? new Date().getHours()

  const habits = mergeHabitsWithLogs(input.habits, input.habitLogs)
  const water = buildWaterState(input.waterLogs, input.waterTargetMl ?? WATER_TARGET_ML)
  const gym = buildGymState(input.gymLog)
  const sleep = buildSleepState(input.sleepLog, input.sleepTargetHours ?? SLEEP_TARGET_HOURS)
  const career = buildCareerState(input.careerSessions, input.careerTargetMinutes ?? CAREER_TARGET_MINUTES)
  const english = buildEnglishState(input.englishSessions, input.englishTargetMinutes ?? ENGLISH_TARGET_MINUTES)
  const reading = buildReadingState(input.bookProgressSessions, input.readingTargetPages ?? READING_TARGET_PAGES)
  const rapido = buildRapidoState(input.rapidoEntry)
  const wake = buildWakeState(input.wakeLog, input.wakeTargetTime ?? '06:00')
  const review = buildReviewState(input.reviewLog)
  const expenses: ExpensesState = {
    totalAmount: input.expenseEntries.reduce((s, e) => s + e.amount, 0),
    entries: input.expenseEntries,
  }

  const score = calculateDailyScore(habits, career, english, gym, water, reading)
  const attention = buildAttentionItems(habits, career, english, gym, water, reading, sleep, review, hour)
  const pendingAttention = attention.filter(a => a.level !== 'complete')
  const nextAction = pendingAttention.find(a => a.level === 'high')
    ?? pendingAttention.find(a => a.level === 'medium')
    ?? pendingAttention.find(a => a.level === 'info')
    ?? null

  return {
    date: input.date, programDay, isToday, isBeforeProgram, isAfterProgram,
    dataStatus: 'loaded', errorMessage: null,
    habits, water, gym, sleep, career, english, reading, rapido, expenses, wake, review,
    score, attention, nextAction,
  }
}

// ─── Status display helpers ──────────────────────────────────────────────────

export function getStatusIcon(status: ActivityStatus): string {
  switch (status) {
    case 'completed': return '🟢'
    case 'partial': return '🟡'
    case 'missed': return '🔴'
    case 'recovery': return '🔵'
    case 'skipped': return '⚪'
    case 'not_logged': return '⚪'
    case 'not_applicable': return '—'
    default: return '⚪'
  }
}

export function getStatusLabel(status: ActivityStatus): string {
  switch (status) {
    case 'completed': return 'Completed'
    case 'partial': return 'Partial'
    case 'missed': return 'Missed'
    case 'recovery': return 'Recovery'
    case 'skipped': return 'Skipped'
    case 'not_logged': return 'Not logged'
    case 'not_applicable': return 'N/A'
    default: return 'Unknown'
  }
}

export function getStatusColor(status: ActivityStatus): string {
  switch (status) {
    case 'completed': return 'text-green-400'
    case 'partial': return 'text-yellow-400'
    case 'missed': return 'text-red-400'
    case 'recovery': return 'text-blue-400'
    case 'skipped': return 'text-gray-400'
    case 'not_logged': return 'text-muted-foreground'
    default: return 'text-muted-foreground'
  }
}

export function getStatusBg(status: ActivityStatus): string {
  switch (status) {
    case 'completed': return 'bg-green-500/10 border-green-500/20'
    case 'partial': return 'bg-yellow-500/10 border-yellow-500/20'
    case 'missed': return 'bg-red-500/10 border-red-500/20'
    case 'recovery': return 'bg-blue-500/10 border-blue-500/20'
    case 'skipped': return 'bg-secondary border-border'
    default: return 'bg-secondary/50 border-border'
  }
}
