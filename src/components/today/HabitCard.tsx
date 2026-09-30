'use client'

import { useState, useOptimistic } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { queueOfflineEntry } from '@/lib/offline-db'
import type { Habit, HabitLog, HabitStatus } from '@/types'

interface HabitCardProps {
  habit: Habit
  log: HabitLog | null
  date: string
  onUpdate: () => void
}

const STATUS_OPTIONS: { value: HabitStatus; label: string; color: string }[] = [
  { value: 'kept', label: 'Done', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'partial', label: 'Partial', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'failed', label: 'Missed', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'recovery', label: 'Recovery', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'skipped', label: 'Skip', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
]

const ABSTINENCE_OPTIONS: { value: HabitStatus; label: string; color: string }[] = [
  { value: 'kept', label: 'Kept', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'failed', label: 'Failed', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'skipped', label: 'Not logged', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
]

export function HabitCard({ habit, log, date, onUpdate }: HabitCardProps) {
  const [saving, setSaving] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<HabitStatus | null>(
    log?.status ?? null
  )
  const [numericValue, setNumericValue] = useState<number>(
    log?.value ?? 0
  )
  const [notes, setNotes] = useState(log?.notes ?? '')
  const [showNotes, setShowNotes] = useState(false)
  const supabase = createClient()

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

  const saveLog = async (status: HabitStatus, value?: number) => {
    setSaving(true)
    const data = {
      user_id: (await supabase.auth.getUser()).data.user!.id,
      habit_id: habit.id,
      date,
      status,
      value: value ?? null,
      notes: notes || null,
    }

    if (!isOnline) {
      if (log?.id) {
        await queueOfflineEntry('habit_logs', 'update', { ...data, id: log.id })
      } else {
        await queueOfflineEntry('habit_logs', 'insert', data)
      }
      setCurrentStatus(status)
      setSaving(false)
      return
    }

    if (log?.id) {
      await supabase.from('habit_logs').update(data).eq('id', log.id)
    } else {
      await supabase.from('habit_logs').upsert(data)
    }

    setCurrentStatus(status)
    setSaving(false)
    onUpdate()
  }

  const options = habit.type === 'abstinence' ? ABSTINENCE_OPTIONS : STATUS_OPTIONS

  const getCurrentStatusStyle = () => {
    if (!currentStatus) return 'bg-secondary/50 text-muted-foreground border-border'
    const opt = options.find((o) => o.value === currentStatus)
    return opt?.color ?? 'bg-secondary/50 text-muted-foreground border-border'
  }

  return (
    <div className={cn(
      'arc-card transition-all duration-200',
      currentStatus === 'kept' || currentStatus === 'recovery'
        ? 'border-green-500/20'
        : currentStatus === 'failed'
        ? 'border-red-500/20'
        : 'border-border'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground text-sm truncate">{habit.name}</p>
            {habit.is_optional && (
              <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                Optional
              </span>
            )}
          </div>
          {habit.description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{habit.description}</p>
          )}
          {habit.type === 'numeric' && habit.target_value && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Target: {habit.target_value} {habit.unit}
            </p>
          )}
        </div>

        {/* Current status badge */}
        <span className={cn(
          'text-xs font-semibold px-2 py-1 rounded-lg border shrink-0',
          getCurrentStatusStyle()
        )}>
          {currentStatus
            ? options.find((o) => o.value === currentStatus)?.label ?? currentStatus
            : 'Log'}
        </span>
      </div>

      {/* Numeric input */}
      {(habit.type === 'numeric' || habit.type === 'duration') && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={numericValue}
            onChange={(e) => setNumericValue(Number(e.target.value))}
            className="w-20 bg-secondary border border-border rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground">{habit.unit}</span>
          {habit.target_value && (
            <span className="text-xs text-muted-foreground">
              / {habit.target_value}
            </span>
          )}
        </div>
      )}

      {/* Status buttons */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            id={`habit-${habit.id}-${opt.value}`}
            disabled={saving}
            onClick={() => saveLog(opt.value, habit.type !== 'boolean' ? numericValue : undefined)}
            className={cn(
              'text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all duration-150',
              currentStatus === opt.value
                ? opt.color + ' opacity-100'
                : 'bg-secondary/30 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        ))}
        <button
          id={`habit-${habit.id}-notes`}
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2"
        >
          {showNotes ? '↑' : '+ note'}
        </button>
      </div>

      {/* Notes */}
      {showNotes && (
        <div className="mt-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => currentStatus && saveLog(currentStatus)}
            placeholder="Add a note..."
            rows={2}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
      )}

      {saving && (
        <p className="text-xs text-muted-foreground mt-1">Saving...</p>
      )}
    </div>
  )
}
