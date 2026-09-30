import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber, PROGRAM_DAYS } from '@/lib/dates'
import { formatMinutes as fmtMin } from '@/lib/utils'
import { CareerContent } from '@/components/career/CareerContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Career Mode' }

export default async function CareerPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = getTodayIST()
  const dayNumber = getTodayDayNumber()

  // Fetch today's learning sessions
  const { data: todaySessions } = await supabase
    .from('learning_sessions')
    .select('*')
    .eq('user_id', user!.id)
    .eq('date', today)
    .order('created_at', { ascending: false })

  // Fetch all-time learning sessions for stats
  const { data: allSessions } = await supabase
    .from('learning_sessions')
    .select('date, minutes, topic')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })
    .limit(90)

  // Fetch job applications
  const { data: applications } = await supabase
    .from('job_applications')
    .select('id, company, role, status, date_applied, next_action')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch recent interviews
  const { data: interviews } = await supabase
    .from('interviews')
    .select('id, company, role, date, round, status')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })
    .limit(10)

  // Calculate stats
  const todayMinutes = (todaySessions ?? []).reduce((s, l) => s + l.minutes, 0)
  const weekSessions = (allSessions ?? []).filter(s => {
    const d = new Date(s.date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    return diff < 7
  })
  const weekMinutes = weekSessions.reduce((s, l) => s + l.minutes, 0)
  const totalMinutes = (allSessions ?? []).reduce((s, l) => s + l.minutes, 0)

  const activeApps = (applications ?? []).filter(a =>
    !['rejected', 'withdrawn', 'offer'].includes(a.status)
  ).length

  return (
    <CareerContent
      today={today}
      dayNumber={dayNumber}
      todaySessions={todaySessions ?? []}
      todayMinutes={todayMinutes}
      weekMinutes={weekMinutes}
      totalMinutes={totalMinutes}
      applications={applications ?? []}
      activeApplications={activeApps}
      interviews={interviews ?? []}
      userId={user!.id}
    />
  )
}
