import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getAllProgramDates } from '@/lib/dates'
import { computeStreak } from '@/lib/score'

interface StreakCardsProps {
  userId: string
}

const STREAK_HABITS = [
  { key: 'no_porn', label: 'No Porn', icon: '🔥', category: 'discipline' },
  { key: 'gym', label: 'Gym', icon: '💪', source: 'gym_logs' },
  { key: 'reading', label: 'Reading', icon: '📚', category: 'health', habitName: 'Reading' },
  { key: 'english', label: 'English', icon: '🗣️', category: 'english' },
  { key: 'digital', label: 'Digital', icon: '📵', category: 'discipline', habitName: 'Digital Discipline' },
]

export async function StreakCards({ userId }: StreakCardsProps) {
  const supabase = createClient()

  // Fetch gym streaks
  const { data: gymLogs } = await supabase
    .from('gym_logs')
    .select('date, status')
    .eq('user_id', userId)
    .order('date')

  // Fetch habit logs
  const { data: habitLogs } = await supabase
    .from('habit_logs')
    .select('date, status, habits(name, category)')
    .eq('user_id', userId)
    .order('date')

  // Fetch english sessions
  const { data: englishSessions } = await supabase
    .from('english_sessions')
    .select('date')
    .eq('user_id', userId)
    .order('date')

  // Build streak for gym
  const gymMap = new Map<string, boolean>()
  for (const log of gymLogs ?? []) {
    gymMap.set(log.date, log.status === 'completed')
  }
  const gymStreak = computeStreak(gymMap)

  // Build streak for english
  const englishDates = new Set((englishSessions ?? []).map((s) => s.date))
  const programDates = getAllProgramDates()
  const englishMap = new Map<string, boolean>()
  for (const date of programDates) {
    if (date <= getTodayIST()) {
      englishMap.set(date, englishDates.has(date))
    }
  }
  const englishStreak = computeStreak(englishMap)

  // Build streaks per habit
  const habitMap: Map<string, Map<string, boolean>> = new Map()
  for (const log of habitLogs ?? []) {
    const habitName = (log.habits as unknown as { name: string })?.name
    if (!habitName) continue
    if (!habitMap.has(habitName)) habitMap.set(habitName, new Map())
    habitMap.get(habitName)!.set(
      log.date,
      log.status === 'kept' || log.status === 'recovery'
    )
  }

  const streaks = [
    { label: 'Gym', icon: '💪', streak: gymStreak },
    { label: 'English', icon: '🗣️', streak: englishStreak },
    {
      label: 'No Porn',
      icon: '🔥',
      streak: computeStreak(habitMap.get('No Porn') ?? new Map()),
    },
    {
      label: 'Digital',
      icon: '📵',
      streak: computeStreak(habitMap.get('Digital Discipline') ?? new Map()),
    },
  ]

  return (
    <div>
      <p className="section-header">Current Streaks</p>
      <div className="grid grid-cols-2 gap-3">
        {streaks.map((s) => (
          <div key={s.label} className="arc-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{s.icon}</span>
              <span className="text-sm font-semibold text-foreground">{s.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-primary">{s.streak.current}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: {s.streak.best}d
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
