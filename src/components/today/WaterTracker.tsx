'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface WaterTrackerProps {
  totalMl: number
  target: number
  date: string
  onUpdate: () => void
}

const QUICK_AMOUNTS = [250, 500, 750, 1000]

export function WaterTracker({ totalMl, target, date, onUpdate }: WaterTrackerProps) {
  const [saving, setSaving] = useState(false)
  const [current, setCurrent] = useState(totalMl)
  const [saveError, setSaveError] = useState<string | null>(null)
  const supabase = createClient()

  const percentage = Math.min(100, Math.round((current / target) * 100))

  const addWater = async (ml: number) => {
    setSaving(true)
    setSaveError(null)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      setSaveError('Auth error. Please refresh.')
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('water_logs')
      .insert({
        user_id: user.id,
        date,
        amount_ml: ml,
      })
      .select()
      .single()

    if (error) {
      console.error('[WaterTracker] insert failed', { userId: user.id, date, ml, error })
      setSaveError('Could not log water. Please try again.')
      setSaving(false)
      return
    }

    setCurrent((prev) => prev + ml)
    setSaving(false)
    onUpdate()
  }

  const displayLiters = (ml: number) => {
    if (ml >= 1000) return `${(ml / 1000).toFixed(1)}L`
    return `${ml}ml`
  }

  return (
    <div className="arc-card space-y-4">
      <div className="flex items-center justify-between">
        <p className="section-header">💧 Water</p>
        <span className={cn(
          'text-xs font-bold px-2 py-0.5 rounded-full border',
          percentage >= 100
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            : 'bg-secondary text-muted-foreground border-border'
        )}>
          {percentage >= 100 ? '✓ Goal met' : `${percentage}%`}
        </span>
      </div>

      {/* Progress display */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-foreground">{displayLiters(current)}</span>
          <span className="text-muted-foreground text-sm">/ {displayLiters(target)}</span>
        </div>
        <div className="arc-progress">
          <div
            className="arc-progress-fill bg-blue-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Quick add buttons */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map((ml) => (
            <button
              key={ml}
              id={`water-add-${ml}`}
              disabled={saving}
              onClick={() => addWater(ml)}
              className="bg-secondary hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 text-foreground text-sm font-semibold py-2 rounded-xl transition-all duration-150 disabled:opacity-50"
            >
              +{ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}
            </button>
          ))}
        </div>
      </div>

      {current >= target && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
          <p className="text-blue-400 text-sm font-semibold">
            💧 Hydration goal complete!
          </p>
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
