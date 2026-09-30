import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber, getAllProgramDates, getDayNumber } from '@/lib/dates'
import { ProgressContent } from '@/components/progress/ProgressContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '90-Day Progress' }

export default async function ProgressPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = getTodayIST()
  const dayNumber = getTodayDayNumber()

  // Fetch all daily metrics for the 90 days
  const { data: dailyMetrics } = await supabase
    .from('daily_metrics')
    .select('date, total_score, habits_completed, habits_total, gym_done, reading_pages, career_minutes, english_minutes, creative_minutes, water_ml')
    .eq('user_id', user!.id)
    .gte('date', '2026-10-01')
    .lte('date', '2026-12-29')
    .order('date')

  // Fetch habit logs for streak calculations
  const { data: gymLogs } = await supabase
    .from('gym_logs')
    .select('date, status')
    .eq('user_id', user!.id)
    .gte('date', '2026-10-01')
    .lte('date', '2026-12-29')

  // Stats aggregation
  const metricMap = new Map((dailyMetrics ?? []).map(m => [m.date, m]))
  const gymMap = new Map((gymLogs ?? []).map(g => [g.date, g.status === 'completed']))

  // Streak calculations
  const allDates = getAllProgramDates()
  const todayOrLess = allDates.filter(d => d <= today)

  let gymCurrent = 0, gymBest = 0, gymStreak = 0
  for (const d of allDates) {
    if (gymMap.get(d)) { gymStreak++; gymBest = Math.max(gymBest, gymStreak) }
    else gymStreak = 0
  }
  for (let i = todayOrLess.length - 1; i >= 0; i--) {
    if (gymMap.get(todayOrLess[i])) gymCurrent++
    else break
  }

  // Overall stats
  const totalCareerMinutes = (dailyMetrics ?? []).reduce((s, m) => s + (m.career_minutes || 0), 0)
  const totalEnglishMinutes = (dailyMetrics ?? []).reduce((s, m) => s + (m.english_minutes || 0), 0)
  const totalReadingPages = (dailyMetrics ?? []).reduce((s, m) => s + (m.reading_pages || 0), 0)
  const gymSessions = Array.from(gymMap.values()).filter(Boolean).length
  const loggedDays = (dailyMetrics ?? []).filter(m => m.total_score > 0).length
  const avgScore = loggedDays > 0
    ? Math.round((dailyMetrics ?? []).reduce((s, m) => s + m.total_score, 0) / loggedDays)
    : 0

  return (
    <ProgressContent
      today={today}
      dayNumber={dayNumber}
      dailyMetrics={dailyMetrics ?? []}
      gymSessions={gymSessions}
      gymCurrentStreak={gymCurrent}
      gymBestStreak={gymBest}
      totalCareerMinutes={totalCareerMinutes}
      totalEnglishMinutes={totalEnglishMinutes}
      totalReadingPages={totalReadingPages}
      loggedDays={loggedDays}
      avgScore={avgScore}
    />
  )
}
