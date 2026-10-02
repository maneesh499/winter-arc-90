'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { queueOfflineEntry } from '@/lib/offline-db'

const SPEAKING_TOPICS = [
  'Tell me about yourself',
  'Explain your current project',
  'Explain Databricks',
  'Explain your daily routine',
  'Describe your hometown',
  'Explain a technical problem',
  'Tell about a difficult situation',
  'Explain your career goals',
  'Describe a movie you watched',
  'Tell a short story',
  'Explain a data engineering concept',
  'Why are you looking for a change?',
  'Custom topic',
]

interface SpeakingLoggerProps {
  date: string
  onSave: () => void
}

export function SpeakingLogger({ date, onSave }: SpeakingLoggerProps) {
  const [topic, setTopic] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [minutes, setMinutes] = useState(10)
  const [activityType, setActivityType] = useState<'speaking' | 'reading_aloud'>('speaking')
  const [selfRating, setSelfRating] = useState(3)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSave = async () => {
    const actualTopic = topic === 'Custom topic' ? customTopic : topic
    if (minutes <= 0) return

    setSaving(true)
    setSaveError(null)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      setSaveError('Authentication error. Please refresh and try again.')
      setSaving(false)
      return
    }

    const isOnline = navigator.onLine

    const data = {
      user_id: user.id,
      date,
      activity_type: activityType,
      minutes,
      topic: actualTopic || null,
      self_rating: selfRating,
      notes: notes || null,
    }

    if (!isOnline) {
      await queueOfflineEntry('english_sessions', 'insert', data)
      setSaving(false)
      setTopic('')
      setCustomTopic('')
      setMinutes(10)
      setNotes('')
      onSave()
      return
    }

    const { error } = await supabase
      .from('english_sessions')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('[SpeakingLogger] insert failed', { userId: user.id, date, activityType, error })
      setSaveError(`Could not save session: ${error.message}`)
      setSaving(false)
      return
    }

    setSaving(false)
    setTopic('')
    setCustomTopic('')
    setMinutes(10)
    setNotes('')
    onSave()
  }

  return (
    <div className="arc-card space-y-4">
      <h3 className="font-bold text-foreground text-sm">Log Speaking Practice</h3>

      {/* Activity type */}
      <div className="flex gap-2">
        {[
          { val: 'speaking' as const, label: '🗣️ Speaking' },
          { val: 'reading_aloud' as const, label: '📖 Reading Aloud' },
        ].map((opt) => (
          <button
            key={opt.val}
            onClick={() => setActivityType(opt.val)}
            className={cn(
              'flex-1 text-sm font-semibold py-2 rounded-xl border transition-all',
              activityType === opt.val
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-secondary/50 text-muted-foreground border-border'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Topic */}
      {activityType === 'speaking' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Topic</label>
          <select
            id="speaking-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select topic…</option>
            {SPEAKING_TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {topic === 'Custom topic' && (
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Enter your topic"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          )}
        </div>
      )}

      {/* Duration */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Duration</label>
        <div className="flex flex-wrap gap-2">
          {[2, 5, 10, 15, 20, 30].map((m) => (
            <button
              key={m}
              onClick={() => setMinutes(m)}
              className={cn(
                'text-sm font-semibold px-4 py-2 rounded-xl border transition-all',
                minutes === m
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/30'
              )}
            >
              {m}m
            </button>
          ))}
          <input
            type="number"
            min={1}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-20 bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
          />
        </div>
      </div>

      {/* Self-rating */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Self-rating: {selfRating}/5
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              onClick={() => setSelfRating(r)}
              className={cn(
                'flex-1 py-2 rounded-xl border text-sm font-bold transition-all',
                r <= selfRating
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-secondary/50 text-muted-foreground border-border'
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {selfRating === 1 ? 'Poor' : selfRating === 2 ? 'Fair' : selfRating === 3 ? 'Good' : selfRating === 4 ? 'Very good' : 'Excellent'}
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did it go? What to improve?"
          rows={2}
          className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      {saveError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          ⚠️ {saveError}
        </p>
      )}

      <button
        id="speaking-save"
        onClick={handleSave}
        disabled={saving || minutes <= 0}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-3 rounded-xl transition-all text-sm"
      >
        {saving ? 'Saving…' : 'Save Session'}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        🔒 Practice logged manually — no microphone used
      </p>
    </div>
  )
}
