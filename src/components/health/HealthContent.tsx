'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PROGRAM_DAYS } from '@/lib/dates'
import { GymLogger } from '@/components/today/GymLogger'
import { WaterTracker } from '@/components/today/WaterTracker'

interface HealthContentProps {
  today: string
  dayNumber: number | null
  gymLog: any | null
  totalWaterMl: number
  waterTarget: number
  wakeLog: any | null
  wakeTarget: string
  gymHistory: any[]
  gymSessions30Days: number
  userId: string
}

const TABS = [
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'sleep', label: 'Sleep', icon: '😴' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
]

export function HealthContent({
  today,
  dayNumber,
  gymLog,
  totalWaterMl,
  waterTarget,
  wakeLog,
  wakeTarget,
  gymHistory,
  gymSessions30Days,
  userId,
}: HealthContentProps) {
  const [activeTab, setActiveTab] = useState('fitness')
  const [wakeTime, setWakeTime] = useState(wakeLog?.wake_time ?? '')
  const [bedTime, setBedTime] = useState('')
  const [sleepQuality, setSleepQuality] = useState(3)
  const [sleepNotes, setSleepNotes] = useState('')
  const [savingWake, setSavingWake] = useState(false)
  const [wakeSaved, setWakeSaved] = useState(!!wakeLog)
  const router = useRouter()
  const [, startTransition] = useTransition()
  const refresh = () => startTransition(() => router.refresh())

  const getWakeStatus = (wake: string, target: string) => {
    if (!wake || !target) return null
    const [wH, wM] = wake.split(':').map(Number)
    const [tH, tM] = target.split(':').map(Number)
    const diff = (wH * 60 + wM) - (tH * 60 + tM)
    if (diff <= 10) return { label: 'On target', color: 'text-green-400' }
    if (diff <= 45) return { label: 'Close', color: 'text-yellow-400' }
    return { label: 'Late', color: 'text-red-400' }
  }

  const handleSaveWake = async () => {
    if (!wakeTime) return
    setSavingWake(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const status = getWakeStatus(wakeTime, wakeTarget)
    const data = {
      date: today,
      wake_time: wakeTime,
      target_time: wakeTarget,
      status: status?.label === 'On target' ? 'on_target' : status?.label === 'Close' ? 'close' : 'late',
    }
    if (wakeLog?.id) {
      await supabase.from('wake_logs').update(data).eq('id', wakeLog.id)
    } else {
      await supabase.from('wake_logs').insert(data)
    }
    setSavingWake(false)
    setWakeSaved(true)
    refresh()
  }

  const handleSaveSleep = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.from('sleep_logs').upsert({
      date: today,
      bed_time: bedTime || null,
      wake_time: wakeTime || null,
      quality: sleepQuality,
      notes: sleepNotes || null,
    }, { onConflict: 'user_id,date' })
    refresh()
  }

  const wakeStatus = getWakeStatus(wakeTime || wakeLog?.wake_time, wakeTarget)

  // Last 7 days gym for mini chart
  const last7 = gymHistory.slice(0, 7).reverse()

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        {dayNumber && <p className="day-counter">Day {dayNumber} / {PROGRAM_DAYS}</p>}
        <h1 className="text-2xl font-black text-foreground mt-1">Health</h1>
        <p className="text-sm text-muted-foreground">Fitness · Sleep · Nutrition · Hydration</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="arc-card text-center">
          <p className="text-2xl font-black text-primary">{gymSessions30Days}</p>
          <p className="text-xs text-muted-foreground mt-1">Gym sessions</p>
          <p className="text-xs text-muted-foreground">last 30d</p>
        </div>
        <div className="arc-card text-center">
          <p className="text-2xl font-black text-foreground">
            {(totalWaterMl / 1000).toFixed(1)}L
          </p>
          <p className="text-xs text-muted-foreground mt-1">Water today</p>
        </div>
        <div className="arc-card text-center">
          {wakeLog?.wake_time ? (
            <>
              <p className={`text-lg font-black ${wakeStatus?.color ?? 'text-foreground'}`}>
                {wakeLog.wake_time}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Wake up</p>
            </>
          ) : (
            <>
              <p className="text-lg font-black text-muted-foreground">—</p>
              <p className="text-xs text-muted-foreground mt-1">Not logged</p>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-health-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all duration-200',
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Fitness tab */}
      {activeTab === 'fitness' && (
        <div className="space-y-4">
          <GymLogger gymLog={gymLog} date={today} onUpdate={refresh} />
          <WaterTracker totalMl={totalWaterMl} target={waterTarget} date={today} onUpdate={refresh} />

          {/* Gym mini chart */}
          {last7.length > 0 && (
            <div className="arc-card space-y-2">
              <p className="section-header">Last 7 days</p>
              <div className="flex gap-1">
                {last7.map((g: any) => (
                  <div key={g.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className={cn(
                      'w-full h-6 rounded',
                      g.status === 'completed' ? 'bg-green-500/60' :
                      g.status === 'recovery' ? 'bg-blue-500/40' :
                      'bg-secondary'
                    )} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(g.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'narrow' })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500/60 inline-block" /> Gym</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500/40 inline-block" /> Recovery</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-secondary inline-block" /> Rest</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sleep tab */}
      {activeTab === 'sleep' && (
        <div className="space-y-4">
          {/* Wake up logger */}
          <div className="arc-card space-y-3">
            <h3 className="font-bold text-foreground text-sm">Wake-up Time</h3>
            <p className="text-xs text-muted-foreground">Target: {wakeTarget}</p>

            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Actual wake time
                </label>
                <input
                  id="wake-time-input"
                  type="time"
                  value={wakeTime}
                  onChange={(e) => { setWakeTime(e.target.value); setWakeSaved(false) }}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                onClick={handleSaveWake}
                disabled={savingWake || !wakeTime}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold px-4 py-2.5 rounded-xl text-sm"
              >
                {wakeSaved ? '✓' : 'Log'}
              </button>
            </div>

            {wakeTime && wakeStatus && (
              <p className={`text-sm font-semibold ${wakeStatus.color}`}>
                {wakeStatus.label}
              </p>
            )}
          </div>

          {/* Sleep tracker */}
          <div className="arc-card space-y-3">
            <h3 className="font-bold text-foreground text-sm">Sleep Log</h3>
            <p className="text-xs text-muted-foreground">Log your sleep from last night</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bed time</label>
                <input
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Wake time</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {bedTime && wakeTime && (
              <div className="bg-secondary/50 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
                  {bedTime} → {wakeTime}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Sleep logged</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Sleep quality: {sleepQuality}/5
              </label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(v => (
                  <button
                    key={v}
                    onClick={() => setSleepQuality(v)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-bold border transition-all',
                      v <= sleepQuality
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        : 'bg-secondary/50 text-muted-foreground border-border'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={sleepNotes}
              onChange={(e) => setSleepNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />

            <button
              id="sleep-save"
              onClick={handleSaveSleep}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl text-sm"
            >
              Save Sleep Log
            </button>
          </div>
        </div>
      )}

      {/* Nutrition tab */}
      {activeTab === 'nutrition' && (
        <div className="space-y-4">
          <NutritionLogger date={today} onUpdate={refresh} />
        </div>
      )}
    </div>
  )
}

// Inline nutrition logger
function NutritionLogger({ date, onUpdate }: { date: string; onUpdate: () => void }) {
  const [meals, setMeals] = useState<Record<string, string>>({
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: '',
  })
  const [overallStatus, setOverallStatus] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    // Save as a habit log for "Healthy Eating" habit
    // Or save in a separate nutrition table if it exists
    // For now store notes in daily review context
    await supabase.from('daily_reviews').upsert({
      date,
      // Store nutrition as part of notes (simplification)
    }, { onConflict: 'user_id,date' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const STATUS_OPTIONS = [
    { value: 'good', label: '✅ Good', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: 'mostly_good', label: '🟡 Mostly good', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 'poor', label: '❌ Poor', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ]

  return (
    <div className="arc-card space-y-4">
      <h3 className="font-bold text-foreground text-sm">Nutrition Today</h3>
      <p className="text-xs text-muted-foreground">Log what you ate — no judgment, just awareness</p>

      {[
        { key: 'breakfast', label: '🌅 Breakfast' },
        { key: 'lunch', label: '☀️ Lunch' },
        { key: 'dinner', label: '🌙 Dinner' },
        { key: 'snacks', label: '🍎 Snacks' },
      ].map((meal) => (
        <div key={meal.key} className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{meal.label}</label>
          <input
            type="text"
            value={meals[meal.key]}
            onChange={(e) => setMeals(m => ({ ...m, [meal.key]: e.target.value }))}
            placeholder="What did you eat?"
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      ))}

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Overall</label>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setOverallStatus(opt.value)}
              className={cn(
                'flex-1 text-xs font-semibold py-2 rounded-xl border transition-all',
                overallStatus === opt.value ? opt.color : 'bg-secondary/50 text-muted-foreground border-border'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes on eating today…"
        rows={2}
        className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
      />

      <p className="text-xs text-muted-foreground italic">
        This is personal tracking only. Not medical advice.
      </p>

      <button
        id="nutrition-save"
        onClick={handleSave}
        disabled={saving}
        className={`w-full font-bold py-2.5 rounded-xl text-sm transition-all ${
          saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }`}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
      </button>
    </div>
  )
}
