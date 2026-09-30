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
    { id: 'career', label: 'CAREER', icon: '💼' },
    { id: 'english', label: 'ENGLISH', icon: '🗣️' },
    { id: 'productivity', label: 'PRODUCTIVITY', icon: '⚡' },
    { id: 'creative', label: 'CREATIVE', icon: '🎬' },
    { id: 'optional', label: 'OPTIONAL', icon: '📎' },
  ]

  const logMap = new Map(habitLogs.map((l) => [l.habit_id, l]))

  // Completed count
  const mandatory = habits.filter((h) => !h.is_optional)
  const completed = mandatory.filter((h) => {
    const log = logMap.get(h.id)
    return log?.status === 'kept' || log?.status === 'recovery'
  }).length

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

        {/* Completion bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Habits</span>
            <span className="font-semibold text-foreground">
              {completed} / {mandatory.length}
            </span>
          </div>
          <div className="arc-progress">
            <div
              className="arc-progress-fill"
              style={{
                width: mandatory.length > 0
                  ? `${(completed / mandatory.length) * 100}%`
                  : '0%',
              }}
            />
          </div>
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
    </div>
  )
}
