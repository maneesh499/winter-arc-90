import type { HabitLog, ScoreWeights, DEFAULT_SCORE_WEIGHTS } from '@/types'
import { DEFAULT_SCORE_WEIGHTS as DEFAULTS } from '@/types'

export interface CategoryScore {
  score: number // 0–100
  completed: number
  total: number
}

export interface DailyScore {
  total: number
  discipline: CategoryScore
  health: CategoryScore
  career: CategoryScore
  english: CategoryScore
  creative: CategoryScore
  productivity: CategoryScore
}

export interface HabitScoreInput {
  habitId: string
  category: string
  isOptional: boolean
  weight: number
  status: 'kept' | 'failed' | 'partial' | 'skipped' | 'recovery' | null
  value?: number | null
  targetValue?: number | null
}

// Convert a habit log status to a score contribution (0–100)
function habitStatusToScore(
  status: HabitScoreInput['status'],
  value?: number | null,
  targetValue?: number | null
): number {
  if (status === null || status === 'skipped') return 0

  switch (status) {
    case 'kept':
      return 100
    case 'partial':
      // For numeric habits: proportional to value/target
      if (value !== null && value !== undefined && targetValue) {
        return Math.min(100, Math.round((value / targetValue) * 100))
      }
      return 50
    case 'failed':
      return 0
    case 'recovery':
      return 60 // Recovery day: partial credit
    default:
      return 0
  }
}

// Calculate category score from a list of habits
function calcCategoryScore(habits: HabitScoreInput[]): CategoryScore {
  const mandatory = habits.filter((h) => !h.isOptional)

  if (mandatory.length === 0) {
    return { score: 0, completed: 0, total: 0 }
  }

  const totalWeight = mandatory.reduce((sum, h) => sum + h.weight, 0) || mandatory.length
  let weightedScore = 0
  let completed = 0

  for (const habit of mandatory) {
    const habitScore = habitStatusToScore(habit.status, habit.value, habit.targetValue)
    const weight = totalWeight > 0 ? habit.weight / totalWeight : 1 / mandatory.length
    weightedScore += habitScore * weight

    if (habit.status === 'kept' || habit.status === 'recovery') {
      completed++
    }
  }

  return {
    score: Math.round(weightedScore),
    completed,
    total: mandatory.length,
  }
}

// Calculate full daily score
export function calculateDailyScore(
  habits: HabitScoreInput[],
  weights: ScoreWeights = DEFAULTS,
  extraData?: {
    careerMinutes?: number
    englishMinutes?: number
    creativeMinutes?: number
    waterMl?: number
    waterTarget?: number
  }
): DailyScore {
  // Group habits by category
  const byCategory: Record<string, HabitScoreInput[]> = {
    discipline: [],
    health: [],
    career: [],
    english: [],
    creative: [],
    productivity: [],
  }

  for (const habit of habits) {
    const cat = habit.category
    if (byCategory[cat]) {
      byCategory[cat].push(habit)
    }
  }

  // Calculate category scores
  const discipline = calcCategoryScore(byCategory.discipline)
  const health = calcCategoryScore(byCategory.health)
  const career = calcCategoryScore(byCategory.career)
  const english = calcCategoryScore(byCategory.english)
  const creative = calcCategoryScore(byCategory.creative)
  const productivity = calcCategoryScore(byCategory.productivity)

  // Boost career/english scores based on time logged
  if (extraData?.careerMinutes && extraData.careerMinutes >= 60) {
    career.score = Math.min(100, career.score + 20)
  }
  if (extraData?.englishMinutes && extraData.englishMinutes >= 30) {
    english.score = Math.min(100, english.score + 20)
  }
  if (extraData?.creativeMinutes && extraData.creativeMinutes >= 30) {
    creative.score = Math.min(100, creative.score + 20)
  }

  // Calculate total weighted score
  const totalWeight =
    weights.discipline +
    weights.health +
    weights.career +
    weights.productivity +
    weights.english +
    weights.creativity

  const total = Math.round(
    (discipline.score * weights.discipline +
      health.score * weights.health +
      career.score * weights.career +
      productivity.score * weights.productivity +
      english.score * weights.english +
      creative.score * weights.creativity) /
      totalWeight
  )

  return {
    total: Math.min(100, Math.max(0, total)),
    discipline,
    health,
    career,
    english,
    creative,
    productivity,
  }
}

// Compute streak from array of boolean success values
export function computeStreak(
  dateSuccessMap: Map<string, boolean>
): { current: number; best: number } {
  const sortedDates = Array.from(dateSuccessMap.keys()).sort()

  let best = 0
  let streak = 0

  for (const date of sortedDates) {
    if (dateSuccessMap.get(date)) {
      streak++
      best = Math.max(best, streak)
    } else {
      streak = 0
    }
  }

  // Calculate current streak (from most recent back)
  let current = 0
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    if (dateSuccessMap.get(sortedDates[i])) {
      current++
    } else {
      break
    }
  }

  return { current, best }
}

// Compute completion percentage
export function computeCompletion(
  total: number,
  completed: number
): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}
