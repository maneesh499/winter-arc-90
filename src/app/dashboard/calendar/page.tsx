import { createClient } from '@/lib/supabase/server'
import { getTodayIST } from '@/lib/dates'
import { CalendarContent } from '@/components/calendar/CalendarContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Calendar' }

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { date?: string; month?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = getTodayIST()

  // Determine which month to show
  const focusDate = searchParams.date ?? today
  const monthStr = searchParams.month ?? today.slice(0, 7)
  const [year, month] = monthStr.split('-').map(Number)
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = new Date(year, month, 1).toISOString().split('T')[0]
  const monthEnd = new Date(new Date(nextMonth).getTime() - 86400000).toISOString().split('T')[0]

  // Clamp to program dates
  const rangeStart = monthStart > '2026-10-01' ? monthStart : '2026-10-01'
  const rangeEnd = monthEnd < '2026-12-29' ? monthEnd : '2026-12-29'

  const [{ data: metrics }, { data: reviews }] = await Promise.all([
    supabase.from('daily_metrics').select('date, total_score, habits_completed, habits_total, gym_done, reading_pages')
      .eq('user_id', user!.id).gte('date', rangeStart).lte('date', rangeEnd),
    supabase.from('daily_reviews').select('date, went_well, mood, energy')
      .eq('user_id', user!.id).gte('date', rangeStart).lte('date', rangeEnd),
  ])

  return (
    <CalendarContent
      today={today}
      currentMonth={monthStr}
      focusDate={focusDate}
      metrics={metrics ?? []}
      reviews={reviews ?? []}
    />
  )
}
