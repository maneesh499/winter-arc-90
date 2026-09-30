'use client'

import { useState } from 'react'
import { cn, getHeatmapClass, formatMinutes } from '@/lib/utils'
import { getAllProgramDates, getDayNumber, formatDate, PROGRAM_DAYS } from '@/lib/dates'
import Link from 'next/link'

interface ProgressContentProps {
  today: string
  dayNumber: number | null
  dailyMetrics: Array<{
    date: string
    total_score: number
    habits_completed: number
    habits_total: number
    gym_done: boolean
    reading_pages: number
    career_minutes: number
    english_minutes: number
    creative_minutes: number
    water_ml: number
  }>
  gymSessions: number
  gymCurrentStreak: number
  gymBestStreak: number
  totalCareerMinutes: number
  totalEnglishMinutes: number
  totalReadingPages: number
  loggedDays: number
  avgScore: number
}

export function ProgressContent({
  today,
  dayNumber,
  dailyMetrics,
  gymSessions,
  gymCurrentStreak,
  gymBestStreak,
  totalCareerMinutes,
  totalEnglishMinutes,
  totalReadingPages,
  loggedDays,
  avgScore,
}: ProgressContentProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const allDates = getAllProgramDates()
  const metricsMap = new Map(dailyMetrics.map(m => [m.date, m]))
  const programProgress = dayNumber ? Math.round((dayNumber / PROGRAM_DAYS) * 100) : 0

  const selectedMetric = selectedDay ? metricsMap.get(selectedDay) : null
  const selectedDayNum = selectedDay ? getDayNumber(selectedDay) : null

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        {dayNumber && <p className="day-counter">Day {dayNumber} / {PROGRAM_DAYS}</p>}
        <h1 className="text-2xl font-black text-foreground mt-1">Winter Arc — 90 Days</h1>
        <p className="text-sm text-muted-foreground">Oct 1 → Dec 29, 2026</p>
      </div>

      {/* Program progress */}
      <div className="arc-card space-y-3">
        <div className="flex justify-between items-baseline">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Program Progress</p>
          <span className="text-2xl font-black text-primary">{programProgress}%</span>
        </div>
        <div className="arc-progress">
          <div className="arc-progress-fill" style={{ width: `${programProgress}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Day 1 · Oct 1</span>
          <span>{loggedDays} days logged</span>
          <span>Day 90 · Dec 29</span>
        </div>
      </div>

      {/* 90-Day Heatmap */}
      <div className="arc-card space-y-3">
        <p className="section-header">90-Day Heatmap</p>
        <p className="text-xs text-muted-foreground">Click any day to see details</p>
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
          {allDates.map((date) => {
            const metric = metricsMap.get(date)
            const score = metric?.total_score ?? null
            const isFuture = date > today
            const isToday = date === today
            const dayNum = getDayNumber(date)

            return (
              <button
                key={date}
                id={`heatmap-day-${dayNum}`}
                onClick={() => setSelectedDay(selectedDay === date ? null : date)}
                disabled={isFuture}
                title={`Day ${dayNum}: ${score !== null ? `${score}%` : 'Not logged'}`}
                className={cn(
                  'heatmap-cell aspect-square rounded-sm transition-all',
                  isFuture ? 'opacity-20 cursor-default' : 'cursor-pointer hover:ring-1 hover:ring-primary',
                  isToday && 'ring-1 ring-primary',
                  selectedDay === date && 'ring-2 ring-primary',
                  score !== null ? getHeatmapClass(score) : 'heatmap-empty'
                )}
              />
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><span className="heatmap-cell heatmap-full inline-block w-3 h-3 rounded-sm" /> Strong (80%+)</span>
          <span className="flex items-center gap-1"><span className="heatmap-cell heatmap-high inline-block w-3 h-3 rounded-sm" /> Good (60–79%)</span>
          <span className="flex items-center gap-1"><span className="heatmap-cell heatmap-medium inline-block w-3 h-3 rounded-sm" /> Average (40–59%)</span>
          <span className="flex items-center gap-1"><span className="heatmap-cell heatmap-low inline-block w-3 h-3 rounded-sm" /> Low (&lt;40%)</span>
          <span className="flex items-center gap-1"><span className="heatmap-cell heatmap-empty inline-block w-3 h-3 rounded-sm" /> Not logged</span>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="arc-card space-y-3 border-primary/20">
          <div className="flex items-center justify-between">
            <p className="font-bold text-foreground">Day {selectedDayNum} — {formatDate(selectedDay, 'EEE, MMM d')}</p>
            <button onClick={() => setSelectedDay(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          </div>
          {selectedMetric ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Score: </span><span className="font-bold text-foreground">{selectedMetric.total_score}%</span></div>
              <div><span className="text-muted-foreground">Habits: </span><span className="font-bold text-foreground">{selectedMetric.habits_completed}/{selectedMetric.habits_total}</span></div>
              <div><span className="text-muted-foreground">Career: </span><span className="font-bold text-foreground">{selectedMetric.career_minutes}m</span></div>
              <div><span className="text-muted-foreground">English: </span><span className="font-bold text-foreground">{selectedMetric.english_minutes}m</span></div>
              <div><span className="text-muted-foreground">Reading: </span><span className="font-bold text-foreground">{selectedMetric.reading_pages}p</span></div>
              <div><span className="text-muted-foreground">Gym: </span><span className={`font-bold ${selectedMetric.gym_done ? 'text-green-400' : 'text-muted-foreground'}`}>{selectedMetric.gym_done ? 'Yes' : 'No'}</span></div>
              <div><span className="text-muted-foreground">Water: </span><span className="font-bold text-foreground">{(selectedMetric.water_ml / 1000).toFixed(1)}L</span></div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data logged for this day</p>
          )}
          <Link
            href={`/dashboard/calendar?date=${selectedDay}`}
            className="text-xs text-primary font-semibold hover:underline"
          >
            View full day →
          </Link>
        </div>
      )}

      {/* Overall stats */}
      <div>
        <p className="section-header">90-Day Stats</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Avg score', value: `${avgScore}%`, color: 'text-primary' },
            { label: 'Days logged', value: `${loggedDays}/90`, color: 'text-foreground' },
            { label: 'Gym sessions', value: gymSessions, color: 'text-foreground' },
            { label: 'Gym streak', value: `${gymCurrentStreak}d`, color: 'text-orange-400' },
            { label: 'Career prep', value: `${Math.floor(totalCareerMinutes / 60)}h`, color: 'text-foreground' },
            { label: 'English', value: `${Math.floor(totalEnglishMinutes / 60)}h`, color: 'text-foreground' },
            { label: 'Pages read', value: totalReadingPages, color: 'text-foreground' },
            { label: 'Gym best streak', value: `${gymBestStreak}d`, color: 'text-foreground' },
          ].map((stat) => (
            <div key={stat.label} className="arc-card">
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly breakdown */}
      <div>
        <p className="section-header">Monthly breakdown</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { month: 'October', start: '2026-10-01', end: '2026-10-31', days: 31 },
            { month: 'November', start: '2026-11-01', end: '2026-11-30', days: 30 },
            { month: 'December', start: '2026-12-01', end: '2026-12-29', days: 29 },
          ].map((m) => {
            const monthMetrics = dailyMetrics.filter(d => d.date >= m.start && d.date <= m.end)
            const monthLogged = monthMetrics.filter(d => d.total_score > 0).length
            const monthAvg = monthLogged > 0
              ? Math.round(monthMetrics.reduce((s, d) => s + d.total_score, 0) / monthLogged)
              : 0
            return (
              <div key={m.month} className="arc-card text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase">{m.month.slice(0, 3)}</p>
                <p className="text-xl font-black text-foreground mt-1">{monthAvg}%</p>
                <p className="text-xs text-muted-foreground">{monthLogged}/{m.days}d</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review links */}
      <div className="arc-card space-y-2">
        <p className="section-header">Reviews</p>
        <div className="space-y-1">
          {[
            { href: '/dashboard/review', label: 'Weekly Review →' },
            { href: '/dashboard/review?tab=monthly', label: 'Monthly Review →' },
            { href: '/dashboard/review?tab=final', label: '90-Day Final Review →' },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="block text-sm text-primary font-semibold hover:text-primary/80 transition-colors py-1">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
