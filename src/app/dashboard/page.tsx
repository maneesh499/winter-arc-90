import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber, getProgramStatus, getDaysUntilStart, formatDate } from '@/lib/dates'
import { CommandCenter } from '@/components/dashboard/CommandCenter'
import { TodayMission } from '@/components/dashboard/TodayMission'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Winter Arc - Command Center' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = getTodayIST()
  const dayNumber = getTodayDayNumber()
  const status = getProgramStatus()

  // Pre-program state
  if (status === 'before') {
    const daysLeft = getDaysUntilStart()
    const { data: habitLogs } = await supabase.from('habit_logs').select('*, habits(name, category, is_optional)').eq('user_id', user!.id).eq('date', today)
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
        <TodayMission logs={habitLogs || []} isPreProgram />
      </div>
    )
  }

  // Fetch all intelligent domains in parallel
  const [
    { data: metrics },
    { data: profile },
    { data: habitLogs },
    { data: sleepLog },
    { data: wakeLog },
    { data: waterLogs },
    { data: gymLog },
    { data: learningSessions },
    { data: englishSessions },
    { data: plan },
    { data: review },
  ] = await Promise.all([
    supabase.from('daily_metrics').select('*').eq('user_id', user!.id).eq('date', today).single(),
    supabase.from('profiles').select('display_name').eq('user_id', user!.id).single(),
    supabase.from('habit_logs').select('*, habits(name, category, is_optional)').eq('user_id', user!.id).eq('date', today),
    supabase.from('sleep_logs').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle(),
    supabase.from('wake_logs').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle(),
    supabase.from('water_logs').select('amount_ml').eq('user_id', user!.id).eq('date', today),
    supabase.from('gym_logs').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle(),
    supabase.from('learning_sessions').select('minutes').eq('user_id', user!.id).eq('date', today),
    supabase.from('english_sessions').select('minutes').eq('user_id', user!.id).eq('date', today),
    supabase.from('daily_plans').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle(),
    supabase.from('daily_reviews').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle(),
  ])

  // Calculate aggregates
  const waterTotal = (waterLogs ?? []).reduce((sum, log) => sum + log.amount_ml, 0)
  const careerMinutes = (learningSessions ?? []).reduce((sum, session) => sum + session.minutes, 0)
  const englishMinutes = (englishSessions ?? []).reduce((sum, session) => sum + session.minutes, 0)

  return (
    <>
      <CommandCenter 
        today={today}
        dayNumber={dayNumber}
        profile={profile}
        metrics={metrics}
        habitLogs={habitLogs ?? []}
        sleep={sleepLog}
        wake={wakeLog}
        waterTotal={waterTotal}
        gym={gymLog}
        careerMinutes={careerMinutes}
        englishMinutes={englishMinutes}
        plan={plan}
        review={review}
      />
    </>
  )
}
