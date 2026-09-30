import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber } from '@/lib/dates'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const today = getTodayIST()
  const dayNumber = getTodayDayNumber()

  if (!dayNumber) {
    return NextResponse.json({ message: 'Not within program dates', today })
  }

  try {
    // Get all active users in the program
    const { data: profiles } = await admin
      .from('profiles')
      .select('user_id, display_name')

    if (!profiles?.length) {
      return NextResponse.json({ message: 'No profiles found' })
    }

    let processed = 0

    for (const profile of profiles) {
      // Compute today's score and metrics if not already done
      const { data: existing } = await admin
        .from('daily_metrics')
        .select('id')
        .eq('user_id', profile.user_id)
        .eq('date', today)
        .single()

      if (!existing) {
        // Fetch data for scoring
        const [
          { data: habitLogs },
          { data: gymLog },
          { data: waterLogs },
          { data: learningSessions },
          { data: englishSessions },
          { data: readingLog },
        ] = await Promise.all([
          admin.from('habit_logs').select('*, habits(category, is_optional)').eq('user_id', profile.user_id).eq('date', today),
          admin.from('gym_logs').select('status').eq('user_id', profile.user_id).eq('date', today).single(),
          admin.from('water_logs').select('amount_ml').eq('user_id', profile.user_id).eq('date', today),
          admin.from('learning_sessions').select('minutes').eq('user_id', profile.user_id).eq('date', today),
          admin.from('english_sessions').select('minutes').eq('user_id', profile.user_id).eq('date', today),
          admin.from('habit_logs').select('value').eq('user_id', profile.user_id).eq('date', today)
            .eq('habit_id', admin.from('habits').select('id').eq('user_id', profile.user_id).eq('name', 'Reading').limit(1)),
        ])

        const gymDone = gymLog?.status === 'completed'
        const waterMl = (waterLogs ?? []).reduce((s, w) => s + w.amount_ml, 0)
        const careerMinutes = (learningSessions ?? []).reduce((s, l) => s + l.minutes, 0)
        const englishMinutes = (englishSessions ?? []).reduce((s, e) => s + e.minutes, 0)
        const habitsCompleted = (habitLogs ?? []).filter(l => l.status === 'kept' || l.status === 'recovery').length
        const habitsTotal = (habitLogs ?? []).filter(l => !(l.habits as any)?.is_optional).length

        // Simple score calculation
        const disciplineScore = habitsTotal > 0 ? (habitsCompleted / habitsTotal) * 100 : 0
        const careerScore = Math.min(100, (careerMinutes / 60) * 100)
        const englishScore = Math.min(100, (englishMinutes / 20) * 100)
        const gymScore = gymDone ? 100 : 0
        const waterScore = waterMl >= 2000 ? 100 : (waterMl / 2000) * 100

        const totalScore = Math.round(
          disciplineScore * 0.2 +
          gymScore * 0.15 +
          waterScore * 0.05 +
          careerScore * 0.25 +
          englishScore * 0.1 +
          (habitsCompleted > 0 ? 25 : 0)
        )

        await admin.from('daily_metrics').insert({
          user_id: profile.user_id,
          date: today,
          day_number: dayNumber,
          total_score: Math.min(100, totalScore),
          habits_completed: habitsCompleted,
          habits_total: habitsTotal,
          gym_done: gymDone,
          water_ml: waterMl,
          career_minutes: careerMinutes,
          english_minutes: englishMinutes,
          reading_pages: 0, // Will be updated by habit log
        })

        processed++
      }
    }

    return NextResponse.json({
      success: true,
      today,
      dayNumber,
      processed,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
