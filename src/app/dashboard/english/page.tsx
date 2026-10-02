import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber, getISTDateNDaysAgo } from '@/lib/dates'
import { EnglishContent } from '@/components/english/EnglishContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'English Communication' }

export default async function EnglishPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = getTodayIST()
  const dayNumber = getTodayDayNumber()

  // Use IST-safe date (not toISOString which gives UTC)
  const weekStr = getISTDateNDaysAgo(7)

  const [
    { data: todaySessions },
    { data: todayVocab },
    { data: interviewAnswers },
    { data: weekSessions },
    { count: totalVocabCount },
  ] = await Promise.all([
    // Today's English sessions
    supabase
      .from('english_sessions')
      .select('*')
      .eq('user_id', user!.id)
      .eq('date', today)
      .order('created_at', { ascending: false }),

    // Today's vocabulary
    supabase
      .from('english_vocabulary')
      .select('*')
      .eq('user_id', user!.id)
      .eq('date', today)
      .order('created_at', { ascending: false }),

    // Interview answers
    supabase
      .from('english_interview_answers')
      .select('*')
      .eq('user_id', user!.id)
      .order('last_practiced', { ascending: false, nullsFirst: false }),

    // This week's sessions for stats
    supabase
      .from('english_sessions')
      .select('date, minutes, activity_type')
      .eq('user_id', user!.id)
      .gte('date', weekStr),

    // All-time vocab count
    supabase
      .from('english_vocabulary')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id),
  ])

  const todayMinutes = (todaySessions ?? []).reduce((s, e) => s + e.minutes, 0)
  const weekMinutes = (weekSessions ?? []).reduce((s, e) => s + e.minutes, 0)

  // Breakdown by activity type today
  const activityBreakdown = (todaySessions ?? []).reduce((acc, s) => {
    acc[s.activity_type] = (acc[s.activity_type] || 0) + s.minutes
    return acc
  }, {} as Record<string, number>)

  return (
    <EnglishContent
      today={today}
      dayNumber={dayNumber}
      todaySessions={todaySessions ?? []}
      todayVocab={todayVocab ?? []}
      interviewAnswers={interviewAnswers ?? []}
      todayMinutes={todayMinutes}
      weekMinutes={weekMinutes}
      totalVocabCount={totalVocabCount ?? 0}
      activityBreakdown={activityBreakdown}
      userId={user!.id}
    />
  )
}
