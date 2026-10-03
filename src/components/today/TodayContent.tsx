'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { formatDate, PROGRAM_DAYS } from '@/lib/dates'
import { HabitCard } from './HabitCard'
import { WaterTracker } from './WaterTracker'
import { GymLogger } from './GymLogger'
import { DailyReviewForm } from './DailyReviewForm'
import { DailyPlanForm } from './DailyPlanForm'
import type { Habit, HabitLog, GymLog, WaterLog, DailyReview, DailyPlan } from '@/types'
import type { DailyState } from '@/lib/daily-state'
import { getStatusColor, getStatusIcon, getStatusLabel } from '@/lib/daily-state'

interface TodayContentProps {
  today: string
  dayNumber: number | null
  dayOfWeek: string
  habits: Habit[]
  habitLogs: HabitLog[]
  gymLog: GymLog | null
  waterLogs: WaterLog[]
  totalWaterMl: number
  waterTarget: number
  review: DailyReview | null
  plan: DailyPlan | null
  userId: string
  dailyState: DailyState
}

type TabId = 'habits' | 'health' | 'review' | 'plan'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'habits', label: 'Habits', icon: '✅' },
  { id: 'health', label: 'Health', icon: '💪' },
  { id: 'review', label: 'Review', icon: '📝' },
  { id: 'plan', label: 'Plan', icon: '🎯' },
]

export function TodayContent({
  today,
  dayNumber,
  dayOfWeek,
  habits,
  habitLogs,
  gymLog,
  waterLogs,
  totalWaterMl,
  waterTarget,
  review,
  plan,
  userId,
  dailyState,
}: TodayContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>('habits')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const refresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  // Group habits by category
  const categories = [
    { id: 'discipline', label: 'DISCIPLINE', icon: '🔥' },
    { id: 'health', label: 'HEALTH', icon: '❤️' },
    { id: 'career', label: 'CAREER', icon: '💼' },
    { id: 'english', label: 'ENGLISH', icon: '🗣️' },
    { id: 'productivity', label: 'PRODUCTIVITY', icon: '⚡' },
    { id: 'creative', label: 'CREATIVE', icon: '🎬' },
    { id: 'optional', label: 'OPTIONAL', icon: '📎' },
  ]

  const logMap = new Map(habitLogs.map((l) => [l.habit_id, l]))

  // Use DailyState for completed count — accurate count from live state
  const mandatory = dailyState.habits.filter(h => !h.isOptional)
  const completed = mandatory.filter(h => h.status === 'completed' || h.status === 'recovery').length

  // Score from DailyState
  const score = dailyState.score

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <div className="flex items-baseline gap-3">
          {dayNumber && (
            <span className="day-counter">Day {dayNumber} / {PROGRAM_DAYS}</span>
          )}
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs">{dayOfWeek}</span>
        </div>
        <h1 className="text-2xl font-black text-foreground mt-1">
          {formatDate(today, 'MMMM d, yyyy')}
        </h1>

        {/* Score + Progress */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="bg-secondary/50 rounded-xl px-3 py-2">
            <p className="text-xs text-muted-foreground">Daily Score</p>
            <p className="text-xl font-black text-foreground">{score.total} <span className="text-xs font-normal text-muted-foreground">/ 100</span></p>
          </div>
          <div className="bg-secondary/50 rounded-xl px-3 py-2">
            <p className="text-xs text-muted-foreground">Habits Done</p>
            <p className="text-xl font-black text-foreground">{completed} <span className="text-xs font-normal text-muted-foreground">/ {mandatory.length}</span></p>
          </div>
        </div>

        {/* Completion bar */}
        <div className="mt-3 space-y-1">
          <div className="arc-progress">
            <div
              className="arc-progress-fill"
              style={{
                width: mandatory.length > 0 ? `${(completed / mandatory.length) * 100}%` : '0%',
              }}
            />
          </div>
          {score.pendingActivities > 0 && (
            <p className="text-xs text-muted-foreground">{score.pendingActivities} items not yet logged</p>
          )}
        </div>
      </div>

      {/* Quick Status Summary */}
      <div className="arc-card space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Today's State</p>
        <div className="grid grid-cols-2 gap-2">
          {/* Gym */}
          <div className="flex items-center gap-2 text-sm">
            <span>{getStatusIcon(dailyState.gym.status)}</span>
            <span className="text-foreground font-medium">Gym</span>
            <span className={cn('text-xs ml-auto', getStatusColor(dailyState.gym.status))}>
              {getStatusLabel(dailyState.gym.status)}
            </span>
          </div>
          {/* Water */}
          <div className="flex items-center gap-2 text-sm">
            <span>{getStatusIcon(dailyState.water.status)}</span>
            <span className="text-foreground font-medium">Water</span>
            <span className={cn('text-xs ml-auto', getStatusColor(dailyState.water.status))}>
              {dailyState.water.totalMl > 0
                ? `${(dailyState.water.totalMl / 1000).toFixed(1)}L`
                : 'Not logged'}
            </span>
          </div>
          {/* Career */}
          <div className="flex items-center gap-2 text-sm">
            <span>{getStatusIcon(dailyState.career.status)}</span>
            <span className="text-foreground font-medium">Career</span>
            <span className={cn('text-xs ml-auto', getStatusColor(dailyState.career.status))}>
              {dailyState.career.totalMinutes > 0
                ? `${dailyState.career.totalMinutes}m`
                : 'Not started'}
            </span>
          </div>
          {/* English */}
          <div className="flex items-center gap-2 text-sm">
            <span>{getStatusIcon(dailyState.english.status)}</span>
            <span className="text-foreground font-medium">English</span>
            <span className={cn('text-xs ml-auto', getStatusColor(dailyState.english.status))}>
              {dailyState.english.totalMinutes > 0
                ? `${dailyState.english.totalMinutes}m`
                : 'Not started'}
            </span>
          </div>
          {/* Reading */}
          <div className="flex items-center gap-2 text-sm">
            <span>{getStatusIcon(dailyState.reading.status)}</span>
            <span className="text-foreground font-medium">Reading</span>
            <span className={cn('text-xs ml-auto', getStatusColor(dailyState.reading.status))}>
              {dailyState.reading.pagesRead > 0
                ? `${dailyState.reading.pagesRead}p`
                : 'Not logged'}
            </span>
          </div>
          {/* Rapido */}
          {dailyState.rapido.logged && (
            <div className="flex items-center gap-2 text-sm">
              <span>🟢</span>
              <span className="text-foreground font-medium">Rapido</span>
              <span className="text-xs ml-auto text-green-400">
                ₹{dailyState.rapido.netEarnings}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-today-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all duration-200',
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'habits' && (
        <div className="space-y-6">
          {categories.map((cat) => {
            const catHabits = habits.filter((h) => h.category === cat.id)
            if (catHabits.length === 0) return null

            return (
              <div key={cat.id}>
                <p className="section-header">
                  {cat.icon} {cat.label}
                </p>
                <div className="space-y-2">
                  {catHabits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      log={logMap.get(habit.id) ?? null}
                      date={today}
                      onUpdate={refresh}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Standalone quick logs for Career, English, Reading (these are tracked separately) */}
          <div className="arc-card space-y-3">
            <p className="section-header">📊 Session Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Career sessions</span>
                <span className={cn('font-bold', getStatusColor(dailyState.career.status))}>
                  {dailyState.career.totalMinutes}m / {dailyState.career.targetMinutes}m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">English practice</span>
                <span className={cn('font-bold', getStatusColor(dailyState.english.status))}>
                  {dailyState.english.totalMinutes}m / {dailyState.english.targetMinutes}m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Reading</span>
                <span className={cn('font-bold', getStatusColor(dailyState.reading.status))}>
                  {dailyState.reading.pagesRead}p / {dailyState.reading.targetPages}p
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <a href="/dashboard/career" className="flex-1 text-center text-xs font-semibold py-2 rounded-xl bg-secondary border border-border hover:border-primary/30 hover:text-primary transition-colors">
                + Career
              </a>
              <a href="/dashboard/english" className="flex-1 text-center text-xs font-semibold py-2 rounded-xl bg-secondary border border-border hover:border-primary/30 hover:text-primary transition-colors">
                + English
              </a>
            </div>
          </div>

          {habits.length === 0 && (
            <div className="text-center py-10 space-y-3">
              <p className="text-4xl">📋</p>
              <p className="font-semibold text-foreground">No habits set up yet</p>
              <p className="text-sm text-muted-foreground">
                Go to Settings → Habits to add your Winter Arc habits
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'health' && (
        <div className="space-y-4">
          <GymLogger
            gymLog={gymLog}
            date={today}
            onUpdate={refresh}
          />
          <WaterTracker
            totalMl={totalWaterMl}
            target={waterTarget}
            date={today}
            onUpdate={refresh}
          />

          {/* Sleep summary */}
          {dailyState.sleep.status !== 'not_logged' && (
            <div className="arc-card space-y-2">
              <p className="section-header">😴 Sleep</p>
              <div className="flex items-baseline gap-2">
                <span className={cn('font-bold', getStatusColor(dailyState.sleep.status))}>
                  {dailyState.sleep.durationMinutes != null
                    ? `${Math.floor(dailyState.sleep.durationMinutes / 60)}h ${dailyState.sleep.durationMinutes % 60}m`
                    : 'Logged'}
                </span>
                <span className="text-muted-foreground text-sm">/ {dailyState.sleep.targetHours}h target</span>
              </div>
              <a href="/dashboard/health" className="text-xs text-primary font-semibold hover:underline">
                Edit sleep log →
              </a>
            </div>
          )}
        </div>
      )}

      {activeTab === 'review' && (
        <DailyReviewForm
          review={review}
          date={today}
          onUpdate={refresh}
        />
      )}

      {activeTab === 'plan' && (
        <DailyPlanForm
          plan={plan}
          date={today}
          onUpdate={refresh}
        />
      )}

      {isPending && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center z-50">
          <div className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
            Refreshing...
          </div>
        </div>
      )}
    </div>
  )
}
