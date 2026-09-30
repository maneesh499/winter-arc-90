import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const format = req.nextUrl.searchParams.get('format') ?? 'json'

  try {
    // Fetch all user data
    const [
      { data: habits },
      { data: habitLogs },
      { data: gymLogs },
      { data: waterLogs },
      { data: wakeLogs },
      { data: sleepLogs },
      { data: learningSessions },
      { data: englishSessions },
      { data: englishVocab },
      { data: interviewAnswers },
      { data: creativeSessions },
      { data: creativeProjects },
      { data: rapido },
      { data: expenses },
      { data: income },
      { data: dailyReviews },
      { data: dailyPlans },
      { data: jobApplications },
      { data: interviews },
      { data: profile },
    ] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user.id),
      supabase.from('habit_logs').select('*').eq('user_id', user.id),
      supabase.from('gym_logs').select('*').eq('user_id', user.id),
      supabase.from('water_logs').select('*').eq('user_id', user.id),
      supabase.from('wake_logs').select('*').eq('user_id', user.id),
      supabase.from('sleep_logs').select('*').eq('user_id', user.id),
      supabase.from('learning_sessions').select('*').eq('user_id', user.id),
      supabase.from('english_sessions').select('*').eq('user_id', user.id),
      supabase.from('english_vocabulary').select('*').eq('user_id', user.id),
      supabase.from('english_interview_answers').select('*').eq('user_id', user.id),
      supabase.from('creative_sessions').select('*').eq('user_id', user.id),
      supabase.from('creative_projects').select('*').eq('user_id', user.id),
      supabase.from('rapido_entries').select('*').eq('user_id', user.id),
      supabase.from('expenses').select('*').eq('user_id', user.id),
      supabase.from('income_entries').select('*').eq('user_id', user.id),
      supabase.from('daily_reviews').select('*').eq('user_id', user.id),
      supabase.from('daily_plans').select('*').eq('user_id', user.id),
      supabase.from('job_applications').select('*').eq('user_id', user.id),
      supabase.from('interviews').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('display_name, wake_target_time, water_target_ml').eq('user_id', user.id).single(),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      user_email: user.email,
      profile,
      habits,
      habit_logs: habitLogs,
      gym_logs: gymLogs,
      water_logs: waterLogs,
      wake_logs: wakeLogs,
      sleep_logs: sleepLogs,
      learning_sessions: learningSessions,
      english_sessions: englishSessions,
      english_vocabulary: englishVocab,
      english_interview_answers: interviewAnswers,
      creative_sessions: creativeSessions,
      creative_projects: creativeProjects,
      rapido_entries: rapido,
      expenses,
      income_entries: income,
      daily_reviews: dailyReviews,
      daily_plans: dailyPlans,
      job_applications: jobApplications,
      interviews,
    }

    if (format === 'csv') {
      // Simple CSV of habit logs
      const rows = (habitLogs ?? []).map(l => `${l.date},${l.habit_id},${l.status},${l.value ?? ''},${l.notes ?? ''}`)
      const csv = ['date,habit_id,status,value,notes', ...rows].join('\n')
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="winter-arc-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    const json = JSON.stringify(exportData, null, 2)
    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="winter-arc-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
