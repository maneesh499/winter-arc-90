'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { getTodayIST } from '@/lib/dates'

const INTERVIEW_TOPICS = [
  'SQL', 'Python', 'PySpark', 'Databricks', 'ADF', 'Azure',
  'Power BI', 'GenAI', 'LangChain', 'RAG', 'Projects',
  'Behavioral', 'System Design', 'English',
]

interface InterviewListProps {
  interviews: any[]
  onUpdate: () => void
}

export function InterviewList({ interviews, onUpdate }: InterviewListProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    company: '',
    role: '',
    date: getTodayIST(), // IST-safe, not new Date().toISOString()
    round: 'L1',
    topics: [] as string[],
    questions: '',
    notes: '',
    status: 'scheduled' as const,
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const supabase = createClient()

  const toggleTopic = (t: string) => {
    setForm(f => ({
      ...f,
      topics: f.topics.includes(t) ? f.topics.filter(x => x !== t) : [...f.topics, t],
    }))
  }

  const handleSave = async () => {
    if (!form.company || !form.role) return
    setSaving(true)
    setSaveError(null)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      setSaveError('Authentication error. Please refresh.')
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('interviews')
      .insert({
        user_id: user.id,
        ...form,
        topics: form.topics,
      })
      .select()
      .single()

    if (error) {
      console.error('[InterviewList] insert failed', { userId: user.id, company: form.company, error })
      setSaveError(`Could not save interview: ${error.message}`)
      setSaving(false)
      return
    }

    setSaving(false)
    setShowForm(false)
    onUpdate()
  }

  const STATUS_COLORS: Record<string, string> = {
    scheduled: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
    rejected: 'bg-red-500/20 text-red-400',
    passed: 'bg-emerald-500/20 text-emerald-400',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="section-header">Interviews ({interviews.length})</p>
        <button
          id="add-interview"
          onClick={() => setShowForm(true)}
          className="text-xs text-primary font-semibold hover:underline"
        >
          + Add
        </button>
      </div>

      {showForm && (
        <div className="arc-card space-y-3">
          <h3 className="font-bold text-sm text-foreground">New Interview</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Company"
              value={form.company}
              onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
              className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              placeholder="Role"
              value={form.role}
              onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
              className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
              className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              placeholder="Round (L1, L2…)"
              value={form.round}
              onChange={(e) => setForm(f => ({ ...f, round: e.target.value }))}
              className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <select
              value={form.status}
              onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}
              className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
              <option value="passed">Passed</option>
            </select>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Topics covered</p>
            <div className="flex flex-wrap gap-1.5">
              {INTERVIEW_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTopic(t)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-lg border transition-all',
                    form.topics.includes(t)
                      ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/30'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Questions asked"
            value={form.questions}
            onChange={(e) => setForm(f => ({ ...f, questions: e.target.value }))}
            rows={3}
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <textarea
            placeholder="Notes & observations"
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

      {interviews.length === 0 ? (
        <div className="arc-card text-center py-8 space-y-2">
          <p className="text-3xl">🎯</p>
          <p className="font-semibold text-foreground">No interviews yet</p>
          <p className="text-sm text-muted-foreground">Track each round and what was asked</p>
        </div>
      ) : (
        <div className="space-y-2">
          {interviews.map((iv: any) => (
            <div key={iv.id} className="arc-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-foreground">{iv.company}</p>
                  <p className="text-xs text-muted-foreground">{iv.role} · {iv.round}</p>
                  <p className="text-xs text-muted-foreground">{iv.date}</p>
                </div>
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full capitalize',
                  STATUS_COLORS[iv.status] ?? 'bg-secondary text-muted-foreground'
                )}>
                  {iv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
