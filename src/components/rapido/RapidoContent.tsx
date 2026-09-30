'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface RapidoContentProps {
  today: string
  entries: any[]
  monthStats: { gross: number; fuel: number; net: number; hours: number; rides: number; days: number }
  userId: string
}

export function RapidoContent({ today, entries, monthStats, userId }: RapidoContentProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: today,
    hours: '',
    rides: '',
    distance_km: '',
    gross_earnings: '',
    fuel_cost: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const [, startTransition] = useTransition()
  const refresh = () => startTransition(() => router.refresh())
  const supabase = createClient()

  const netEarnings = Number(form.gross_earnings || 0) - Number(form.fuel_cost || 0)

  const handleSave = async () => {
    if (!form.gross_earnings || !form.hours) return
    setSaving(true)
    await supabase.from('rapido_entries').insert({
      date: form.date,
      hours: Number(form.hours),
      rides: Number(form.rides || 0),
      distance_km: form.distance_km ? Number(form.distance_km) : null,
      gross_earnings: Number(form.gross_earnings),
      fuel_cost: Number(form.fuel_cost || 0),
      net_earnings: netEarnings,
      notes: form.notes || null,
    })
    setSaving(false)
    setShowForm(false)
    setForm({ date: today, hours: '', rides: '', distance_km: '', gross_earnings: '', fuel_cost: '', notes: '' })
    refresh()
  }

  const avgPerHour = monthStats.hours > 0 ? monthStats.net / monthStats.hours : 0

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-foreground">Rapido</h1>
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">Optional</span>
        </div>
        <p className="text-sm text-muted-foreground">Side income tracking — does not affect Winter Arc score</p>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="arc-card">
          <p className="text-xs text-muted-foreground mb-1">Net this month</p>
          <p className="text-2xl font-black text-green-400">{formatCurrency(monthStats.net)}</p>
        </div>
        <div className="arc-card">
          <p className="text-xs text-muted-foreground mb-1">Hours worked</p>
          <p className="text-2xl font-black text-foreground">{monthStats.hours.toFixed(1)}h</p>
        </div>
        <div className="arc-card">
          <p className="text-xs text-muted-foreground mb-1">Rides</p>
          <p className="text-2xl font-black text-foreground">{monthStats.rides}</p>
        </div>
        <div className="arc-card">
          <p className="text-xs text-muted-foreground mb-1">Avg / hour</p>
          <p className="text-2xl font-black text-foreground">{formatCurrency(avgPerHour)}</p>
        </div>
      </div>

      {/* Fuel summary */}
      {monthStats.fuel > 0 && (
        <div className="arc-card space-y-2">
          <p className="section-header">This month</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross earnings</span>
              <span className="text-foreground font-semibold">{formatCurrency(monthStats.gross)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fuel cost</span>
              <span className="text-red-400 font-semibold">-{formatCurrency(monthStats.fuel)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1">
              <span className="text-foreground font-bold">Net earnings</span>
              <span className="text-green-400 font-bold">{formatCurrency(monthStats.net)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add entry */}
      <div className="flex items-center justify-between">
        <p className="section-header">Log entry</p>
        <button
          id="add-rapido-entry"
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-primary font-semibold hover:underline"
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <div className="arc-card space-y-3">
          <h3 className="font-bold text-sm text-foreground">New Rapido Entry</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Hours</label>
              <input type="number" min="0" step="0.5" value={form.hours} onChange={(e) => setForm(f => ({ ...f, hours: e.target.value }))}
                placeholder="3.5"
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Rides</label>
              <input type="number" min="0" value={form.rides} onChange={(e) => setForm(f => ({ ...f, rides: e.target.value }))}
                placeholder="12"
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Distance (km)</label>
              <input type="number" min="0" value={form.distance_km} onChange={(e) => setForm(f => ({ ...f, distance_km: e.target.value }))}
                placeholder="45"
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Gross (₹)</label>
              <input type="number" min="0" value={form.gross_earnings} onChange={(e) => setForm(f => ({ ...f, gross_earnings: e.target.value }))}
                placeholder="450"
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Fuel (₹)</label>
              <input type="number" min="0" value={form.fuel_cost} onChange={(e) => setForm(f => ({ ...f, fuel_cost: e.target.value }))}
                placeholder="80"
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          {/* Auto-calculated net */}
          {(form.gross_earnings || form.fuel_cost) && (
            <div className="bg-secondary/50 rounded-xl px-4 py-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Net earnings</span>
                <span className={`font-bold ${netEarnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(netEarnings)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Gross - Fuel = Net</p>
            </div>
          )}

          <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Notes…" rows={2}
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-secondary text-foreground rounded-xl text-sm border border-border">Cancel</button>
          </div>
        </div>
      )}

      {/* Entries list */}
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="arc-card text-center py-8 space-y-2">
            <p className="text-3xl">🛵</p>
            <p className="font-semibold text-foreground">No Rapido entries yet</p>
            <p className="text-sm text-muted-foreground">Log your rides to track side income</p>
          </div>
        ) : (
          entries.map((e: any) => (
            <div key={e.id} className="arc-card flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{e.date}</p>
                <p className="text-xs text-muted-foreground">
                  {e.hours}h · {e.rides} rides · Fuel: {formatCurrency(e.fuel_cost)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-400">{formatCurrency(e.net_earnings)}</p>
                <p className="text-xs text-muted-foreground">net</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
