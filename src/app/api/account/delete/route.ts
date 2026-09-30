import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const admin = createAdminClient()

    // Delete all user data from all tables (RLS won't apply for admin client)
    const TABLES = [
      'habits', 'habit_logs', 'gym_logs', 'water_logs', 'wake_logs', 'sleep_logs',
      'learning_sessions', 'english_sessions', 'english_vocabulary', 'english_interview_answers',
      'creative_sessions', 'creative_projects', 'rapido_entries', 'expenses', 'income_entries',
      'daily_reviews', 'daily_plans', 'daily_metrics', 'job_applications', 'interviews',
      'notification_preferences', 'push_subscriptions', 'weekly_plans', 'profiles', 'user_badges',
    ]

    for (const table of TABLES) {
      await admin.from(table).delete().eq('user_id', user.id)
    }

    // Delete the auth user last
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Account deletion failed' }, { status: 500 })
  }
}
