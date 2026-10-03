import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber, getProgramStatus, getDaysUntilStart, formatDate } from '@/lib/dates'
import { assembleDailyState } from '@/lib/daily-state'
import { CommandCenter } from '@/components/dashboard/CommandCenter'
import type { Metadata } from 'next'
import { toZonedTime } from 'date-fns-tz'

export const metadata: Metadata = { title: 'Winter Arc - Command Center' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return <div className="p-8 text-red-400">Authentication error. Please log in again.</div>
  }

  const today = getTodayIST()
  const dayNumber = getTodayDayNumber()
  const status = getProgramStatus()

  // Get current IST hour for attention engine
  const nowIST = toZonedTime(new Date(), 'Asia/Kolkata')
  const currentHourIST = nowIST.getHours()

  // Pre-program state
  if (status === 'before') {
    const daysLeft = getDaysUntilStart()
    return (
      <div className="space-y-6 animate-slide-up pb-24">
        <div className="arc-card text-center py-10 space-y-4">
          <div className="text-6xl font-black text-primary">{daysLeft}</div>
          <p className="text-xl font-bold text-foreground">Days until Winter Arc begins</p>
          <p className="text-muted-foreground text-sm">
            Starting {formatDate('2026-10-01', 'MMMM d, yyyy')} · Asia/Kolkata
          </p>
          <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Use this time to:</p>
            <ul className="space-y-1 text-left">
              <li>• Set up your habits in Settings</li>
              <li>• Plan your 90-day goals</li>
              <li>• Enable notifications</li>
              <li>• Review your career roadmap</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Fetch ALL data needed for DailyState in parallel
  // Use maybeSingle() for single-row queries to avoid errors when no row exists
  const [
    { data: habits, error: habitsError },
    { data: habitLogs },
    { data: waterLogs },
    { data: gymLog },
    { data: sleepLog },
    { data: wakeLog },
    { data: careerSessions },
    { data: englishSessions },
    { data: bookProgressSessions },
    { data: rapidoEntry },
    { data: expenseEntries },
    { data: reviewLog },
    { data: profile },
  ] = await Promise.all([
    // Habits config — the program schedule
    supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true).order('sort_order'),
    // Today's habit logs
    supabase.from('habit_logs').select('id, habit_id, status, value, notes').eq('user_id', user.id).eq('date', today),
    // Water logs (multiple per day)
    supabase.from('water_logs').select('id, amount_ml, logged_at').eq('user_id', user.id).eq('date', today),
    // Gym (single per day) — use maybeSingle to not throw on missing row
    supabase.from('gym_logs').select('id, status, workout_type, duration_minutes, notes').eq('user_id', user.id).eq('date', today).maybeSingle(),
    // Sleep (single per day)
    supabase.from('sleep_logs').select('id, bedtime, wake_time, quality, notes').eq('user_id', user.id).eq('date', today).maybeSingle(),
    // Wake log
    supabase.from('wake_logs').select('id, wake_time, status').eq('user_id', user.id).eq('date', today).maybeSingle(),
    // Career sessions (multiple per day)
    supabase.from('learning_sessions').select('id, topic, minutes, date, notes').eq('user_id', user.id).eq('date', today),
    // English sessions (multiple per day)
    supabase.from('english_sessions').select('id, activity_type, minutes, date, notes').eq('user_id', user.id).eq('date', today),
    // Book progress (reading)
    supabase.from('book_progress').select('id, pages_read, date, book_id').eq('user_id', user.id).eq('date', today),
    // Rapido (single per day)
    supabase.from('rapido_entries').select('id, gross_earnings, fuel_cost, net_earnings, hours, rides').eq('user_id', user.id).eq('date', today).maybeSingle(),
    // Expenses today
    supabase.from('expenses').select('id, category, amount, description').eq('user_id', user.id).eq('date', today),
    // Daily review
    supabase.from('daily_reviews').select('id, went_well, distracted_by, improve_tomorrow, tomorrow_priority, mood, energy').eq('user_id', user.id).eq('date', today).maybeSingle(),
    // Profile for targets
    supabase.from('profiles').select('display_name, water_target_ml, wake_target_time').eq('user_id', user.id).maybeSingle(),
  ])

  if (habitsError) {
    console.error('[DashboardPage] Failed to load habits:', habitsError)
  }

  // Assemble DailyState — this is the single source of truth
  const dailyState = assembleDailyState({
    date: today,
    habits: habits ?? [],
    habitLogs: habitLogs ?? [],
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
    reviewLog: reviewLog ?? null,
  }, currentHourIST)

  return (
    <CommandCenter
      today={today}
      dayNumber={dayNumber}
      profile={profile}
      dailyState={dailyState}
    />
  )
}
