'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { queueOfflineEntry } from '@/lib/offline-db'

interface LearningSessionFormProps {
  date: string
  topics: string[]
  onSave: () => void
  onCancel: () => void
}

export function LearningSessionForm({ date, topics, onSave, onCancel }: LearningSessionFormProps) {
  const [topic, setTopic] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [minutes, setMinutes] = useState(30)
  const [questionsPracticed, setQuestionsPracticed] = useState(0)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSave = async () => {
    const actualTopic = topic === 'Other' ? customTopic : topic
    if (!actualTopic || minutes <= 0) return

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
      topic: actualTopic,
      minutes,
      questions_practiced: questionsPracticed,
      notes: notes || null,
    }

    if (!isOnline) {
      await queueOfflineEntry('learning_sessions', 'insert', data)
      setSaving(false)
      onSave()
      return
    }

    const { error } = await supabase
      .from('learning_sessions')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('[LearningSessionForm] insert failed', { userId: user.id, date, topic: actualTopic, error })
      setSaveError('Could not save session. Please try again.')
      setSaving(false)
      return
    }

    setSaving(false)
    onSave()
  }

  return (
    <div className="arc-card space-y-4">
      <h3 className="font-bold text-foreground text-sm">Log Learning Session</h3>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Topic</label>
        <select
          id="session-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Select topic…</option>
          {topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {topic === 'Other' && (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Custom topic</label>
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Enter topic"
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Minutes</label>
          <input
            id="session-minutes"
            type="number"
            min={1}
            max={480}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Questions</label>
          <input
            id="session-questions"
            type="number"
            min={0}
            value={questionsPracticed}
            onChange={(e) => setQuestionsPracticed(Number(e.target.value))}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Quick minute buttons */}
      <div className="flex flex-wrap gap-2">
        {[15, 30, 45, 60, 90, 120].map((m) => (
          <button
            key={m}
            onClick={() => setMinutes(m)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              minutes === m
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/30'
            }`}
          >
            {m}m
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you learn?"
          rows={2}
          className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      {saveError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          ⚠️ {saveError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          id="session-save"
          onClick={handleSave}
          disabled={saving || !topic}
          className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2.5 rounded-xl transition-all text-sm"
        >
          {saving ? 'Saving…' : 'Save session'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-xl transition-all text-sm border border-border"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
