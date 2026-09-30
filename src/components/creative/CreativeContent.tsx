'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PROGRAM_DAYS } from '@/lib/dates'
import { createClient } from '@/lib/supabase/client'
import type { CreativeProject, CreativeProjectStatus } from '@/types'

const STATUS_LABELS: Record<CreativeProjectStatus, string> = {
  idea: 'Idea',
  developing: 'Developing',
  script: 'Script',
  pre_production: 'Pre-production',
  production: 'Production',
  editing: 'Editing',
  completed: 'Completed',
}

const STATUS_COLORS: Record<CreativeProjectStatus, string> = {
  idea: 'bg-gray-500/20 text-gray-400',
  developing: 'bg-blue-500/20 text-blue-400',
  script: 'bg-purple-500/20 text-purple-400',
  pre_production: 'bg-yellow-500/20 text-yellow-400',
  production: 'bg-orange-500/20 text-orange-400',
  editing: 'bg-cyan-500/20 text-cyan-400',
  completed: 'bg-green-500/20 text-green-400',
}

const CREATIVE_ACTIVITIES = [
  'Story idea', 'Short film concept', 'Screenplay writing', 'Scene writing',
  'Character development', 'Dialogue writing', 'Visual planning', 'Shot planning',
  'Movie analysis', 'Video editing', 'Research', 'Music / Sound', 'Other',
]

interface CreativeContentProps {
  today: string
  projects: CreativeProject[]
  todaySessions: any[]
  todayMinutes: number
  totalMinutes: number
  userId: string
}

export function CreativeContent({
  today,
  projects,
  todaySessions,
  todayMinutes,
  totalMinutes,
  userId,
}: CreativeContentProps) {
  const [activeTab, setActiveTab] = useState('vault')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<CreativeProject | null>(null)
  const [pForm, setPForm] = useState({
    title: '', logline: '', genre: '', characters: '', story: '',
    scenes: '', notes: '', status: 'idea' as CreativeProjectStatus,
  })
  const [sForm, setSForm] = useState({ activity: '', minutes: 30, project_id: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const [, startTransition] = useTransition()
  const refresh = () => startTransition(() => router.refresh())
  const supabase = createClient()

  const handleSaveProject = async () => {
    if (!pForm.title) return
    setSaving(true)
    if (selectedProject?.id) {
      await supabase.from('creative_projects').update(pForm).eq('id', selectedProject.id)
    } else {
      await supabase.from('creative_projects').insert(pForm)
    }
    setSaving(false)
    setShowProjectForm(false)
    setSelectedProject(null)
    setPForm({ title: '', logline: '', genre: '', characters: '', story: '', scenes: '', notes: '', status: 'idea' })
    refresh()
  }

  const handleSaveSession = async () => {
    if (!sForm.activity || sForm.minutes <= 0) return
    setSaving(true)
    await supabase.from('creative_sessions').insert({
      date: today,
      activity: sForm.activity,
      minutes: sForm.minutes,
      project_id: sForm.project_id || null,
      notes: sForm.notes || null,
    })
    setSaving(false)
    setShowSessionForm(false)
    setSForm({ activity: '', minutes: 30, project_id: '', notes: '' })
    refresh()
  }

  const handleEdit = (project: CreativeProject) => {
    setSelectedProject(project)
    setPForm({
      title: project.title,
      logline: project.logline ?? '',
      genre: project.genre ?? '',
      characters: project.characters ?? '',
      story: project.story ?? '',
      scenes: project.scenes ?? '',
      notes: project.notes ?? '',
      status: project.status,
    })
    setShowProjectForm(true)
    setActiveTab('vault')
  }

  const TABS = [
    { id: 'vault', label: 'Vault', icon: '🎬' },
    { id: 'today', label: 'Today', icon: '⚡' },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-foreground">Creative Mode</h1>
        <p className="text-sm text-muted-foreground">Filmmaking · Storytelling · Creative work</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="arc-card text-center">
          <p className="text-2xl font-black text-primary">{todayMinutes}m</p>
          <p className="text-xs text-muted-foreground mt-1">Creative today</p>
        </div>
        <div className="arc-card text-center">
          <p className="text-2xl font-black text-foreground">{projects.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Projects in vault</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-creative-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2 rounded-lg transition-all',
              activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Vault tab */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="section-header">Creative Vault ({projects.length})</p>
            <button
              id="add-project"
              onClick={() => { setSelectedProject(null); setShowProjectForm(!showProjectForm) }}
              className="text-xs text-primary font-semibold hover:underline"
            >
              + New idea
            </button>
          </div>

          {showProjectForm && (
            <div className="arc-card space-y-3">
              <h3 className="font-bold text-sm text-foreground">
                {selectedProject ? 'Edit Project' : 'New Creative Project'}
              </h3>
              <input
                placeholder="Title"
                value={pForm.title}
                onChange={(e) => setPForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                placeholder="Logline (one-sentence summary)"
                value={pForm.logline}
                onChange={(e) => setPForm(f => ({ ...f, logline: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Genre"
                  value={pForm.genre}
                  onChange={(e) => setPForm(f => ({ ...f, genre: e.target.value }))}
                  className="bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <select
                  value={pForm.status}
                  onChange={(e) => setPForm(f => ({ ...f, status: e.target.value as CreativeProjectStatus }))}
                  className="bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              {['characters', 'story', 'scenes', 'notes'].map(field => (
                <textarea
                  key={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={(pForm as any)[field]}
                  onChange={(e) => setPForm(f => ({ ...f, [field]: e.target.value }))}
                  rows={2}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              ))}
              <div className="flex gap-2">
                <button onClick={handleSaveProject} disabled={saving}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-xl text-sm disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => { setShowProjectForm(false); setSelectedProject(null) }}
                  className="px-4 py-2 bg-secondary text-foreground rounded-xl text-sm border border-border">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {projects.length === 0 ? (
            <div className="arc-card text-center py-10 space-y-2">
              <p className="text-4xl">🎬</p>
              <p className="font-semibold text-foreground">Your Creative Vault is empty</p>
              <p className="text-sm text-muted-foreground">Add your first film idea or creative project</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="arc-card space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground">{p.title}</p>
                      {p.logline && <p className="text-xs text-muted-foreground mt-0.5">{p.logline}</p>}
                      {p.genre && <p className="text-xs text-muted-foreground">{p.genre}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[p.status])}>
                        {STATUS_LABELS[p.status]}
                      </span>
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Today tab */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {!showSessionForm ? (
            <button
              id="log-creative-session"
              onClick={() => setShowSessionForm(true)}
              className="w-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-semibold py-3 rounded-xl transition-all text-sm"
            >
              + Log Creative Session
            </button>
          ) : (
            <div className="arc-card space-y-3">
              <h3 className="font-bold text-sm text-foreground">Creative Session</h3>
              <select
                value={sForm.activity}
                onChange={(e) => setSForm(f => ({ ...f, activity: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select activity…</option>
                {CREATIVE_ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {projects.length > 0 && (
                <select
                  value={sForm.project_id}
                  onChange={(e) => setSForm(f => ({ ...f, project_id: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">No specific project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              )}
              <div className="flex flex-wrap gap-2">
                {[15, 30, 45, 60, 90, 120].map(m => (
                  <button key={m} onClick={() => setSForm(f => ({ ...f, minutes: m }))}
                    className={cn('text-xs px-3 py-1.5 rounded-lg border transition-all',
                      sForm.minutes === m ? 'bg-primary/20 text-primary border-primary/30' : 'bg-secondary/50 text-muted-foreground border-border')}>
                    {m}m
                  </button>
                ))}
              </div>
              <textarea
                value={sForm.notes}
                onChange={(e) => setSForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="What did you create?"
                rows={2}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="flex gap-2">
                <button onClick={handleSaveSession} disabled={saving}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-xl text-sm disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save session'}
                </button>
                <button onClick={() => setShowSessionForm(false)}
                  className="px-4 py-2 bg-secondary text-foreground rounded-xl text-sm border border-border">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {todaySessions.length > 0 ? (
            <div className="space-y-2">
              <p className="section-header">Today's creative work</p>
              {todaySessions.map((s: any) => (
                <div key={s.id} className="arc-card flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{s.activity}</p>
                    {s.notes && <p className="text-xs text-muted-foreground">{s.notes}</p>}
                  </div>
                  <span className="text-sm font-bold text-primary">{s.minutes}m</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="arc-card text-center py-8 space-y-2">
              <p className="text-3xl">🎬</p>
              <p className="font-semibold text-foreground">No creative sessions today</p>
              <p className="text-sm text-muted-foreground">Even 15 minutes of creative work counts</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
