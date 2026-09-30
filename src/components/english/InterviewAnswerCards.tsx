'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { EnglishInterviewAnswer } from '@/types'

const DEFAULT_QUESTIONS = [
  'Tell me about yourself.',
  'Explain your current project.',
  'What did you build using Databricks?',
  'How did you use PySpark?',
  'Explain an ADF pipeline.',
  'Explain a difficult problem you solved.',
  'Why are you looking for a job change?',
  'What are your strengths?',
  'Tell me about a production issue you handled.',
  'Explain one project from beginning to end.',
]

interface InterviewAnswerCardsProps {
  answers: EnglishInterviewAnswer[]
  onUpdate: () => void
}

export function InterviewAnswerCards({ answers, onUpdate }: InterviewAnswerCardsProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editConfidence, setEditConfidence] = useState(3)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Questions that have answers saved
  const answeredIds = new Set(answers.map(a => a.id))
  const answeredQuestions = new Set(answers.map(a => a.question))

  const handlePractice = async (answerId: string, question: string) => {
    const answer = answers.find(a => a.id === answerId)
    setEditing(answerId)
    setEditNotes(answer?.answer_notes ?? '')
    setEditConfidence(answer?.confidence ?? 3)
    setExpanded(answerId)
  }

  const handleSavePractice = async (answerId: string) => {
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('english_interview_answers')
      .update({
        answer_notes: editNotes || null,
        confidence: editConfidence,
        last_practiced: today,
        practice_count: (answers.find(a => a.id === answerId)?.practice_count ?? 0) + 1,
      })
      .eq('id', answerId)

    // Also log an English session
    await supabase.from('english_sessions').insert({
      date: today,
      activity_type: 'interview_speaking',
      minutes: 5,
      topic: answers.find(a => a.id === answerId)?.question ?? 'Interview practice',
      self_rating: editConfidence,
    })

    setSaving(false)
    setEditing(null)
    onUpdate()
  }

  const handleAddQuestion = async (question: string) => {
    setSaving(true)
    await supabase.from('english_interview_answers').insert({
      question,
      answer_notes: null,
      confidence: null,
      last_practiced: null,
      practice_count: 0,
    })
    setSaving(false)
    setShowAddForm(false)
    setNewQuestion('')
    onUpdate()
  }

  const CONFIDENCE_LABEL = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Confident']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="section-header">Interview Answer Practice</p>
        <button
          id="add-interview-question"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs text-primary font-semibold hover:underline"
        >
          + Custom
        </button>
      </div>

      {showAddForm && (
        <div className="arc-card space-y-3">
          <input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Enter custom question…"
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAddQuestion(newQuestion)}
              disabled={saving || !newQuestion.trim()}
              className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-xl text-sm disabled:opacity-50"
            >
              Add
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-secondary text-foreground font-semibold rounded-xl text-sm border border-border">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Default questions not yet added */}
      {DEFAULT_QUESTIONS.filter(q => !answeredQuestions.has(q)).length > 0 && answers.length < 3 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Quick add default questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_QUESTIONS.filter(q => !answeredQuestions.has(q)).slice(0, 3).map(q => (
              <button
                key={q}
                onClick={() => handleAddQuestion(q)}
                className="text-xs bg-secondary/50 text-muted-foreground border border-border px-2.5 py-1 rounded-lg hover:border-primary/30 hover:text-foreground transition-all"
              >
                {q.length > 40 ? q.slice(0, 40) + '…' : q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saved answers */}
      {answers.length === 0 ? (
        <div className="arc-card text-center py-8 space-y-2">
          <p className="text-3xl">🎤</p>
          <p className="font-semibold text-foreground">No interview questions yet</p>
          <p className="text-sm text-muted-foreground">Add questions and practice your answers</p>
        </div>
      ) : (
        <div className="space-y-2">
          {answers.map((a) => (
            <div key={a.id} className="arc-card">
              <div
                className="flex items-start justify-between gap-2 cursor-pointer"
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              >
                <p className="text-sm font-semibold text-foreground flex-1">{a.question}</p>
                <div className="flex items-center gap-2 shrink-0">
                  {a.confidence && (
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      a.confidence >= 4 ? 'bg-green-500/20 text-green-400' :
                      a.confidence >= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    )}>
                      {CONFIDENCE_LABEL[a.confidence]}
                    </span>
                  )}
                  <span className="text-muted-foreground text-xs">{expanded === a.id ? '↑' : '↓'}</span>
                </div>
              </div>

              {expanded === a.id && (
                <div className="mt-3 space-y-3 border-t border-border pt-3">
                  {a.last_practiced && (
                    <p className="text-xs text-muted-foreground">
                      Last practiced: {a.last_practiced} · {a.practice_count} times
                    </p>
                  )}

                  {editing === a.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Your answer notes, key points, structure…"
                        rows={4}
                        className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                          Confidence: {editConfidence}/5
                        </p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((c) => (
                            <button
                              key={c}
                              onClick={() => setEditConfidence(c)}
                              className={cn(
                                'flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all',
                                c <= editConfidence
                                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                  : 'bg-secondary/50 text-muted-foreground border-border'
                              )}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSavePractice(a.id)}
                          disabled={saving}
                          className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-xl text-sm disabled:opacity-50"
                        >
                          {saving ? 'Saving…' : 'Save practice'}
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="px-3 py-2 bg-secondary text-foreground rounded-xl text-sm border border-border"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {a.answer_notes && (
                        <p className="text-sm text-foreground bg-secondary/50 rounded-lg p-3">
                          {a.answer_notes}
                        </p>
                      )}
                      <button
                        onClick={() => handlePractice(a.id, a.question)}
                        className="w-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-semibold py-2 rounded-xl text-sm transition-all"
                      >
                        Practice now
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
