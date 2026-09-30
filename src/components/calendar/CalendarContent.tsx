'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn, getHeatmapClass } from '@/lib/utils'
import { getDayNumber } from '@/lib/dates'

interface CalendarContentProps {
  today: string
  currentMonth: string
  focusDate: string
  metrics: Array<{ date: string; total_score: number; habits_completed: number; habits_total: number; gym_done: boolean; reading_pages: number }>
  reviews: Array<{ date: string; went_well: string | null; mood: number | null; energy: number | null }>
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getCalendarDays(monthStr: string): (string | null)[] {
  const [year, month] = monthStr.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const days: (string | null)[] = []

  // Pad to Monday start
  let startPad = (firstDay.getDay() + 6) % 7
  for (let i = 0; i < startPad; i++) days.push(null)

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }

  return days
}

export function CalendarContent({ today, currentMonth, focusDate, metrics, reviews }: CalendarContentProps) {
  const [selected, setSelected] = useState<string | null>(focusDate !== today ? focusDate : null)
  const [month, setMonth] = useState(currentMonth)
  const router = useRouter()

  const [year, monthNum] = month.split('-').map(Number)
  const calDays = getCalendarDays(month)
  const metricsMap = new Map(metrics.map(m => [m.date, m]))
  const reviewsMap = new Map(reviews.map(r => [r.date, r]))

  const selectedMetric = selected ? metricsMap.get(selected) : null
  const selectedReview = selected ? reviewsMap.get(selected) : null
  const selectedDayNum = selected ? getDayNumber(selected) : null

  const prevMonth = () => {
    const d = new Date(year, monthNum - 2, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const nextMonth = () => {
    const d = new Date(year, monthNum, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const monthName = new Date(year, monthNum - 1).toLocaleString('default', { month: 'long', year: 'numeric' })

  // Clamp to program dates
  const canGoPrev = month > '2026-10'
  const canGoNext = month < '2026-12'

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-foreground">Calendar</h1>
        <p className="text-sm text-muted-foreground">Winter Arc — Oct 1 to Dec 29, 2026</p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-30 transition-all text-foreground"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="font-bold text-foreground">{monthName}</h2>
        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-30 transition-all text-foreground"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Calendar grid */}
      <div className="arc-card p-0 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calDays.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="aspect-square border-b border-r border-border/30" />
            }

            const metric = metricsMap.get(date)
            const score = metric?.total_score
            const isToday = date === today
            const isFuture = date > today
            const isSelected = date === selected
            const isProgram = date >= '2026-10-01' && date <= '2026-12-29'
            const dayNum = parseInt(date.split('-')[2])

            return (
              <button
                key={date}
                id={`cal-${date}`}
                onClick={() => isProgram ? setSelected(selected === date ? null : date) : undefined}
                disabled={!isProgram || isFuture}
                className={cn(
                  'aspect-square border-b border-r border-border/30 flex flex-col items-center justify-start pt-1 gap-0.5 transition-all text-xs',
                  !isProgram && 'opacity-20 cursor-default',
                  isFuture && 'opacity-40 cursor-default',
                  isSelected && 'bg-primary/10',
                  isToday && 'bg-primary/5',
                  isProgram && !isFuture && 'cursor-pointer hover:bg-secondary/50'
                )}
              >
                <span className={cn(
                  'w-5 h-5 flex items-center justify-center rounded-full text-xs font-semibold',
                  isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                )}>
                  {dayNum}
                </span>
                {score !== undefined && !isFuture && (
                  <span className={cn(
                    'w-4 h-1.5 rounded-sm',
                    score >= 80 ? 'bg-green-500/70' :
                    score >= 60 ? 'bg-yellow-500/70' :
                    score >= 40 ? 'bg-orange-500/70' :
                    'bg-red-500/40'
                  )} />
                )}
                {metric?.gym_done && <span className="text-xs">💪</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && (
        <div className="arc-card space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-foreground">
              {selectedDayNum ? `Day ${selectedDayNum} — ` : ''}{new Date(selected + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          </div>

          {selectedMetric ? (
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-secondary/50 rounded-lg py-2">
                <p className="font-bold text-primary">{selectedMetric.total_score}%</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div className="bg-secondary/50 rounded-lg py-2">
                <p className="font-bold text-foreground">{selectedMetric.habits_completed}/{selectedMetric.habits_total}</p>
                <p className="text-xs text-muted-foreground">Habits</p>
              </div>
              <div className="bg-secondary/50 rounded-lg py-2">
                <p className="font-bold text-foreground">{selectedMetric.reading_pages}p</p>
                <p className="text-xs text-muted-foreground">Pages</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data for this day</p>
          )}

          {selectedReview?.went_well && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">What went well</p>
              <p className="text-sm text-foreground">{selectedReview.went_well}</p>
            </div>
          )}

          {selected <= today && (
            <Link
              href={`/dashboard/today?date=${selected}`}
              className="text-xs text-primary font-semibold hover:underline block"
            >
              View full day →
            </Link>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-green-500/70 inline-block" /> Strong</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-yellow-500/70 inline-block" /> Good</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-orange-500/70 inline-block" /> Average</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-red-500/40 inline-block" /> Low</span>
      </div>
    </div>
  )
}
