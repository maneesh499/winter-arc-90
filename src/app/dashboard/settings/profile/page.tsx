'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProfileSettingsPage() {
  const [displayName, setDisplayName] = useState('')
  const [wakeTarget, setWakeTarget] = useState('06:00')
  const [sleepTarget, setSleepTarget] = useState('22:30')
  const [waterTarget, setWaterTarget] = useState(2500)
  const [monthlyIncome, setMonthlyIncome] = useState(23600)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.from('profiles').select('*').single().then(({ data }) => {
      if (data) {
        setDisplayName(data.display_name ?? '')
        setWakeTarget(data.wake_target_time ?? '06:00')
        setSleepTarget(data.sleep_target_time ?? '22:30')
        setWaterTarget(data.water_target_ml ?? 2500)
        setMonthlyIncome(data.monthly_income ?? 23600)
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').upsert({
      user_id: user!.id,
      display_name: displayName,
      wake_target_time: wakeTarget,
      sleep_target_time: sleepTarget,
      water_target_ml: waterTarget,
      monthly_income: monthlyIncome,
    }, { onConflict: 'user_id' })
    // Also update auth user metadata
    await supabase.auth.updateUser({ data: { display_name: displayName } })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-secondary rounded-xl" />)}</div>

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Personal settings and targets</p>
      </div>

      <div className="arc-card space-y-4">
        <p className="section-header">Identity</p>
        <div className="space-y-1">
          <label htmlFor="display-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Display name</label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="arc-card space-y-4">
        <p className="section-header">Daily Targets</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="wake-target" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Wake-up target</label>
            <input
              id="wake-target"
              type="time"
              value={wakeTarget}
              onChange={(e) => setWakeTarget(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="sleep-target" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bedtime target</label>
            <input
              id="sleep-target"
              type="time"
              value={sleepTarget}
              onChange={(e) => setSleepTarget(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="water-target" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Daily water target: {(waterTarget / 1000).toFixed(1)}L
          </label>
          <input
            id="water-target"
            type="range"
            min={1000}
            max={5000}
            step={250}
            value={waterTarget}
            onChange={(e) => setWaterTarget(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1L</span>
            <span className="font-semibold text-foreground">{(waterTarget / 1000).toFixed(1)}L</span>
            <span>5L</span>
          </div>
          <p className="text-xs text-muted-foreground">Set a target that works for you. No universal requirement.</p>
        </div>
      </div>

      <div className="arc-card space-y-4">
        <p className="section-header">Finance</p>
        <div className="space-y-1">
          <label htmlFor="monthly-income" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monthly salary (₹)</label>
          <input
            id="monthly-income"
            type="number"
            min={0}
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground">Used for finance calculations only. Never shared.</p>
        </div>
      </div>

      <button
        id="profile-save"
        onClick={handleSave}
        disabled={saving}
        className={`w-full font-bold py-3 rounded-xl transition-all ${
          saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        } disabled:opacity-50`}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Profile'}
      </button>
    </div>
  )
}
