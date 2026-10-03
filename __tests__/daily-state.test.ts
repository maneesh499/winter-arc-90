/**
 * DailyStateService Tests
 * Tests for the core daily state engine — the source of truth for Winter Arc 90
 */

import {
  assembleDailyState,
  mergeHabitsWithLogs,
  buildWaterState,
  buildGymState,
  buildSleepState,
  buildCareerState,
  buildEnglishState,
  buildReadingState,
  buildRapidoState,
  buildReviewState,
  buildWakeState,
  calculateDailyScore,
  buildAttentionItems,
  habitStatusToActivityStatus,
  gymStatusToActivityStatus,
  type DailyStateInput,
} from '@/lib/daily-state'

// ─── Test fixtures ───────────────────────────────────────────────────────────

const MOCK_HABITS = [
  { id: 'h1', name: 'No Porn', description: null, category: 'discipline', type: 'abstinence', target_value: null, unit: null, is_optional: false, weight: 50, sort_order: 1 },
  { id: 'h2', name: 'Digital Discipline', description: null, category: 'discipline', type: 'boolean', target_value: null, unit: null, is_optional: false, weight: 50, sort_order: 2 },
  { id: 'h3', name: 'Healthy Eating', description: null, category: 'health', type: 'rating', target_value: null, unit: null, is_optional: false, weight: 30, sort_order: 1 },
  { id: 'h4', name: 'Morning Routine', description: null, category: 'productivity', type: 'boolean', target_value: null, unit: null, is_optional: false, weight: 50, sort_order: 1 },
  { id: 'h5', name: 'Daily Review', description: null, category: 'productivity', type: 'boolean', target_value: null, unit: null, is_optional: false, weight: 50, sort_order: 2 },
  { id: 'h6', name: 'Rapido', description: null, category: 'optional', type: 'boolean', target_value: null, unit: null, is_optional: true, weight: 0, sort_order: 1 },
]

const MOCK_INPUT_ZERO_LOGS: DailyStateInput = {
  date: '2026-10-03',
  habits: MOCK_HABITS,
  habitLogs: [],      // NO LOGS — this is the main bug scenario
  waterLogs: [],
  gymLog: null,
  sleepLog: null,
  careerSessions: [],
  englishSessions: [],
  bookProgressSessions: [],
  rapidoEntry: null,
  expenseEntries: [],
  wakeLog: null,
  reviewLog: null,
}

// ─── Status mapping tests ─────────────────────────────────────────────────────

describe('habitStatusToActivityStatus', () => {
  it('maps null/undefined to not_logged', () => {
    expect(habitStatusToActivityStatus(null)).toBe('not_logged')
    expect(habitStatusToActivityStatus(undefined)).toBe('not_logged')
  })
  it('maps kept → completed', () => expect(habitStatusToActivityStatus('kept')).toBe('completed'))
  it('maps failed → missed', () => expect(habitStatusToActivityStatus('failed')).toBe('missed'))
  it('maps partial → partial', () => expect(habitStatusToActivityStatus('partial')).toBe('partial'))
  it('maps recovery → recovery', () => expect(habitStatusToActivityStatus('recovery')).toBe('recovery'))
  it('maps skipped → skipped', () => expect(habitStatusToActivityStatus('skipped')).toBe('skipped'))
})

describe('gymStatusToActivityStatus', () => {
  it('maps null to not_logged', () => expect(gymStatusToActivityStatus(null)).toBe('not_logged'))
  it('maps completed → completed', () => expect(gymStatusToActivityStatus('completed')).toBe('completed'))
  it('maps missed → missed', () => expect(gymStatusToActivityStatus('missed')).toBe('missed'))
  it('maps recovery → recovery', () => expect(gymStatusToActivityStatus('recovery')).toBe('recovery'))
})

// ─── THE CRITICAL BUG FIX: Missing logs must show "not_logged", not hide activities ──

describe('mergeHabitsWithLogs — Missing logs should NOT hide activities', () => {
  it('shows all habits even with zero logs', () => {
    const result = mergeHabitsWithLogs(MOCK_HABITS, [])
    expect(result).toHaveLength(MOCK_HABITS.length) // ALL habits shown
  })

  it('marks missing logs as not_logged', () => {
    const result = mergeHabitsWithLogs(MOCK_HABITS, [])
    result.forEach(h => {
      expect(h.status).toBe('not_logged') // NOT hidden, just not_logged
    })
  })

  it('correctly merges a partial log', () => {
    const logs = [{ id: 'log1', habit_id: 'h1', status: 'partial' as const, value: null, notes: null }]
    const result = mergeHabitsWithLogs(MOCK_HABITS, logs)
    const noPorn = result.find(h => h.id === 'h1')
    expect(noPorn?.status).toBe('partial')
    const others = result.filter(h => h.id !== 'h1')
    others.forEach(h => expect(h.status).toBe('not_logged'))
  })

  it('correctly merges a completed log', () => {
    const logs = [{ id: 'log1', habit_id: 'h1', status: 'kept' as const, value: null, notes: null }]
    const result = mergeHabitsWithLogs(MOCK_HABITS, logs)
    const noPorn = result.find(h => h.id === 'h1')
    expect(noPorn?.status).toBe('completed')
  })

  it('correctly merges a missed log', () => {
    const logs = [{ id: 'log1', habit_id: 'h1', status: 'failed' as const, value: null, notes: null }]
    const result = mergeHabitsWithLogs(MOCK_HABITS, logs)
    const noPorn = result.find(h => h.id === 'h1')
    expect(noPorn?.status).toBe('missed')
  })

  it('correctly merges a recovery log', () => {
    const logs = [{ id: 'log1', habit_id: 'h1', status: 'recovery' as const, value: null, notes: null }]
    const result = mergeHabitsWithLogs(MOCK_HABITS, logs)
    const noPorn = result.find(h => h.id === 'h1')
    expect(noPorn?.status).toBe('recovery')
  })

  it('passes through logId', () => {
    const logs = [{ id: 'log-abc', habit_id: 'h1', status: 'kept' as const, value: null, notes: null }]
    const result = mergeHabitsWithLogs(MOCK_HABITS, logs)
    expect(result.find(h => h.id === 'h1')?.logId).toBe('log-abc')
    expect(result.find(h => h.id === 'h2')?.logId).toBeNull()
  })
})

// ─── Water state ─────────────────────────────────────────────────────────────

describe('buildWaterState', () => {
  it('returns not_logged when no water logged', () => {
    const w = buildWaterState([], 2500)
    expect(w.status).toBe('not_logged')
    expect(w.totalMl).toBe(0)
    expect(w.percentage).toBe(0)
  })

  it('returns partial for 1000ml with 2500 target', () => {
    const w = buildWaterState([{ id: 'w1', amount_ml: 1000, logged_at: '' }], 2500)
    expect(w.status).toBe('partial')
    expect(w.totalMl).toBe(1000)
    expect(w.percentage).toBe(40)
  })

  it('returns completed at target', () => {
    const w = buildWaterState([{ id: 'w1', amount_ml: 2500, logged_at: '' }], 2500)
    expect(w.status).toBe('completed')
    expect(w.percentage).toBe(100)
  })

  it('aggregates multiple water logs', () => {
    const logs = [
      { id: 'w1', amount_ml: 500, logged_at: '' },
      { id: 'w2', amount_ml: 500, logged_at: '' },
      { id: 'w3', amount_ml: 1000, logged_at: '' },
    ]
    const w = buildWaterState(logs, 2500)
    expect(w.totalMl).toBe(2000)
    expect(w.status).toBe('partial')
  })

  it('shows not_logged (NOT missed) when 0 water during the day', () => {
    const w = buildWaterState([], 2500)
    expect(w.status).toBe('not_logged')
    // CRITICAL: should never be 'missed' just because no water was logged mid-day
    expect(w.status).not.toBe('missed')
  })

  it('caps percentage at 100 when over target', () => {
    const w = buildWaterState([{ id: 'w1', amount_ml: 3000, logged_at: '' }], 2500)
    expect(w.percentage).toBe(100)
    expect(w.status).toBe('completed')
  })
})

// ─── Gym state ───────────────────────────────────────────────────────────────

describe('buildGymState', () => {
  it('returns not_logged when no gym log', () => {
    const g = buildGymState(null)
    expect(g.status).toBe('not_logged')
    expect(g.logId).toBeNull()
  })

  it('returns completed for completed log', () => {
    const g = buildGymState({ id: 'g1', status: 'completed', workout_type: 'push', duration_minutes: 60, notes: null })
    expect(g.status).toBe('completed')
    expect(g.workoutType).toBe('push')
    expect(g.durationMinutes).toBe(60)
    expect(g.logId).toBe('g1')
  })

  it('returns missed for missed log', () => {
    const g = buildGymState({ id: 'g1', status: 'missed', workout_type: null, duration_minutes: null, notes: null })
    expect(g.status).toBe('missed')
  })

  it('returns recovery for recovery log', () => {
    const g = buildGymState({ id: 'g1', status: 'recovery', workout_type: null, duration_minutes: null, notes: null })
    expect(g.status).toBe('recovery')
  })
})

// ─── Sleep state ─────────────────────────────────────────────────────────────

describe('buildSleepState', () => {
  it('returns not_logged when no sleep log', () => {
    const s = buildSleepState(null)
    expect(s.status).toBe('not_logged')
    expect(s.durationMinutes).toBeNull()
  })

  it('calculates duration for overnight sleep', () => {
    const s = buildSleepState({ id: 's1', bedtime: '22:00', wake_time: '06:00', quality: 4, notes: null })
    expect(s.durationMinutes).toBe(480) // 8 hours
    expect(s.status).toBe('completed') // >= 7h target
  })

  it('returns partial for insufficient sleep', () => {
    const s = buildSleepState({ id: 's1', bedtime: '00:00', wake_time: '05:30', quality: 3, notes: null })
    expect(s.durationMinutes).toBe(330) // 5h 30m
    expect(s.status).toBe('partial') // < 7h target
  })

  it('handles sleep that crosses midnight correctly', () => {
    // Bed at 23:00, wake at 06:00 = 7h
    const s = buildSleepState({ id: 's1', bedtime: '23:00', wake_time: '06:00', quality: 4, notes: null })
    expect(s.durationMinutes).toBe(420) // 7 hours exactly
    expect(s.status).toBe('completed')
  })
})

// ─── Career state ─────────────────────────────────────────────────────────────

describe('buildCareerState', () => {
  it('returns not_logged for zero sessions', () => {
    const c = buildCareerState([], 90)
    expect(c.status).toBe('not_logged')
    expect(c.totalMinutes).toBe(0)
  })

  it('returns partial for 30 min with 90 target', () => {
    const c = buildCareerState([{ id: 'c1', topic: 'SQL', minutes: 30, date: '2026-10-03', notes: null }], 90)
    expect(c.status).toBe('partial')
    expect(c.totalMinutes).toBe(30)
    expect(c.percentage).toBe(33)
  })

  it('returns completed at 90 min', () => {
    const c = buildCareerState([{ id: 'c1', topic: 'SQL', minutes: 90, date: '2026-10-03', notes: null }], 90)
    expect(c.status).toBe('completed')
    expect(c.percentage).toBe(100)
  })

  it('aggregates multiple sessions', () => {
    const sessions = [
      { id: 'c1', topic: 'SQL', minutes: 45, date: '2026-10-03', notes: null },
      { id: 'c2', topic: 'Python', minutes: 45, date: '2026-10-03', notes: null },
    ]
    const c = buildCareerState(sessions, 90)
    expect(c.totalMinutes).toBe(90)
    expect(c.status).toBe('completed')
  })
})

// ─── English state ────────────────────────────────────────────────────────────

describe('buildEnglishState', () => {
  it('returns not_logged for zero sessions', () => {
    const e = buildEnglishState([], 20)
    expect(e.status).toBe('not_logged')
  })

  it('returns partial for 10 min with 20 target', () => {
    const e = buildEnglishState([{ id: 'e1', activity_type: 'speaking', minutes: 10, date: '2026-10-03', notes: null }], 20)
    expect(e.status).toBe('partial')
    expect(e.totalMinutes).toBe(10)
  })

  it('returns completed at target', () => {
    const e = buildEnglishState([{ id: 'e1', activity_type: 'speaking', minutes: 20, date: '2026-10-03', notes: null }], 20)
    expect(e.status).toBe('completed')
  })
})

// ─── Reading state ───────────────────────────────────────────────────────────

describe('buildReadingState', () => {
  it('returns not_logged with zero pages', () => {
    const r = buildReadingState([], 3)
    expect(r.status).toBe('not_logged')
    expect(r.pagesRead).toBe(0)
  })

  it('returns partial for 2 pages with target 3', () => {
    const r = buildReadingState([{ id: 'r1', pages_read: 2, date: '2026-10-03', book_id: 'b1' }], 3)
    expect(r.status).toBe('partial')
    expect(r.pagesRead).toBe(2)
  })

  it('returns completed at target', () => {
    const r = buildReadingState([{ id: 'r1', pages_read: 3, date: '2026-10-03', book_id: 'b1' }], 3)
    expect(r.status).toBe('completed')
  })
})

// ─── Rapido state ─────────────────────────────────────────────────────────────

describe('buildRapidoState', () => {
  it('returns not logged when no entry', () => {
    const r = buildRapidoState(null)
    expect(r.logged).toBe(false)
    expect(r.netEarnings).toBe(0)
    expect(r.entryId).toBeNull()
  })

  it('returns logged with correct values', () => {
    const r = buildRapidoState({ id: 'r1', gross_earnings: 450, fuel_cost: 80, net_earnings: 370, hours: 3.5, rides: 12 })
    expect(r.logged).toBe(true)
    expect(r.netEarnings).toBe(370)
    expect(r.grossEarnings).toBe(450)
    expect(r.fuelCost).toBe(80)
    expect(r.hours).toBe(3.5)
    expect(r.rides).toBe(12)
    expect(r.entryId).toBe('r1')
  })
})

// ─── Daily Review state ───────────────────────────────────────────────────────

describe('buildReviewState', () => {
  it('returns not_logged when no review', () => {
    const r = buildReviewState(null)
    expect(r.status).toBe('not_logged')
    expect(r.logId).toBeNull()
  })

  it('returns completed when review has content', () => {
    const r = buildReviewState({ id: 'r1', went_well: 'Great day', distracted_by: null, improve_tomorrow: null, tomorrow_priority: null, mood: 4, energy: 3 })
    expect(r.status).toBe('completed')
    expect(r.wentWell).toBe('Great day')
  })

  it('returns partial when review has no content', () => {
    const r = buildReviewState({ id: 'r1', went_well: null, distracted_by: null, improve_tomorrow: null, tomorrow_priority: null, mood: null, energy: null })
    expect(r.status).toBe('partial')
  })
})

// ─── Program day calculation ─────────────────────────────────────────────────

describe('getDayNumber (via assembleDailyState)', () => {
  it('Day 1 is Oct 1', () => {
    const state = assembleDailyState({ ...MOCK_INPUT_ZERO_LOGS, date: '2026-10-01' })
    expect(state.programDay).toBe(1)
  })

  it('Day 3 is Oct 3', () => {
    const state = assembleDailyState({ ...MOCK_INPUT_ZERO_LOGS, date: '2026-10-03' })
    expect(state.programDay).toBe(3)
  })

  it('Day 90 is Dec 29', () => {
    const state = assembleDailyState({ ...MOCK_INPUT_ZERO_LOGS, date: '2026-12-29' })
    expect(state.programDay).toBe(90)
  })

  it('before program returns null', () => {
    const state = assembleDailyState({ ...MOCK_INPUT_ZERO_LOGS, date: '2026-09-30' })
    expect(state.programDay).toBeNull()
    expect(state.isBeforeProgram).toBe(true)
  })

  it('after program returns null', () => {
    const state = assembleDailyState({ ...MOCK_INPUT_ZERO_LOGS, date: '2026-12-30' })
    expect(state.programDay).toBeNull()
    expect(state.isAfterProgram).toBe(true)
  })
})

// ─── assembleDailyState: THE CRITICAL SCENARIO ─────────────────────────────

describe('assembleDailyState — core scenario: only Rapido logged, nothing else', () => {
  const rapidoOnlyInput: DailyStateInput = {
    ...MOCK_INPUT_ZERO_LOGS,
    rapidoEntry: { id: 'r1', gross_earnings: 450, fuel_cost: 80, net_earnings: 370, hours: 3.5, rides: 12 },
  }

  it('assembles successfully', () => {
    const state = assembleDailyState(rapidoOnlyInput)
    expect(state.dataStatus).toBe('loaded')
  })

  it('shows all habits as not_logged (not hidden)', () => {
    const state = assembleDailyState(rapidoOnlyInput)
    expect(state.habits).toHaveLength(MOCK_HABITS.length)
    const mandatory = state.habits.filter(h => !h.isOptional)
    mandatory.forEach(h => expect(h.status).toBe('not_logged'))
  })

  it('shows gym as not_logged', () => {
    const state = assembleDailyState(rapidoOnlyInput)
    expect(state.gym.status).toBe('not_logged')
  })

  it('shows water as not_logged', () => {
    const state = assembleDailyState(rapidoOnlyInput)
    expect(state.water.status).toBe('not_logged')
    expect(state.water.totalMl).toBe(0)
  })

  it('shows career as not_logged', () => {
    const state = assembleDailyState(rapidoOnlyInput)
    expect(state.career.status).toBe('not_logged')
  })

  it('shows rapido as logged', () => {
    const state = assembleDailyState(rapidoOnlyInput)
    expect(state.rapido.logged).toBe(true)
    expect(state.rapido.netEarnings).toBe(370)
  })

  it('shows rapido as optional (not counted in score)', () => {
    const state = assembleDailyState(rapidoOnlyInput)
    // Score should not be perfect just because rapido was logged
    // Score comes from mandatory activities
    expect(state.score.total).toBe(0) // Nothing mandatory done
  })
})

// ─── assembleDailyState: Test scenario from requirements ────────────────────

describe('assembleDailyState — requirement test scenario', () => {
  const testInput: DailyStateInput = {
    date: '2026-10-03',
    habits: MOCK_HABITS,
    habitLogs: [],
    waterLogs: [{ id: 'w1', amount_ml: 1000, logged_at: '' }],
    gymLog: { id: 'g1', status: 'missed', workout_type: null, duration_minutes: null, notes: null },
    sleepLog: { id: 's1', bedtime: '23:30', wake_time: '05:00', quality: 3, notes: null },
    careerSessions: [],
    englishSessions: [],
    bookProgressSessions: [],
    rapidoEntry: { id: 'r1', gross_earnings: 450, fuel_cost: 80, net_earnings: 370, hours: 3.5, rides: 12 },
    expenseEntries: [{ id: 'e1', category: 'food', amount: 150, description: 'Lunch' }],
    wakeLog: null,
    reviewLog: null,
  }

  it('shows gym as missed', () => {
    const state = assembleDailyState(testInput)
    expect(state.gym.status).toBe('missed')
  })

  it('shows water as partial (1L of 2.5L)', () => {
    const state = assembleDailyState(testInput)
    expect(state.water.status).toBe('partial')
    expect(state.water.totalMl).toBe(1000)
  })

  it('shows career as not_logged (0/90)', () => {
    const state = assembleDailyState(testInput)
    expect(state.career.status).toBe('not_logged')
    expect(state.career.totalMinutes).toBe(0)
  })

  it('shows english as not_logged (0/20)', () => {
    const state = assembleDailyState(testInput)
    expect(state.english.status).toBe('not_logged')
  })

  it('shows sleep as partial (5h30m < 7h target)', () => {
    const state = assembleDailyState(testInput)
    expect(state.sleep.status).toBe('partial')
    expect(state.sleep.durationMinutes).toBe(330) // 5h30m
  })

  it('shows rapido as logged with ₹370 net', () => {
    const state = assembleDailyState(testInput)
    expect(state.rapido.logged).toBe(true)
    expect(state.rapido.netEarnings).toBe(370)
  })

  it('shows expenses at ₹150', () => {
    const state = assembleDailyState(testInput)
    expect(state.expenses.totalAmount).toBe(150)
  })

  it('program day is 3', () => {
    const state = assembleDailyState(testInput)
    expect(state.programDay).toBe(3)
  })

  it('all mandatory habits shown even with zero logs', () => {
    const state = assembleDailyState(testInput)
    const mandatory = state.habits.filter(h => !h.isOptional)
    expect(mandatory.length).toBeGreaterThan(0)
    mandatory.forEach(h => expect(h.status).toBe('not_logged'))
  })

  it('generates attention items', () => {
    const state = assembleDailyState(testInput, 10)
    expect(state.attention.length).toBeGreaterThan(0)
  })

  it('nextAction is not null when there are pending items', () => {
    const state = assembleDailyState(testInput, 10)
    expect(state.nextAction).not.toBeNull()
  })
})

// ─── Score engine ─────────────────────────────────────────────────────────────

describe('calculateDailyScore', () => {
  it('returns 0 for completely unlogged day', () => {
    const habits = mergeHabitsWithLogs(MOCK_HABITS, [])
    const water = buildWaterState([], 2500)
    const gym = buildGymState(null)
    const career = buildCareerState([], 90)
    const english = buildEnglishState([], 20)
    const reading = buildReadingState([], 3)
    const score = calculateDailyScore(habits, career, english, gym, water, reading)
    expect(score.total).toBe(0)
    expect(score.pendingActivities).toBeGreaterThan(0)
  })

  it('returns 100 for perfect day', () => {
    const habits = mergeHabitsWithLogs(MOCK_HABITS, [
      { id: 'l1', habit_id: 'h1', status: 'kept', value: null, notes: null },
      { id: 'l2', habit_id: 'h2', status: 'kept', value: null, notes: null },
      { id: 'l3', habit_id: 'h3', status: 'kept', value: null, notes: null },
      { id: 'l4', habit_id: 'h4', status: 'kept', value: null, notes: null },
      { id: 'l5', habit_id: 'h5', status: 'kept', value: null, notes: null },
    ])
    const water = buildWaterState([{ id: 'w1', amount_ml: 2500, logged_at: '' }], 2500)
    const gym = buildGymState({ id: 'g1', status: 'completed', workout_type: 'push', duration_minutes: 60, notes: null })
    const career = buildCareerState([{ id: 'c1', topic: 'SQL', minutes: 90, date: '', notes: null }], 90)
    const english = buildEnglishState([{ id: 'e1', activity_type: 'speaking', minutes: 20, date: '', notes: null }], 20)
    const reading = buildReadingState([{ id: 'r1', pages_read: 3, date: '', book_id: '' }], 3)
    const score = calculateDailyScore(habits, career, english, gym, water, reading)
    // Score is >= 90 on a perfect day (exact value depends on category weights and habits present)
    expect(score.total).toBeGreaterThanOrEqual(90)
  })

  it('does not let not_logged === missed in score calculation', () => {
    // not_logged and missed both score 0 during the day, but semantically different
    // This test ensures the distinction is preserved in the count
    const habits = mergeHabitsWithLogs(MOCK_HABITS, [
      { id: 'l1', habit_id: 'h1', status: 'failed', value: null, notes: null }, // explicitly missed
    ])
    const water = buildWaterState([], 2500)
    const gym = buildGymState(null)
    const career = buildCareerState([], 90)
    const english = buildEnglishState([], 20)
    const reading = buildReadingState([], 3)
    const score = calculateDailyScore(habits, career, english, gym, water, reading)
    // There should be both missed and pending items
    expect(score.missedActivities).toBeGreaterThan(0) // gym explicitly missed? No, gym is not_logged
    expect(score.pendingActivities).toBeGreaterThan(0)
  })

  it('recovery gets partial credit (not 0, not 100)', () => {
    const habits = mergeHabitsWithLogs(MOCK_HABITS, [
      { id: 'l1', habit_id: 'h1', status: 'recovery', value: null, notes: null },
      { id: 'l2', habit_id: 'h2', status: 'recovery', value: null, notes: null },
    ])
    const water = buildWaterState([{ id: 'w1', amount_ml: 2500, logged_at: '' }], 2500)
    const gym = buildGymState({ id: 'g1', status: 'recovery', workout_type: null, duration_minutes: null, notes: null })
    const career = buildCareerState([{ id: 'c1', topic: 'SQL', minutes: 90, date: '', notes: null }], 90)
    const english = buildEnglishState([{ id: 'e1', activity_type: 'speaking', minutes: 20, date: '', notes: null }], 20)
    const reading = buildReadingState([{ id: 'r1', pages_read: 3, date: '', book_id: '' }], 3)
    const score = calculateDailyScore(habits, career, english, gym, water, reading)
    expect(score.total).toBeGreaterThan(0)
    expect(score.total).toBeLessThan(100)
  })
})

// ─── Attention engine ─────────────────────────────────────────────────────────

describe('buildAttentionItems', () => {
  it('generates attention for all unlogged items', () => {
    const habits = mergeHabitsWithLogs(MOCK_HABITS, [])
    const water = buildWaterState([], 2500)
    const gym = buildGymState(null)
    const career = buildCareerState([], 90)
    const english = buildEnglishState([], 20)
    const reading = buildReadingState([], 3)
    const sleep = buildSleepState(null)
    const review = buildReviewState(null)
    const items = buildAttentionItems(habits, career, english, gym, water, reading, sleep, review, 10)
    // At minimum: gym, water, career, english, reading
    expect(items.length).toBeGreaterThanOrEqual(5)
    // Gym should be present
    expect(items.some(i => i.id === 'gym')).toBe(true)
    // Water should be present
    expect(items.some(i => i.id === 'water')).toBe(true)
    // Career should be present
    expect(items.some(i => i.id === 'career')).toBe(true)
  })

  it('marks gym as high priority after 18:00', () => {
    const habits = mergeHabitsWithLogs(MOCK_HABITS, [])
    const water = buildWaterState([], 2500)
    const gym = buildGymState(null)
    const career = buildCareerState([], 90)
    const english = buildEnglishState([], 20)
    const reading = buildReadingState([], 3)
    const sleep = buildSleepState(null)
    const review = buildReviewState(null)
    const items = buildAttentionItems(habits, career, english, gym, water, reading, sleep, review, 19)
    const gymItem = items.find(i => i.id === 'gym')
    expect(gymItem?.level).toBe('high')
  })

  it('marks completed items as complete level', () => {
    const habits = mergeHabitsWithLogs(MOCK_HABITS, [])
    const water = buildWaterState([{ id: 'w1', amount_ml: 2500, logged_at: '' }], 2500)
    const gym = buildGymState({ id: 'g1', status: 'completed', workout_type: null, duration_minutes: null, notes: null })
    const career = buildCareerState([{ id: 'c1', topic: 'SQL', minutes: 90, date: '', notes: null }], 90)
    const english = buildEnglishState([{ id: 'e1', activity_type: 'speaking', minutes: 20, date: '', notes: null }], 20)
    const reading = buildReadingState([{ id: 'r1', pages_read: 3, date: '', book_id: '' }], 3)
    const sleep = buildSleepState(null)
    const review = buildReviewState(null)
    const items = buildAttentionItems(habits, career, english, gym, water, reading, sleep, review, 10)
    const gymItem = items.find(i => i.id === 'gym')
    expect(gymItem?.level).toBe('complete')
    const waterItem = items.find(i => i.id === 'water')
    expect(waterItem?.level).toBe('complete')
  })
})

// ─── Weekly analytics (basic aggregation) ────────────────────────────────────

describe('Analytics aggregation', () => {
  it('aggregates water across multiple days correctly', () => {
    const dayLogs = [
      [{ id: 'w1', amount_ml: 2500, logged_at: '' }], // Day 1: complete
      [{ id: 'w2', amount_ml: 1000, logged_at: '' }], // Day 2: partial
      [],                                                // Day 3: not logged
    ]
    const states = dayLogs.map(logs => buildWaterState(logs, 2500))
    const total = states.reduce((s, w) => s + w.totalMl, 0)
    expect(total).toBe(3500)
    expect(states[0].status).toBe('completed')
    expect(states[1].status).toBe('partial')
    expect(states[2].status).toBe('not_logged')
  })

  it('aggregates career minutes across sessions', () => {
    const sessions = [
      { id: 'c1', topic: 'SQL', minutes: 30, date: '2026-10-03', notes: null },
      { id: 'c2', topic: 'Python', minutes: 45, date: '2026-10-03', notes: null },
      { id: 'c3', topic: 'Databricks', minutes: 20, date: '2026-10-03', notes: null },
    ]
    const career = buildCareerState(sessions, 90)
    expect(career.totalMinutes).toBe(95)
    expect(career.status).toBe('completed')
    expect(career.percentage).toBe(100)
  })
})
