import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber, formatDate, getDayOfWeek, PROGRAM_DAYS } from '@/lib/dates'
import { TodayContent } from '@/components/today/TodayContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Today' }

export default async function TodayPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = getTodayIST()
  const dayNumber = getTodayDayNumber()

  // Fetch habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('sort_order')

  // Fetch today's habit logs
  const { data: habitLogs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user!.id)
    .eq('date', today)

  // Fetch gym log
  const { data: gymLog } = await supabase
    .from('gym_logs')
    .select('*')
    .eq('user_id', user!.id)
    .eq('date', today)
    .single()

  // Fetch water logs
  const { data: waterLogs } = await supabase
    .from('water_logs')
    .select('*')
    .eq('user_id', user!.id)
    .eq('date', today)

  // Fetch today's daily review
  const { data: review } = await supabase
    .from('daily_reviews')
    .select('*')
    .eq('user_id', user!.id)
    .eq('date', today)
    .single()

  // Fetch today's plan
  const { data: plan } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', user!.id)
    .eq('date', today)
    .single()

  // Fetch profile for water target
  const { data: profile } = await supabase
    .from('profiles')
    .select('water_target_ml, wake_target_time')
    .eq('user_id', user!.id)
    .single()

  const totalWaterMl = (waterLogs ?? []).reduce((sum, w) => sum + w.amount_ml, 0)

  return (
    <TodayContent
      today={today}
      dayNumber={dayNumber}
      dayOfWeek={getDayOfWeek(today)}
      habits={habits ?? []}
      habitLogs={habitLogs ?? []}
      gymLog={gymLog ?? null}
      waterLogs={waterLogs ?? []}
      totalWaterMl={totalWaterMl}
      waterTarget={profile?.water_target_ml ?? 2500}
      review={review ?? null}
      plan={plan ?? null}
      userId={user!.id}
    />
  )
}
