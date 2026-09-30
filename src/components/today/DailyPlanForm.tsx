'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DailyPlanFormProps {
  plan: {
    id: string
    top_1: string | null
    top_2: string | null
    top_3: string | null
    career_topic: string | null
    english_topic: string | null
    workout_plan: string | null
    creative_task: string | null
    project_task: string | null
    rapido_plan: boolean
    notes: string | null
  } | null
  date: string
  onUpdate: () => void
}

const CAREER_TOPICS = [
  'SQL', 'Python', 'PySpark', 'Spark', 'Databricks', 'Azure Data Factory',
  'ADLS', 'Azure', 'Power BI', 'Microsoft Fabric', 'LangChain', 'RAG',
  'GenAI', 'Data Engineering', 'System Design', 'Interview Preparation',
  'Resume', 'LinkedIn', 'Mock Interviews',
]

const ENGLISH_TOPICS = [
  'Speaking practice', 'Vocabulary (5 words)', 'Reading aloud', 'Grammar practice',
  'Interview answers', 'Technical explanation',
]

export function DailyPlanForm({ plan, date, onUpdate }: DailyPlanFormProps) {
  const [top1, setTop1] = useState(plan?.top_1 ?? '')
  const [top2, setTop2] = useState(plan?.top_2 ?? '')
  const [top3, setTop3] = useState(plan?.top_3 ?? '')
  const [careerTopic, setCareerTopic] = useState(plan?.career_topic ?? '')
  const [englishTopic, setEnglishTopic] = useState(plan?.english_topic ?? '')
  const [workout, setWorkout] = useState(plan?.workout_plan ?? '')
  const [creativeTask, setCreativeTask] = useState(plan?.creative_task ?? '')
  const [projectTask, setProjectTask] = useState(plan?.project_task ?? '')
  const [rapidoPlan, setRapidoPlan] = useState(plan?.rapido_plan ?? false)
  const [notes, setNotes] = useState(plan?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  // Get tomorrow's date
  const tomorrow = new Date(date)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const handleSave = async () => {
    setSaving(true)
    const data = {
      date: tomorrowStr, // Plan is for tomorrow
      top_1: top1 || null,
      top_2: top2 || null,
      top_3: top3 || null,
      career_topic: careerTopic || null,
      english_topic: englishTopic || null,
      workout_plan: workout || null,
      creative_task: creativeTask || null,
      project_task: projectTask || null,
      rapido_plan: rapidoPlan,
      notes: notes || null,
    }
    if (plan?.id) {
      await supabase.from('daily_plans').update(data).eq('id', plan.id)
    } else {
      await supabase.from('daily_plans').upsert(data, { onConflict: 'user_id,date' })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onUpdate()
  }

  return (
    <div className="space-y-4">
      <div className="arc-card space-y-4">
        <h2 className="font-black text-foreground text-lg">Plan Tomorrow</h2>

        {/* Top 3 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Tomorrow's Top 3
          </label>
          {[
            { num: 1, value: top1, set: setTop1, id: 'plan-top1' },
            { num: 2, value: top2, set: setTop2, id: 'plan-top2' },
            { num: 3, value: top3, set: setTop3, id: 'plan-top3' },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-2">
              <span className="text-xs font-black text-primary w-4 shrink-0">{item.num}.</span>
              <input
                id={item.id}
                type="text"
                value={item.value}
                onChange={(e) => item.set(e.target.value)}
                placeholder={`Priority ${item.num}…`}
                className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          ))}
        </div>

        {/* Career topic */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Career focus</label>
          <select
            id="plan-career"
            value={careerTopic}
            onChange={(e) => setCareerTopic(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Choose topic…</option>
            {CAREER_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* English topic */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">English focus</label>
          <select
            id="plan-english"
            value={englishTopic}
            onChange={(e) => setEnglishTopic(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Choose activity…</option>
            {ENGLISH_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Workout */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Workout plan</label>
          <input
            id="plan-workout"
            type="text"
            value={workout}
            onChange={(e) => setWorkout(e.target.value)}
            placeholder="Push day / Cardio / Rest…"
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Creative & Project */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Creative</label>
            <input
              type="text"
              value={creativeTask}
              onChange={(e) => setCreativeTask(e.target.value)}
              placeholder="Task…"
              className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Project</label>
            <input
              type="text"
              value={projectTask}
              onChange={(e) => setProjectTask(e.target.value)}
              placeholder="Task…"
              className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Rapido toggle */}
        <div className="flex items-center gap-3">
          <button
            id="plan-rapido"
            role="switch"
            aria-checked={rapidoPlan}
            onClick={() => setRapidoPlan(!rapidoPlan)}
            className={`relative w-10 h-6 rounded-full transition-all ${
              rapidoPlan ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
              rapidoPlan ? 'left-5' : 'left-1'
            }`} />
          </button>
          <label className="text-sm text-foreground font-medium">Rapido plan</label>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else to remember…"
            rows={2}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <button
          id="plan-save"
          onClick={handleSave}
          disabled={saving}
          className={`w-full font-bold py-3 rounded-xl transition-all text-sm ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          } disabled:opacity-50`}
        >
          {saving ? 'Saving…' : saved ? '✓ Tomorrow is planned' : 'Plan Tomorrow'}
        </button>
      </div>
    </div>
  )
}
