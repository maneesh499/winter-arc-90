import {
  getDayNumber,
  getProgramStart,
  getProgramEnd,
  PROGRAM_START_STR,
  PROGRAM_END_STR,
  calculateStreak
} from '../src/lib/dates'

describe('Winter Arc 90 Date Logic', () => {
  it('identifies program start and end dates', () => {
    expect(PROGRAM_START_STR).toBe('2026-10-01')
    expect(PROGRAM_END_STR).toBe('2026-12-29')
  })

  it('calculates Day 1 correctly', () => {
    expect(getDayNumber('2026-10-01')).toBe(1)
  })

  it('calculates Day 45 correctly', () => {
    expect(getDayNumber('2026-11-14')).toBe(45)
  })

  it('calculates Day 90 correctly', () => {
    expect(getDayNumber('2026-12-29')).toBe(90)
  })

  it('returns null for dates outside the program', () => {
    expect(getDayNumber('2026-09-30')).toBeNull()
    expect(getDayNumber('2026-12-30')).toBeNull()
  })

  it('calculates streaks correctly', () => {
    const dates = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']
    const successDates = ['2026-10-01', '2026-10-02', '2026-10-03']
    
    // Test assumes today is mocked or it calculates based on today.
    // For unit testing pure functions, best streak should always match.
    const { best } = calculateStreak(dates, successDates)
    expect(best).toBe(3)
  })
})
