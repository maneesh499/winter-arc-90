'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DailyReviewFormProps {
  review: {
    id: string
    went_well: string | null
    distracted_by: string | null
    improve_tomorrow: string | null
    tomorrow_priority: string | null
    mood: number | null
    energy: number | null
  } | null
  date: string
  onUpdate: () => void
}

export function DailyReviewForm({ review, date, onUpdate }: DailyReviewFormProps) {
  const [wentWell, setWentWell] = useState(review?.went_well ?? '')
  const [distractedBy, setDistractedBy] = useState(review?.distracted_by ?? '')
  const [improve, setImprove] = useState(review?.improve_tomorrow ?? '')
  const [priority, setPriority] = useState(review?.tomorrow_priority ?? '')
  const [mood, setMood] = useState(review?.mood ?? 3)
  const [energy, setEnergy] = useState(review?.energy ?? 3)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    const data = {
      date,
      went_well: wentWell || null,
      distracted_by: distractedBy || null,
      improve_tomorrow: improve || null,
      tomorrow_priority: priority || null,
      mood,
      energy,
    }
    if (review?.id) {
      await supabase.from('daily_reviews').update(data).eq('id', review.id)
    } else {
      await supabase.from('daily_reviews').insert(data)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onUpdate()
  }

  const MOOD_LABELS = ['', '😞 Poor', '😕 Low', '😐 Okay', '🙂 Good', '😊 Great']
  const ENERGY_LABELS = ['', '🪫 Drained', '😴 Tired', '⚡ Okay', '💪 Energized', '🔥 Peak']

  return (
    <div className="space-y-4">
      <div className="arc-card space-y-4">
        <h2 className="font-black text-foreground text-lg">Day Complete</h2>

        {/* Mood & Energy */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Mood: {MOOD_LABELS[mood]}
            </label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(v => (
                <button
                  key={v}
                  onClick={() => setMood(v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                    v <= mood
                      ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-secondary/50 text-muted-foreground border-border'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Energy: {ENERGY_LABELS[energy]}
            </label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(v => (
                <button
                  key={v}
                  onClick={() => setEnergy(v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                    v <= energy
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-secondary/50 text-muted-foreground border-border'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reflection questions */}
        {[
          { label: 'What went well today?', value: wentWell, set: setWentWell, id: 'review-went-well', placeholder: 'The wins…' },
          { label: 'What distracted me?', value: distractedBy, set: setDistractedBy, id: 'review-distracted', placeholder: 'Be honest…' },
          { label: 'What should I improve tomorrow?', value: improve, set: setImprove, id: 'review-improve', placeholder: 'One thing…' },
          { label: "Tomorrow's #1 priority", value: priority, set: setPriority, id: 'review-priority', placeholder: 'The most important thing…' },
        ].map((q) => (
          <div key={q.id} className="space-y-1">
            <label htmlFor={q.id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {q.label}
            </label>
            <textarea
              id={q.id}
              value={q.value}
              onChange={(e) => q.set(e.target.value)}
              placeholder={q.placeholder}
              rows={2}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
        ))}

        <button
          id="review-save"
          onClick={handleSave}
          disabled={saving}
          className={`w-full font-bold py-3 rounded-xl transition-all text-sm ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          } disabled:opacity-50`}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Review'}
        </button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        A bad day is information, not identity. Win tomorrow.
      </p>
    </div>
  )
}
