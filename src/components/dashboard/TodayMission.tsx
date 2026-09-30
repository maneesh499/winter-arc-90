'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface HabitLogEntry {
  id: string
  status: string
  habits: {
    name: string
    category: string
    is_optional: boolean
  } | null
}

interface TodayMissionProps {
  logs: HabitLogEntry[]
  isPreProgram?: boolean
}

const SECTIONS = [
  {
    id: 'morning',
    title: 'MORNING',
    icon: '🌅',
    categories: ['productivity', 'health'],
    keywords: ['Wake', 'Morning', 'Gym', 'Reading', 'Water', 'Breakfast', 'Routine'],
  },
  {
    id: 'discipline',
    title: 'DISCIPLINE',
    icon: '🔥',
    categories: ['discipline'],
    keywords: [],
  },
  {
    id: 'career',
    title: 'CAREER & ENGLISH',
    icon: '💼',
    categories: ['career', 'english'],
    keywords: [],
  },
  {
    id: 'evening',
    title: 'EVENING',
    icon: '🌙',
    categories: ['creative'],
    keywords: ['Creative', 'Time Audit'],
  },
  {
    id: 'night',
    title: 'NIGHT',
    icon: '⭐',
    categories: [],
    keywords: ['Daily Review', 'Plan tomorrow', 'Review'],
  },
]

function getStatusIcon(status: string | null) {
  switch (status) {
    case 'kept': return '✅'
    case 'failed': return '❌'
    case 'partial': return '🟡'
    case 'recovery': return '🔄'
    case 'skipped': return '⏭️'
    default: return '⬜'
  }
}

export function TodayMission({ logs, isPreProgram }: TodayMissionProps) {
  // Group logs by category
  const logsByCategory: Record<string, HabitLogEntry[]> = {}
  for (const log of logs) {
    if (log.habits?.is_optional) continue
    const cat = log.habits?.category ?? 'other'
    if (!logsByCategory[cat]) logsByCategory[cat] = []
    logsByCategory[cat].push(log)
  }

  const completedCount = logs.filter(
    (l) => l.status === 'kept' || l.status === 'recovery'
  ).length
  const totalCount = logs.filter((l) => !l.habits?.is_optional).length

  return (
    <div className="arc-card space-y-4">
      <div className="flex items-center justify-between">
        <p className="section-header">Today's Mission</p>
        <span className="text-xs font-bold text-muted-foreground">
          {completedCount} / {totalCount}
        </span>
      </div>

      {isPreProgram ? (
        <div className="text-center py-6 space-y-2">
          <p className="text-4xl">🏔️</p>
          <p className="text-sm text-muted-foreground">
            Program starts October 1, 2026
          </p>
          <p className="text-xs text-muted-foreground">
            Prepare your habits in Settings →
          </p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-6 space-y-3">
          <p className="text-4xl">📋</p>
          <p className="text-sm text-muted-foreground">No habits logged yet today</p>
          <Link
            href="/dashboard/today"
            className="inline-block bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm px-4 py-2 rounded-xl transition-all"
          >
            Log Today's Habits →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {SECTIONS.map((section) => {
            const sectionLogs = section.categories.flatMap(
              (cat) => logsByCategory[cat] || []
            )

            if (sectionLogs.length === 0 && !isPreProgram) {
              // Show placeholder for empty sections
              return (
                <div key={section.id}>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    {section.icon} {section.title}
                  </p>
                  <p className="text-xs text-muted-foreground italic pl-2">
                    No habits in this section — add some in Settings
                  </p>
                </div>
              )
            }

            return (
              <div key={section.id}>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  {section.icon} {section.title}
                </p>
                <ul className="space-y-1.5">
                  {sectionLogs.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-base">{getStatusIcon(log.status)}</span>
                      <span
                        className={cn(
                          log.status === 'kept' || log.status === 'recovery'
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        )}
                      >
                        {log.habits?.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      <Link
        href="/dashboard/today"
        className="block text-center text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
      >
        Open Today's Log →
      </Link>
    </div>
  )
}
