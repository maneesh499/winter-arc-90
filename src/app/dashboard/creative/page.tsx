import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber } from '@/lib/dates'
import { CreativeContent } from '@/components/creative/CreativeContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Creative Mode' }

export default async function CreativePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = getTodayIST()

  const [
    { data: projects },
    { data: todaySessions },
    { data: recentSessions },
  ] = await Promise.all([
    supabase.from('creative_projects').select('*').eq('user_id', user!.id).order('updated_at', { ascending: false }),
    supabase.from('creative_sessions').select('*').eq('user_id', user!.id).eq('date', today),
    supabase.from('creative_sessions').select('date, minutes').eq('user_id', user!.id).order('date', { ascending: false }).limit(30),
  ])

  const todayMinutes = (todaySessions ?? []).reduce((s, c) => s + c.minutes, 0)
  const totalMinutes = (recentSessions ?? []).reduce((s, c) => s + c.minutes, 0)

  return (
    <CreativeContent
      today={today}
      projects={projects ?? []}
      todaySessions={todaySessions ?? []}
      todayMinutes={todayMinutes}
      totalMinutes={totalMinutes}
      userId={user!.id}
    />
  )
}
