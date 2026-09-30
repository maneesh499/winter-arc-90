import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber } from '@/lib/dates'
import { ReviewContent } from '@/components/progress/ReviewContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reviews' }

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = getTodayIST()
  const dayNumber = getTodayDayNumber()

  // Weekly data (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekStart = weekAgo.toISOString().split('T')[0]

  const [
    { data: weekMetrics },
    { data: weekReviews },
    { data: monthMetrics },
    { data: allGymSessions },
    { data: allEnglishSessions },
    { data: allVocabWords },
    { data: allApplications },
    { data: allInterviews },
    { data: allRapido },
    { data: allExpenses },
  ] = await Promise.all([
    supabase.from('daily_metrics').select('*').eq('user_id', user!.id).gte('date', weekStart).lte('date', today),
    supabase.from('daily_reviews').select('*').eq('user_id', user!.id).gte('date', weekStart),
    supabase.from('daily_metrics').select('*').eq('user_id', user!.id).gte('date', '2026-10-01').lte('date', today),
    supabase.from('gym_logs').select('date, status').eq('user_id', user!.id).gte('date', '2026-10-01'),
    supabase.from('english_sessions').select('date, minutes').eq('user_id', user!.id).gte('date', '2026-10-01'),
    supabase.from('english_vocabulary').select('date').eq('user_id', user!.id).gte('date', '2026-10-01'),
    supabase.from('job_applications').select('id, status').eq('user_id', user!.id),
    supabase.from('interviews').select('id, status').eq('user_id', user!.id),
    supabase.from('rapido_entries').select('net_earnings').eq('user_id', user!.id).gte('date', '2026-10-01'),
    supabase.from('expenses').select('amount').eq('user_id', user!.id).gte('date', '2026-10-01'),
  ])

  return (
    <ReviewContent
      today={today}
      dayNumber={dayNumber}
      initialTab={searchParams.tab ?? 'weekly'}
      weekMetrics={weekMetrics ?? []}
      weekReviews={weekReviews ?? []}
      monthMetrics={monthMetrics ?? []}
      gymSessions90={(allGymSessions ?? []).filter(g => g.status === 'completed').length}
      englishMinutes90={(allEnglishSessions ?? []).reduce((s, e) => s + e.minutes, 0)}
      vocabWords90={(allVocabWords ?? []).length}
      applications={(allApplications ?? []).length}
      interviews={(allInterviews ?? []).length}
      rapidoTotal90={(allRapido ?? []).reduce((s, r) => s + Number(r.net_earnings), 0)}
      expenses90={(allExpenses ?? []).reduce((s, e) => s + Number(e.amount), 0)}
    />
  )
}
