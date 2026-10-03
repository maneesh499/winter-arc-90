import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber, formatDate, getDayOfWeek, PROGRAM_DAYS } from '@/lib/dates'
import { assembleDailyState } from '@/lib/daily-state'
import { TodayContent } from '@/components/today/TodayContent'
import { toZonedTime } from 'date-fns-tz'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Today' }

export default async function TodayPage() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return <div className="p-8 text-red-400">Authentication error. Please log in again.</div>
  }

  const today = getTodayIST()
  const dayNumber = getTodayDayNumber()

  // Get IST hour for attention engine
  const nowIST = toZonedTime(new Date(), 'Asia/Kolkata')
  const currentHourIST = nowIST.getHours()

  // Fetch all data needed — use maybeSingle() for single-row tables to avoid errors
  const [
    { data: habits },
    { data: habitLogs },
    { data: gymLog },
    { data: waterLogs },
    { data: sleepLog },
    { data: wakeLog },
    { data: careerSessions },
    { data: englishSessions },
    { data: bookProgressSessions },
    { data: rapidoEntry },
    { data: expenseEntries },
    { data: review },
    { data: plan },
    { data: profile },
  ] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true).order('sort_order'),
    supabase.from('habit_logs').select('id, habit_id, status, value, notes').eq('user_id', user.id).eq('date', today),
    // FIX: was .single() which throws PGRST116 when no row — use maybeSingle()
    supabase.from('gym_logs').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
    supabase.from('water_logs').select('id, amount_ml, logged_at').eq('user_id', user.id).eq('date', today),
    supabase.from('sleep_logs').select('id, bedtime, wake_time, quality, notes').eq('user_id', user.id).eq('date', today).maybeSingle(),
    supabase.from('wake_logs').select('id, wake_time, status').eq('user_id', user.id).eq('date', today).maybeSingle(),
    supabase.from('learning_sessions').select('id, topic, minutes, date, notes').eq('user_id', user.id).eq('date', today),
    supabase.from('english_sessions').select('id, activity_type, minutes, date, notes').eq('user_id', user.id).eq('date', today),
    supabase.from('book_progress').select('id, pages_read, date, book_id').eq('user_id', user.id).eq('date', today),
    supabase.from('rapido_entries').select('id, gross_earnings, fuel_cost, net_earnings, hours, rides').eq('user_id', user.id).eq('date', today).maybeSingle(),
    supabase.from('expenses').select('id, category, amount, description').eq('user_id', user.id).eq('date', today),
    // FIX: was .single() — changed to maybeSingle()
    supabase.from('daily_reviews').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
    // FIX: was .single() — changed to maybeSingle()
    supabase.from('daily_plans').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
    supabase.from('profiles').select('water_target_ml, wake_target_time').eq('user_id', user.id).maybeSingle(),
  ])

  // Assemble unified DailyState
  const dailyState = assembleDailyState({
    date: today,
    habits: habits ?? [],
    habitLogs: (habitLogs ?? []) as Array<{ id: string; habit_id: string; status: 'kept' | 'failed' | 'partial' | 'skipped' | 'recovery'; value: number | null; notes: string | null }>,
    waterLogs: (waterLogs ?? []) as Array<{ id: string; amount_ml: number; logged_at: string }>,
    waterTargetMl: profile?.water_target_ml ?? 2500,
    gymLog: gymLog ?? null,
    sleepLog: sleepLog ?? null,
    careerSessions: (careerSessions ?? []) as Array<{ id: string; topic: string; minutes: number; date: string; notes: string | null }>,
    englishSessions: (englishSessions ?? []) as Array<{ id: string; activity_type: string; minutes: number; date: string; notes: string | null }>,
    bookProgressSessions: (bookProgressSessions ?? []) as Array<{ id: string; pages_read: number; date: string; book_id: string }>,
    rapidoEntry: rapidoEntry ?? null,
    expenseEntries: (expenseEntries ?? []) as Array<{ id: string; category: string; amount: number; description: string | null }>,
    wakeLog: wakeLog ?? null,
    wakeTargetTime: profile?.wake_target_time ?? '06:00',
    reviewLog: review ?? null,
  }, currentHourIST)

  const totalWaterMl = (waterLogs ?? []).reduce((s, w) => s + w.amount_ml, 0)

  return (
    <TodayContent
      today={today}
      dayNumber={dayNumber}
      dayOfWeek={getDayOfWeek(today)}
      habits={habits ?? []}
      habitLogs={(habitLogs ?? []) as any[]}
      gymLog={gymLog ?? null}
      waterLogs={(waterLogs ?? []) as any[]}
      totalWaterMl={totalWaterMl}
      waterTarget={profile?.water_target_ml ?? 2500}
      review={review ?? null}
      plan={plan ?? null}
      userId={user.id}
      dailyState={dailyState}
    />
  )
}
