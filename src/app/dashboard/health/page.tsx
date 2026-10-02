import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber } from '@/lib/dates'
import { HealthContent } from '@/components/health/HealthContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Health' }

export default async function HealthPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = getTodayIST()
  const dayNumber = getTodayDayNumber()

  const [
    { data: gymLog },
    { data: waterLogs },
    { data: foodLogs },
    { data: wakeLog },
    { data: sleepLog },
    { data: profile },
    { data: gymHistory },
  ] = await Promise.all([
    supabase.from('gym_logs').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle(),
    supabase.from('water_logs').select('*').eq('user_id', user!.id).eq('date', today),
    supabase.from('habit_logs')
      .select('*, habits(name, category)')
      .eq('user_id', user!.id)
      .eq('date', today),
    supabase.from('wake_logs').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle(),
    supabase.from('sleep_logs').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle(),
    supabase.from('profiles').select('water_target_ml, wake_target_time').eq('user_id', user!.id).single(),
    supabase.from('gym_logs').select('date, status, workout_type').eq('user_id', user!.id).order('date', { ascending: false }).limit(30),
  ])

  const totalWaterMl = (waterLogs ?? []).reduce((s, w) => s + w.amount_ml, 0)
  const gymSessions = (gymHistory ?? []).filter(g => g.status === 'completed').length

  return (
    <HealthContent
      today={today}
      dayNumber={dayNumber}
      gymLog={gymLog ?? null}
      totalWaterMl={totalWaterMl}
      waterTarget={profile?.water_target_ml ?? 2500}
      wakeLog={wakeLog ?? null}
      sleepLog={sleepLog ?? null}
      wakeTarget={profile?.wake_target_time ?? '06:00'}
      gymHistory={gymHistory ?? []}
      gymSessions30Days={gymSessions}
      userId={user!.id}
    />
  )
}
