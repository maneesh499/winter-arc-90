'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface GrammarLoggerProps {
  date: string
  onSave: () => void
}

export function GrammarLogger({ date, onSave }: GrammarLoggerProps) {
  const [questions, setQuestions] = useState(5)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      setSaveError('Authentication error. Please refresh.')
      setSaving(false)
      return
    }

    // Note: 'grammar' is not in the english_sessions activity_type CHECK constraint
    // Valid values: 'speaking','reading_aloud','vocabulary','grammar','interview_speaking'
    const { error } = await supabase
      .from('english_sessions')
      .insert({
        user_id: user.id,
        date,
        activity_type: 'grammar',
        minutes: Math.ceil(questions * 1.5), // ~1.5 min per question
        topic: `${questions} grammar questions`,
        self_rating: null,
        notes: null,
      })
      .select()
      .single()

    if (error) {
      console.error('[GrammarLogger] insert failed', { userId: user.id, date, questions, error })
      setSaveError(`Could not save grammar log: ${error.message}`)
      setSaving(false)
      return
    }

    setSaving(false)
    setCompleted(true)
    onSave()
  }

  if (completed) {
    return (
      <div className="arc-card text-center py-6 space-y-2">
        <p className="text-3xl">✅</p>
        <p className="font-semibold text-foreground">Grammar practice logged!</p>
        <p className="text-sm text-muted-foreground">{questions} questions completed</p>
      </div>
    )
  }

  return (
    <div className="arc-card space-y-4">
      <h3 className="font-bold text-foreground text-sm">Grammar Practice</h3>
      <p className="text-xs text-muted-foreground">
        Complete grammar exercises externally and log your practice here.
      </p>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Questions completed
        </label>
        <div className="flex gap-2">
          {[5, 10, 15, 20, 25].map((q) => (
            <button
              key={q}
              onClick={() => setQuestions(q)}
              className={cn(
                'flex-1 text-sm font-semibold py-2 rounded-xl border transition-all',
                questions === q
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/30'
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {saveError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          ⚠️ {saveError}
        </p>
      )}

      <button
        id="grammar-save"
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2.5 rounded-xl transition-all text-sm"
      >
        {saving ? 'Saving…' : `Log ${questions} questions`}
      </button>
    </div>
  )
}
