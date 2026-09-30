'use client'

import { useState } from 'react'
import { cn, formatCurrency } from '@/lib/utils'
import { PROGRAM_DAYS } from '@/lib/dates'
import { createClient } from '@/lib/supabase/client'

interface ReviewContentProps {
  today: string
  dayNumber: number | null
  initialTab: string
  weekMetrics: any[]
  weekReviews: any[]
  monthMetrics: any[]
  gymSessions90: number
  englishMinutes90: number
  vocabWords90: number
  applications: number
  interviews: number
  rapidoTotal90: number
  expenses90: number
}

const TABS = [
  { id: 'weekly', label: 'Weekly', icon: '📅' },
  { id: 'monthly', label: 'Monthly', icon: '📆' },
  { id: 'final', label: '90-Day', icon: '🏆' },
]

export function ReviewContent({
  today,
  dayNumber,
  initialTab,
  weekMetrics,
  weekReviews,
  monthMetrics,
  gymSessions90,
  englishMinutes90,
  vocabWords90,
  applications,
  interviews,
  rapidoTotal90,
  expenses90,
}: ReviewContentProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [weeklyForm, setWeeklyForm] = useState({
    biggest_win: '',
    biggest_challenge: '',
    why_happened: '',
    what_change: '',
    next_top_1: '',
    next_top_2: '',
    next_top_3: '',
  })
  const [finalForm, setFinalForm] = useState({
    what_changed: '',
    what_learned: '',
    what_continue: '',
    what_stop: '',
    next_90_goal: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  // Week stats
  const weekLogged = weekMetrics.filter(m => m.total_score > 0).length
  const weekAvgScore = weekLogged > 0
    ? Math.round(weekMetrics.reduce((s, m) => s + m.total_score, 0) / weekLogged)
    : 0
  const weekCareer = weekMetrics.reduce((s, m) => s + (m.career_minutes || 0), 0)
  const weekEnglish = weekMetrics.reduce((s, m) => s + (m.english_minutes || 0), 0)
  const weekReading = weekMetrics.reduce((s, m) => s + (m.reading_pages || 0), 0)
  const weekGym = weekMetrics.filter(m => m.gym_done).length

  // Month stats
  const monthLogged = monthMetrics.filter(m => m.total_score > 0).length
  const monthAvgScore = monthLogged > 0
    ? Math.round(monthMetrics.reduce((s, m) => s + m.total_score, 0) / monthLogged)
    : 0
  const monthCareer = monthMetrics.reduce((s, m) => s + (m.career_minutes || 0), 0)
  const monthEnglish = monthMetrics.reduce((s, m) => s + (m.english_minutes || 0), 0)

  // 90-day stats
  const totalLogged = monthMetrics.filter(m => m.total_score > 0).length
  const totalAvgScore = monthLogged > 0
    ? Math.round(monthMetrics.reduce((s, m) => s + m.total_score, 0) / totalLogged)
    : 0
  const totalCareer = monthMetrics.reduce((s, m) => s + (m.career_minutes || 0), 0)

  const handleSaveWeekly = async () => {
    setSaving(true)
    await supabase.from('weekly_plans').upsert({
      week_start: (() => { const d = new Date(today); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().split('T')[0] })(),
      ...weeklyForm,
    }, { onConflict: 'user_id,week_start' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveFinal = async () => {
    setSaving(true)
    await supabase.from('daily_reviews').upsert({
      date: '2026-12-29',
      ...finalForm,
    }, { onConflict: 'user_id,date' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const is90DayComplete = dayNumber !== null && dayNumber >= 90

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        {dayNumber && <p className="day-counter">Day {dayNumber} / {PROGRAM_DAYS}</p>}
        <h1 className="text-2xl font-black text-foreground mt-1">Reviews</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-review-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all',
              activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* WEEKLY */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <div className="arc-card space-y-3">
            <p className="section-header">This Week</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-black text-primary">{weekAvgScore}%</p>
                <p className="text-xs text-muted-foreground">Avg score</p>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{weekGym}</p>
                <p className="text-xs text-muted-foreground">Gym sessions</p>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{weekReading}</p>
                <p className="text-xs text-muted-foreground">Pages read</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-lg font-bold text-foreground">{Math.floor(weekCareer / 60)}h {weekCareer % 60}m</p>
                <p className="text-xs text-muted-foreground">Career prep</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-lg font-bold text-foreground">{weekEnglish}m</p>
                <p className="text-xs text-muted-foreground">English</p>
              </div>
            </div>
          </div>

          <div className="arc-card space-y-4">
            <p className="section-header">Weekly Reflection</p>
            {[
              { key: 'biggest_win', label: 'Biggest win this week', placeholder: 'What went well?' },
              { key: 'biggest_challenge', label: 'Biggest challenge', placeholder: 'What was hard?' },
              { key: 'why_happened', label: 'Why did it happen?', placeholder: 'Root cause…' },
              { key: 'what_change', label: 'What will I change?', placeholder: 'One concrete change…' },
            ].map(q => (
              <div key={q.key} className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{q.label}</label>
                <textarea
                  value={(weeklyForm as any)[q.key]}
                  onChange={(e) => setWeeklyForm(f => ({ ...f, [q.key]: e.target.value }))}
                  placeholder={q.placeholder}
                  rows={2}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Next week's Top 3</label>
              {[
                { key: 'next_top_1', num: 1 },
                { key: 'next_top_2', num: 2 },
                { key: 'next_top_3', num: 3 },
              ].map(t => (
                <div key={t.key} className="flex items-center gap-2">
                  <span className="text-xs font-black text-primary w-4">{t.num}.</span>
                  <input
                    type="text"
                    value={(weeklyForm as any)[t.key]}
                    onChange={(e) => setWeeklyForm(f => ({ ...f, [t.key]: e.target.value }))}
                    placeholder={`Priority ${t.num}…`}
                    className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              ))}
            </div>

            <button
              id="weekly-review-save"
              onClick={handleSaveWeekly}
              disabled={saving}
              className={`w-full font-bold py-3 rounded-xl text-sm transition-all ${
                saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Weekly Review'}
            </button>
          </div>
        </div>
      )}

      {/* MONTHLY */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          <div className="arc-card space-y-3">
            <p className="section-header">90-Day Totals</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Avg score', value: `${totalAvgScore}%` },
                { label: 'Days logged', value: `${totalLogged}` },
                { label: 'Gym sessions', value: gymSessions90 },
                { label: 'Career prep', value: `${Math.floor(totalCareer / 60)}h` },
                { label: 'English', value: `${Math.floor(englishMinutes90 / 60)}h` },
                { label: 'Vocabulary', value: `${vocabWords90} words` },
                { label: 'Applications', value: applications },
                { label: 'Interviews', value: interviews },
                { label: 'Rapido income', value: formatCurrency(rapidoTotal90) },
                { label: 'Total expenses', value: formatCurrency(expenses90) },
              ].map(s => (
                <div key={s.label} className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="arc-card space-y-3">
            <p className="section-header">Monthly Averages</p>
            {[
              { month: 'October', start: '2026-10-01', end: '2026-10-31' },
              { month: 'November', start: '2026-11-01', end: '2026-11-30' },
              { month: 'December', start: '2026-12-01', end: '2026-12-29' },
            ].map(m => {
              const mData = monthMetrics.filter(d => d.date >= m.start && d.date <= m.end)
              const mLogged = mData.filter(d => d.total_score > 0).length
              const mAvg = mLogged > 0 ? Math.round(mData.reduce((s, d) => s + d.total_score, 0) / mLogged) : 0
              const mGym = mData.filter(d => d.gym_done).length
              return (
                <div key={m.month} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{m.month}</p>
                    <p className="text-xs text-muted-foreground">{mLogged} days logged · {mGym} gym sessions</p>
                  </div>
                  <p className="text-xl font-black text-primary">{mAvg}%</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* FINAL 90-DAY */}
      {activeTab === 'final' && (
        <div className="space-y-4">
          <div className="arc-card text-center py-6 space-y-2">
            <p className="text-4xl">🏆</p>
            <h2 className="text-xl font-black text-foreground">Winter Arc — 90 Days</h2>
            <p className="text-sm text-muted-foreground">Oct 1 → Dec 29, 2026</p>
          </div>

          {!is90DayComplete && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
              <p className="text-sm text-blue-400">
                Complete this final review on Day 90 (December 29, 2026). You can write your reflections anytime.
              </p>
            </div>
          )}

          <div className="arc-card space-y-4">
            <p className="section-header">Final Reflection</p>
            {[
              { key: 'what_changed', label: 'What changed in 90 days?', placeholder: 'How are you different now?' },
              { key: 'what_learned', label: 'What did I learn?', placeholder: 'Key lessons…' },
              { key: 'what_continue', label: 'What should I continue?', placeholder: 'Keep doing…' },
              { key: 'what_stop', label: 'What should I stop?', placeholder: 'Let go of…' },
              { key: 'next_90_goal', label: 'Next 90-day goal', placeholder: 'The next chapter…' },
            ].map(q => (
              <div key={q.key} className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{q.label}</label>
                <textarea
                  value={(finalForm as any)[q.key]}
                  onChange={(e) => setFinalForm(f => ({ ...f, [q.key]: e.target.value }))}
                  placeholder={q.placeholder}
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            ))}

            <button
              id="final-review-save"
              onClick={handleSaveFinal}
              disabled={saving}
              className={`w-full font-bold py-3 rounded-xl text-sm transition-all ${
                saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Final Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
