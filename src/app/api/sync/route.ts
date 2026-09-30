import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { table, operation, data, id } = body

    // Allowlist of tables for offline sync
    const ALLOWED_TABLES = [
      'habit_logs', 'gym_logs', 'water_logs', 'wake_logs', 'sleep_logs',
      'learning_sessions', 'english_sessions', 'english_vocabulary',
      'english_interview_answers', 'creative_sessions', 'rapido_entries',
      'expenses', 'income_entries', 'daily_reviews', 'daily_plans',
    ]

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 400 })
    }

    // Always inject user_id to prevent spoofing
    const secureData = { ...data, user_id: user.id }

    let result
    if (operation === 'insert') {
      result = await supabase.from(table).insert(secureData)
    } else if (operation === 'update' && id) {
      result = await supabase.from(table).update(secureData).eq('id', id).eq('user_id', user.id)
    } else if (operation === 'delete' && id) {
      result = await supabase.from(table).delete().eq('id', id).eq('user_id', user.id)
    } else {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
