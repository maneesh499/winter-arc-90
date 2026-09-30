import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber, getProgramStatus, getDaysUntilStart, getDaysRemaining, formatDate, PROGRAM_DAYS } from '@/lib/dates'
import { ScoreRing } from '@/components/dashboard/ScoreRing'
import { QuickStats } from '@/components/dashboard/QuickStats'
import { StreakCards } from '@/components/dashboard/StreakCards'
import { TodayMission } from '@/components/dashboard/TodayMission'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = getTodayIST()
  const dayNumber = getTodayDayNumber()
  const status = getProgramStatus()

  // Fetch today's metrics
  const { data: metrics } = await supabase
    .from('daily_metrics')
    .select('*')
    .eq('user_id', user!.id)
    .eq('date', today)
    .single()

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('user_id', user!.id)
    .single()

  // Fetch today's habit logs
  const { data: habitLogs } = await supabase
    .from('habit_logs')
    .select('*, habits(name, category, is_optional)')
    .eq('user_id', user!.id)
    .eq('date', today)

  // Get greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = profile?.display_name?.split(' ')[0] || 'Champion'

  // Countdown if before program
  if (status === 'before') {
    const daysLeft = getDaysUntilStart()
    return (
      <div className="space-y-6 animate-slide-up">
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

  // Completion review if after program
  if (status === 'completed') {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="arc-card text-center py-10 space-y-4">
          <div className="text-5xl">🏆</div>
          <h1 className="text-3xl font-black text-foreground">WINTER ARC COMPLETE</h1>
          <p className="text-muted-foreground">90 days. Done.</p>
          <Link
            href="/dashboard/progress"
            className="inline-block bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl"
          >
            View 90-Day Review →
          </Link>
        </div>
      </div>
    )
  }

  const score = metrics?.total_score ?? 0
  const habitsCompleted = metrics?.habits_completed ?? 0
  const habitsTotal = metrics?.habits_total ?? 0
  const progress = PROGRAM_DAYS > 0 ? Math.round(((dayNumber ?? 0) / PROGRAM_DAYS) * 100) : 0

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm font-medium">{greeting},</p>
        <h1 className="text-3xl font-black text-foreground">{name}</h1>
        <div className="flex items-center gap-3">
          <span className="day-counter">
            DAY {dayNumber} / {PROGRAM_DAYS}
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs">{formatDate(today, 'EEEE, MMM d')}</span>
        </div>
      </div>

      {/* Score + Progress */}
      <div className="grid grid-cols-2 gap-4">
        <ScoreRing score={score} />
        <div className="arc-card space-y-3">
          <p className="section-header">Program</p>
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-2xl font-black text-foreground">{progress}%</span>
              <span className="text-xs text-muted-foreground">{getDaysRemaining()}d left</span>
            </div>
            <div className="arc-progress">
              <div className="arc-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{habitsCompleted}/{habitsTotal} today</span>
            <span>Oct → Dec</span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <QuickStats metrics={metrics} />

      {/* Today's mission */}
      <TodayMission logs={habitLogs || []} />

      {/* Module quick links */}
      <div>
        <p className="section-header">Modules</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/dashboard/career', label: 'Career Mode', icon: '💼', desc: 'Job prep & learning' },
            { href: '/dashboard/english', label: 'English', icon: '🗣️', desc: 'Speaking & vocab' },
            { href: '/dashboard/health', label: 'Health', icon: '💪', desc: 'Gym, food, water' },
            { href: '/dashboard/creative', label: 'Creative', icon: '🎬', desc: 'Films & writing' },
            { href: '/dashboard/finance', label: 'Finance', icon: '₹', desc: 'Income & expenses' },
            { href: '/dashboard/progress', label: 'Progress', icon: '📈', desc: '90-day view' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="arc-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Streak cards */}
      <StreakCards userId={user!.id} />
    </div>
  )
}
