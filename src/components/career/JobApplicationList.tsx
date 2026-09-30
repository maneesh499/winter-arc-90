'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { ApplicationStatus } from '@/types'

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  referral: 'Referral',
  recruiter: 'Recruiter',
  screening: 'Screening',
  l1: 'L1',
  l2: 'L2',
  final: 'Final',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

const STATUS_COLORS: Partial<Record<ApplicationStatus, string>> = {
  applied: 'bg-blue-500/20 text-blue-400',
  screening: 'bg-yellow-500/20 text-yellow-400',
  l1: 'bg-purple-500/20 text-purple-400',
  l2: 'bg-purple-500/20 text-purple-400',
  final: 'bg-orange-500/20 text-orange-400',
  offer: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  withdrawn: 'bg-gray-500/20 text-gray-400',
  saved: 'bg-secondary text-muted-foreground',
  referral: 'bg-cyan-500/20 text-cyan-400',
  recruiter: 'bg-indigo-500/20 text-indigo-400',
}

interface JobApplicationListProps {
  applications: any[]
  onUpdate: () => void
}

export function JobApplicationList({ applications, onUpdate }: JobApplicationListProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    company: '',
    role: '',
    source: '',
    status: 'saved' as ApplicationStatus,
    recruiter_name: '',
    referral_name: '',
    next_action: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    if (!form.company || !form.role) return
    setSaving(true)
    const now = new Date().toISOString().split('T')[0]
    await supabase.from('job_applications').insert({
      ...form,
      date_applied: form.status === 'applied' ? now : null,
    })
    setSaving(false)
    setForm({ company: '', role: '', source: '', status: 'saved', recruiter_name: '', referral_name: '', next_action: '', notes: '' })
    setShowForm(false)
    onUpdate()
  }

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    await supabase.from('job_applications').update({ status }).eq('id', id)
    onUpdate()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="section-header">Applications ({applications.length})</p>
        <button
          id="add-application"
          onClick={() => setShowForm(true)}
          className="text-xs text-primary font-semibold hover:underline"
        >
          + Add
        </button>
      </div>

      {showForm && (
        <div className="arc-card space-y-3">
          <h3 className="font-bold text-sm text-foreground">New Application</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Company"
              value={form.company}
              onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
              className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              placeholder="Role"
              value={form.role}
              onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
              className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Source (LinkedIn, Naukri…)"
              value={form.source}
              onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))}
              className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <select
              value={form.status}
              onChange={(e) => setForm(f => ({ ...f, status: e.target.value as ApplicationStatus }))}
              className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Recruiter name"
              value={form.recruiter_name}
              onChange={(e) => setForm(f => ({ ...f, recruiter_name: e.target.value }))}
              className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              placeholder="Referral by"
              value={form.referral_name}
              onChange={(e) => setForm(f => ({ ...f, referral_name: e.target.value }))}
              className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <input
            placeholder="Next action"
            value={form.next_action}
            onChange={(e) => setForm(f => ({ ...f, next_action: e.target.value }))}
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-xl text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-secondary text-foreground font-semibold rounded-xl text-sm border border-border"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="arc-card text-center py-8 space-y-2">
          <p className="text-3xl">📋</p>
          <p className="font-semibold text-foreground">No applications yet</p>
          <p className="text-sm text-muted-foreground">Track every application you make</p>
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map((app: any) => (
            <div key={app.id} className="arc-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{app.company}</p>
                  <p className="text-xs text-muted-foreground">{app.role}</p>
                  {app.next_action && (
                    <p className="text-xs text-primary mt-1">→ {app.next_action}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full',
                    STATUS_COLORS[app.status as ApplicationStatus] ?? 'bg-secondary text-muted-foreground'
                  )}>
                    {STATUS_LABELS[app.status as ApplicationStatus]}
                  </span>
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                    className="text-xs bg-secondary border border-border rounded-lg px-1.5 py-1 text-foreground focus:outline-none"
                  >
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
