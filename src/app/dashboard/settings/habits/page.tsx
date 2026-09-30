'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { HabitCategory, HabitType } from '@/types'

const DEFAULT_HABITS: any[] = [
  // Core discipline
  { name: 'No Porn', category: 'discipline', habit_type: 'abstinence', is_optional: false, icon: '🔥', description: null },
  { name: 'Digital Discipline', category: 'discipline', habit_type: 'boolean', is_optional: false, icon: '📵', description: 'No mindless scrolling' },
  { name: 'No Added Sugar', category: 'discipline', habit_type: 'boolean', is_optional: false, icon: '🚫', description: null },
  // Health
  { name: 'Reading', category: 'health', habit_type: 'numeric', is_optional: false, icon: '📚', description: 'Min 3 pages', target_value: 3, unit: 'pages' },
  { name: 'Healthy Eating', category: 'health', habit_type: 'boolean', is_optional: false, icon: '🥗', description: null },
  { name: 'Outdoor Time', category: 'health', habit_type: 'boolean', is_optional: false, icon: '☀️', description: 'Sunlight / fresh air' },
  { name: 'Meditation', category: 'health', habit_type: 'duration', is_optional: true, icon: '🧘', description: 'Optional — 5–10 min', target_value: 5 },
  { name: 'Environment Reset', category: 'productivity', habit_type: 'boolean', is_optional: true, icon: '🏠', description: '10-min room/desk reset' },
  // English
  { name: 'English Practice', category: 'english', habit_type: 'duration', is_optional: false, icon: '🗣️', description: 'Min 10 minutes', target_value: 10 },
  // Career
  { name: 'Career Study', category: 'career', habit_type: 'duration', is_optional: false, icon: '💼', description: 'Min 60 minutes', target_value: 60 },
  // Creative
  { name: 'Creative Work', category: 'creative', habit_type: 'boolean', is_optional: true, icon: '🎬', description: 'Any creative session' },
]

const CATEGORY_LABELS: Record<HabitCategory, string> = {
  discipline: 'Discipline',
  health: 'Health',
  productivity: 'Productivity',
  career: 'Career',
  english: 'English',
  creative: 'Creative',
  optional: 'Optional',
}

export default function HabitSettingsPage() {
  const [habits, setHabits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [newHabit, setNewHabit] = useState({ name: '', category: 'health' as HabitCategory, habit_type: 'boolean' as HabitType, icon: '', is_optional: false })
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchHabits = async () => {
    const { data } = await supabase.from('habits').select('*').eq('is_active', true).order('category').order('name')
    setHabits(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchHabits() }, [])

  const handleSeedDefaults = async () => {
    setSeeding(true)
    for (const h of DEFAULT_HABITS) {
      await supabase.from('habits').upsert(h, { onConflict: 'user_id,name' })
    }
    await fetchHabits()
    setSeeding(false)
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    await supabase.from('habits').update({ is_active: !active }).eq('id', id)
    fetchHabits()
  }

  const handleAddHabit = async () => {
    if (!newHabit.name) return
    setSaving(true)
    await supabase.from('habits').insert(newHabit)
    setNewHabit({ name: '', category: 'health', habit_type: 'boolean', icon: '', is_optional: false })
    setShowAdd(false)
    setSaving(false)
    fetchHabits()
  }

  if (loading) return <div className="animate-pulse space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-secondary rounded-xl" />)}</div>

  const groupedHabits = habits.reduce((acc, h) => {
    const cat = h.category as HabitCategory
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(h)
    return acc
  }, {} as Record<HabitCategory, any[]>)

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-foreground">Habits</h1>
        <p className="text-sm text-muted-foreground">Manage your Winter Arc habits</p>
      </div>

      {habits.length === 0 && (
        <div className="arc-card text-center space-y-3 py-8">
          <p className="text-3xl">📋</p>
          <p className="font-semibold text-foreground">No habits yet</p>
          <p className="text-sm text-muted-foreground">Load the recommended Winter Arc habits to get started</p>
          <button
            id="seed-habits"
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {seeding ? 'Loading…' : 'Load Default Habits'}
          </button>
        </div>
      )}

      {Object.entries(groupedHabits).map(([cat, catHabits]) => (
        <div key={cat} className="space-y-2">
          <p className="section-header">{CATEGORY_LABELS[cat as HabitCategory]}</p>
          {(catHabits as any[]).map((h) => (
            <div key={h.id} className="arc-card flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-base">{h.icon || '•'}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">{h.name}</p>
                  {h.description && <p className="text-xs text-muted-foreground">{h.description}</p>}
                  {h.is_optional && <span className="text-xs text-muted-foreground">Optional</span>}
                </div>
              </div>
              <button
                onClick={() => handleToggleActive(h.id, h.is_active)}
                className={cn(
                  'text-xs font-semibold px-3 py-1 rounded-full border transition-all',
                  h.is_active
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-secondary text-muted-foreground border-border'
                )}
              >
                {h.is_active ? 'Active' : 'Off'}
              </button>
            </div>
          ))}
        </div>
      ))}

      {/* Add habit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="section-header">Add Habit</p>
          <button onClick={() => setShowAdd(!showAdd)} className="text-xs text-primary font-semibold">
            {showAdd ? 'Cancel' : '+ Add custom'}
          </button>
        </div>

        {showAdd && (
          <div className="arc-card space-y-3">
            <input
              placeholder="Habit name"
              value={newHabit.name}
              onChange={(e) => setNewHabit(h => ({ ...h, name: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newHabit.category}
                onChange={(e) => setNewHabit(h => ({ ...h, category: e.target.value as HabitCategory }))}
                className="bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select
                value={newHabit.habit_type}
                onChange={(e) => setNewHabit(h => ({ ...h, habit_type: e.target.value as HabitType }))}
                className="bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="boolean">Yes/No</option>
                <option value="numeric">Numeric</option>
                <option value="duration">Duration</option>
                <option value="abstinence">Abstinence</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                placeholder="Icon emoji"
                value={newHabit.icon}
                onChange={(e) => setNewHabit(h => ({ ...h, icon: e.target.value }))}
                maxLength={2}
                className="w-20 bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-center text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={newHabit.is_optional}
                  onChange={(e) => setNewHabit(h => ({ ...h, is_optional: e.target.checked }))}
                  className="rounded accent-primary"
                />
                Optional
              </label>
            </div>
            <button
              onClick={handleAddHabit}
              disabled={saving || !newHabit.name}
              className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-xl text-sm disabled:opacity-50"
            >
              {saving ? 'Adding…' : 'Add Habit'}
            </button>
          </div>
        )}
      </div>

      {habits.length > 0 && (
        <button
          onClick={handleSeedDefaults}
          disabled={seeding}
          className="w-full border border-border text-muted-foreground font-semibold py-2.5 rounded-xl text-sm hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-50"
        >
          {seeding ? 'Loading…' : 'Reset to default habits'}
        </button>
      )}
    </div>
  )
}
