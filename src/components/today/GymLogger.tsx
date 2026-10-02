'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { GymLog, GymStatus, WorkoutType } from '@/types'

interface GymLoggerProps {
  gymLog: GymLog | null
  date: string
  onUpdate: () => void
}

const STATUSES: { value: GymStatus; label: string; color: string; icon: string }[] = [
  { value: 'completed', label: 'Completed', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '✅' },
  { value: 'missed', label: 'Missed', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '❌' },
  { value: 'recovery', label: 'Recovery', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🔄' },
]

const WORKOUT_TYPES: { value: WorkoutType; label: string }[] = [
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'legs', label: 'Legs' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'other', label: 'Other' },
]

export function GymLogger({ gymLog, date, onUpdate }: GymLoggerProps) {
  const [status, setStatus] = useState<GymStatus | null>(gymLog?.status ?? null)
  const [workoutType, setWorkoutType] = useState<WorkoutType | ''>(gymLog?.workout_type ?? '')
  const [duration, setDuration] = useState(gymLog?.duration_minutes?.toString() ?? '')
  const [notes, setNotes] = useState(gymLog?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  // Track current gym log id (may be set after first save)
  const [currentLogId, setCurrentLogId] = useState<string | null>(gymLog?.id ?? null)
  const supabase = createClient()

  const save = async (newStatus: GymStatus) => {
    setSaving(true)
    setSaveError(null)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      setSaveError('Authentication error. Please refresh and try again.')
      setSaving(false)
      return
    }

    const data = {
      user_id: user.id,
      date,
      status: newStatus,
      workout_type: workoutType || null,
      duration_minutes: duration ? parseInt(duration) : null,
      notes: notes || null,
    }

    if (currentLogId) {
      const { error } = await supabase
        .from('gym_logs')
        .update(data)
        .eq('id', currentLogId)
        .eq('user_id', user.id)
      if (error) {
        console.error('[GymLogger] update failed', { userId: user.id, date, newStatus, error })
        setSaveError('Could not save gym status. Please try again.')
        setSaving(false)
        return
      }
    } else {
      const { data: inserted, error } = await supabase
        .from('gym_logs')
        .upsert(data, { onConflict: 'user_id,date' })
        .select()
        .single()
      if (error) {
        console.error('[GymLogger] upsert failed', { userId: user.id, date, newStatus, error })
        setSaveError('Could not save gym status. Please try again.')
        setSaving(false)
        return
      }
      if (inserted?.id) {
        setCurrentLogId(inserted.id)
      }
    }

    setStatus(newStatus)
    setSaving(false)
    onUpdate()
  }

  return (
    <div className="arc-card space-y-4">
      <p className="section-header">💪 Gym</p>

      {/* Status buttons */}
      <div className="flex gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            id={`gym-status-${s.value}`}
            onClick={() => save(s.value)}
            disabled={saving}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2 rounded-xl border transition-all duration-150',
              status === s.value
                ? s.color
                : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
            )}
          >
            <span>{s.icon}</span>
            <span className="hidden sm:block">{s.label}</span>
          </button>
        ))}
      </div>

      {status === 'completed' && (
        <div className="space-y-3">
          {/* Workout type */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Workout type</p>
            <div className="flex flex-wrap gap-1.5">
              {WORKOUT_TYPES.map((wt) => (
                <button
                  key={wt.value}
                  onClick={() => setWorkoutType(wt.value)}
                  className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all',
                    workoutType === wt.value
                      ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  {wt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration"
              className="w-24 bg-secondary border border-border rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground">minutes</span>
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => status && save(status)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
      )}

      {status && (
        <div className={cn(
          'text-xs font-semibold px-3 py-2 rounded-xl border text-center',
          STATUSES.find((s) => s.value === status)?.color
        )}>
          {status === 'completed' && workoutType
            ? `${workoutType.replace('_', ' ')} workout${duration ? ` · ${duration} min` : ''}`
            : STATUSES.find((s) => s.value === status)?.label}
        </div>
      )}

      {saveError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          ⚠️ {saveError}
        </p>
      )}
    </div>
  )
}
