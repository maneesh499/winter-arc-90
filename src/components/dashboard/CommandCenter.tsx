'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { PROGRAM_DAYS, formatDate } from '@/lib/dates'
import Link from 'next/link'
import type { DailyState, AttentionItem } from '@/lib/daily-state'
import { getStatusColor, getStatusBg, getStatusIcon } from '@/lib/daily-state'

interface CommandCenterProps {
  today: string
  dayNumber: number | null
  profile: { display_name?: string | null } | null
  dailyState: DailyState
}

export function CommandCenter({ today, dayNumber, profile, dailyState }: CommandCenterProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const hour = currentTime.getHours()
  const name = profile?.display_name?.split(' ')[0] || 'Champion'
  const { score, attention, nextAction, water, gym, career, english, reading, sleep, rapido, expenses, habits, review } = dailyState

  // Time-Aware Mode
  let modeName = 'DAY MODE'
  if (hour >= 5 && hour < 9) modeName = 'MORNING MODE'
  else if (hour >= 9 && hour < 17) modeName = 'WORK MODE'
  else if (hour >= 17 && hour < 21) modeName = 'CAREER MODE'
  else if (hour >= 21 || hour < 5) modeName = 'REVIEW MODE'
  const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6
  if (isWeekend && hour >= 9 && hour < 18) modeName = 'BUILD MODE'

  // Score status label
  const getSmartStatus = () => {
    if (score.pendingActivities > 0 && score.total === 0) return { label: 'Day in Progress', color: 'text-muted-foreground' }
    if (score.total >= 80) return { label: 'Strong', color: 'text-green-400' }
    if (score.total >= 60) return { label: 'Good', color: 'text-blue-400' }
    if (score.total >= 40) return { label: 'Average', color: 'text-yellow-400' }
    if (score.total > 0) return { label: 'Needs Attention', color: 'text-orange-400' }
    return { label: 'Day in Progress', color: 'text-muted-foreground' }
  }
  const smartStatus = getSmartStatus()

  // Split attention: pending vs complete
  const pendingItems = attention.filter(a => a.level !== 'complete')
  const completeItems = attention.filter(a => a.level === 'complete')

  return (
    <div className="space-y-6 animate-slide-up pb-24">

      {/* 1. STATUS HEADER */}
      <div>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">{modeName}</p>
        <h1 className="text-3xl font-black text-foreground mt-1">WINTER ARC 90</h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="day-counter">
            DAY {dayNumber ?? '—'} / {PROGRAM_DAYS}
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs">{formatDate(today, 'MMM d')}</span>
        </div>
      </div>

      {/* 2. SCORE + STATUS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="arc-card flex flex-col justify-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Daily Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-foreground">{score.total}</span>
            <span className="text-sm text-muted-foreground font-bold">/ 100</span>
          </div>
          {score.pendingActivities > 0 && (
            <p className="text-xs text-muted-foreground mt-1">{score.pendingActivities} not logged</p>
          )}
        </div>
        <div className="arc-card flex flex-col justify-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Status</p>
          <p className={`text-xl font-bold ${smartStatus.color}`}>{smartStatus.label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {score.completedActivities} / {score.totalActivities} done
          </p>
        </div>
      </div>

      {/* 3. SCORE BREAKDOWN */}
      <div className="arc-card space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Score Breakdown</p>
        <div className="space-y-1.5">
          {[
            { label: 'Discipline', value: score.discipline, weight: 20 },
            { label: 'Health', value: score.health, weight: 20 },
            { label: 'Career', value: score.career, weight: 25 },
            { label: 'English', value: score.english, weight: 10 },
            { label: 'Creative', value: score.creative, weight: 5 },
            { label: 'Productivity', value: score.productivity, weight: 15 },
          ].map((cat) => (
            <div key={cat.label} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20 shrink-0">{cat.label}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    cat.value >= 80 ? 'bg-green-500' : cat.value >= 50 ? 'bg-yellow-500' : cat.value > 0 ? 'bg-orange-500' : 'bg-secondary'
                  )}
                  style={{ width: `${cat.value}%` }}
                />
              </div>
              <span className="text-xs font-bold text-foreground w-8 text-right">{cat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. NEXT ACTION */}
      {nextAction && (
        <div className="arc-card border-primary/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
          <div className="relative">
            <p className="text-xs text-primary uppercase tracking-widest font-black mb-3">Next Action</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-foreground">{nextAction.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{nextAction.description}</p>
              </div>
              <Link
                href={nextAction.href}
                className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-sm hover:scale-105 transition-transform"
              >
                {nextAction.action}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. TODAY'S ACTIVITIES — Full State View */}
      <div className="space-y-3">
        <p className="section-header">Today's Activities</p>

        {/* Gym */}
        <ActivityRow
          icon="💪"
          label="Gym"
          status={gym.status === 'not_logged' ? 'not_logged' : gym.status === 'completed' ? 'completed' : gym.status === 'missed' ? 'missed' : 'recovery'}
          description={
            gym.status === 'completed'
              ? gym.workoutType ? `${gym.workoutType}${gym.durationMinutes ? ` · ${gym.durationMinutes}m` : ''}` : 'Completed'
              : gym.status === 'missed' ? 'Missed'
              : gym.status === 'recovery' ? 'Recovery day'
              : 'Not logged'
          }
          href="/dashboard/health"
          actionLabel="Log"
        />

        {/* Water */}
        <ActivityRow
          icon="💧"
          label="Water"
          status={water.status}
          description={
            water.status === 'completed'
              ? `${(water.totalMl / 1000).toFixed(1)}L / ${(water.targetMl / 1000).toFixed(1)}L ✓`
              : water.status === 'partial'
              ? `${(water.totalMl / 1000).toFixed(1)}L / ${(water.targetMl / 1000).toFixed(1)}L`
              : `0 / ${(water.targetMl / 1000).toFixed(1)}L`
          }
          href="/dashboard/today"
          actionLabel="Log Water"
          progress={water.status !== 'not_logged' ? water.percentage : undefined}
        />

        {/* Career */}
        <ActivityRow
          icon="💼"
          label={`Career`}
          status={career.status}
          description={
            career.status === 'completed'
              ? `${career.totalMinutes} / ${career.targetMinutes} min ✓`
              : career.status === 'partial'
              ? `${career.totalMinutes} / ${career.targetMinutes} min`
              : `0 / ${career.targetMinutes} min`
          }
          href="/dashboard/career"
          actionLabel="Log Session"
          progress={career.status !== 'not_logged' ? career.percentage : undefined}
        />

        {/* English */}
        <ActivityRow
          icon="🗣️"
          label="English"
          status={english.status}
          description={
            english.status === 'completed'
              ? `${english.totalMinutes} / ${english.targetMinutes} min ✓`
              : english.status === 'partial'
              ? `${english.totalMinutes} / ${english.targetMinutes} min`
              : `Not started`
          }
          href="/dashboard/english"
          actionLabel="Practice"
          progress={english.status !== 'not_logged' ? english.percentage : undefined}
        />

        {/* Reading */}
        <ActivityRow
          icon="📚"
          label="Reading"
          status={reading.status}
          description={
            reading.status === 'completed'
              ? `${reading.pagesRead} / ${reading.targetPages} pages ✓`
              : reading.status === 'partial'
              ? `${reading.pagesRead} / ${reading.targetPages} pages`
              : `0 / ${reading.targetPages} pages`
          }
          href="/dashboard/today"
          actionLabel="Log Reading"
          progress={reading.status !== 'not_logged' ? reading.percentage : undefined}
        />

        {/* Sleep */}
        <ActivityRow
          icon="😴"
          label="Sleep"
          status={sleep.status}
          description={
            sleep.status === 'not_logged'
              ? 'Not logged'
              : sleep.durationMinutes != null
              ? `${Math.floor(sleep.durationMinutes / 60)}h ${sleep.durationMinutes % 60}m / ${sleep.targetHours}h`
              : 'Partially entered'
          }
          href="/dashboard/health"
          actionLabel="Log Sleep"
        />

        {/* Discipline habits */}
        {habits.filter(h => h.category === 'discipline' && !h.isOptional).map(habit => (
          <ActivityRow
            key={habit.id}
            icon="🔥"
            label={habit.name}
            status={habit.status}
            description={
              habit.status === 'completed' ? 'Kept'
              : habit.status === 'missed' ? 'Failed'
              : habit.status === 'partial' ? 'Partial'
              : habit.status === 'recovery' ? 'Recovery'
              : 'Not logged'
            }
            href="/dashboard/today"
            actionLabel="Log"
          />
        ))}

        {/* Daily Review */}
        <ActivityRow
          icon="📝"
          label="Daily Review"
          status={review.status}
          description={
            review.status === 'completed' ? 'Review completed'
            : review.status === 'partial' ? 'Partially done'
            : 'Not completed'
          }
          href="/dashboard/today"
          actionLabel="Write Review"
        />

        {/* Rapido (optional) */}
        {rapido.logged && (
          <div className="flex items-center justify-between p-4 rounded-xl border bg-secondary/30 border-border">
            <div className="flex items-center gap-3">
              <span className="text-lg">🛵</span>
              <div>
                <p className="text-sm font-bold text-foreground">Rapido</p>
                <p className="text-xs text-muted-foreground">
                  ₹{rapido.netEarnings} net · {rapido.hours}h · {rapido.rides} rides
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-secondary text-muted-foreground border border-border">
              Optional
            </span>
          </div>
        )}

        {/* Expenses */}
        {expenses.totalAmount > 0 && (
          <div className="flex items-center justify-between p-4 rounded-xl border bg-secondary/30 border-border">
            <div className="flex items-center gap-3">
              <span className="text-lg">💸</span>
              <div>
                <p className="text-sm font-bold text-foreground">Expenses</p>
                <p className="text-xs text-muted-foreground">₹{expenses.totalAmount} today</p>
              </div>
            </div>
            <Link href="/dashboard/finance" className="text-xs text-primary font-semibold hover:underline">
              View →
            </Link>
          </div>
        )}
      </div>

      {/* 6. ATTENTION REQUIRED */}
      {pendingItems.length > 0 && pendingItems.filter(a => a.id !== nextAction?.id).length > 0 && (
        <div className="space-y-3">
          <p className="section-header">Attention Required</p>
          <div className="grid gap-2">
            {pendingItems
              .filter(a => a.id !== nextAction?.id)
              .map((alert) => (
                <div key={alert.id} className={cn(
                  "flex items-center justify-between p-4 rounded-xl border",
                  alert.level === 'high' ? 'bg-red-500/5 border-red-500/20' : 'bg-secondary border-border'
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      alert.level === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    )} />
                    <div>
                      <p className="text-sm font-bold text-foreground">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                  <Link href={alert.href} className="text-xs font-semibold text-primary hover:underline px-2 py-1">
                    {alert.action} →
                  </Link>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 7. ON TRACK */}
      {completeItems.length > 0 && (
        <div className="space-y-3">
          <p className="section-header text-green-400">On Track</p>
          <div className="flex flex-wrap gap-2">
            {completeItems.map((item) => (
              <span key={item.id} className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                ✓ {item.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 8. QUICK ACTIONS */}
      <div className="mt-6">
        <p className="section-header">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/dashboard/career" className="bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 p-3 rounded-xl flex items-center justify-between transition-colors">
            <span className="text-sm font-semibold">💼 Career</span>
            <span className="text-primary">→</span>
          </Link>
          <Link href="/dashboard/english" className="bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 p-3 rounded-xl flex items-center justify-between transition-colors">
            <span className="text-sm font-semibold">🗣️ English</span>
            <span className="text-primary">→</span>
          </Link>
          <Link href="/dashboard/health" className="bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 p-3 rounded-xl flex items-center justify-between transition-colors">
            <span className="text-sm font-semibold">💪 Health</span>
            <span className="text-primary">→</span>
          </Link>
          <Link href="/dashboard/finance" className="bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 p-3 rounded-xl flex items-center justify-between transition-colors">
            <span className="text-sm font-semibold">₹ Finance</span>
            <span className="text-primary">→</span>
          </Link>
          <Link href="/dashboard/today" className="bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 p-3 rounded-xl flex items-center justify-between transition-colors">
            <span className="text-sm font-semibold">✅ Today</span>
            <span className="text-primary">→</span>
          </Link>
          <Link href="/dashboard/rapido" className="bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 p-3 rounded-xl flex items-center justify-between transition-colors">
            <span className="text-sm font-semibold">🛵 Rapido</span>
            <span className="text-primary">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Activity Row Component ──────────────────────────────────────────────────

import type { ActivityStatus } from '@/lib/daily-state'

interface ActivityRowProps {
  icon: string
  label: string
  status: ActivityStatus
  description: string
  href: string
  actionLabel: string
  progress?: number
}

function ActivityRow({ icon, label, status, description, href, actionLabel, progress }: ActivityRowProps) {
  const statusColors: Record<ActivityStatus, string> = {
    completed: 'text-green-400',
    partial: 'text-yellow-400',
    missed: 'text-red-400',
    recovery: 'text-blue-400',
    skipped: 'text-gray-400',
    not_logged: 'text-muted-foreground',
    not_applicable: 'text-muted-foreground',
  }

  const statusIcons: Record<ActivityStatus, string> = {
    completed: '🟢',
    partial: '🟡',
    missed: '🔴',
    recovery: '🔵',
    skipped: '⚪',
    not_logged: '⚪',
    not_applicable: '—',
  }

  const bgClasses: Record<ActivityStatus, string> = {
    completed: 'bg-green-500/5 border-green-500/20',
    partial: 'bg-yellow-500/5 border-yellow-500/20',
    missed: 'bg-red-500/5 border-red-500/20',
    recovery: 'bg-blue-500/5 border-blue-500/20',
    skipped: 'bg-secondary/30 border-border',
    not_logged: 'bg-secondary/30 border-border',
    not_applicable: 'bg-secondary/30 border-border',
  }

  return (
    <div className={cn('p-4 rounded-xl border', bgClasses[status])}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-base">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">{label}</p>
              <span className="text-xs">{statusIcons[status]}</span>
            </div>
            <p className={cn('text-xs mt-0.5', statusColors[status])}>{description}</p>
            {progress !== undefined && progress > 0 && progress < 100 && (
              <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
        {status === 'not_logged' || status === 'partial' ? (
          <Link
            href={href}
            className="text-xs font-semibold text-primary hover:underline shrink-0 ml-2"
          >
            {actionLabel} →
          </Link>
        ) : null}
      </div>
    </div>
  )
}
