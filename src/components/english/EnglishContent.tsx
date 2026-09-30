'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PROGRAM_DAYS } from '@/lib/dates'
import { SpeakingLogger } from './SpeakingLogger'
import { VocabLogger } from './VocabLogger'
import { GrammarLogger } from './GrammarLogger'
import { InterviewAnswerCards } from './InterviewAnswerCards'
import type { EnglishSession, EnglishVocabulary, EnglishInterviewAnswer } from '@/types'

interface EnglishContentProps {
  today: string
  dayNumber: number | null
  todaySessions: EnglishSession[]
  todayVocab: EnglishVocabulary[]
  interviewAnswers: EnglishInterviewAnswer[]
  todayMinutes: number
  weekMinutes: number
  totalVocabCount: number
  activityBreakdown: Record<string, number>
  userId: string
}

const ACTIVITY_LABELS: Record<string, string> = {
  speaking: 'Speaking',
  reading_aloud: 'Reading Aloud',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  interview_speaking: 'Interview Speaking',
}

const TABS = [
  { id: 'today', label: 'Today', icon: '📅' },
  { id: 'speaking', label: 'Speaking', icon: '🗣️' },
  { id: 'vocab', label: 'Vocab', icon: '📖' },
  { id: 'interview', label: 'Interview', icon: '🎤' },
]

export function EnglishContent({
  today,
  dayNumber,
  todaySessions,
  todayVocab,
  interviewAnswers,
  todayMinutes,
  weekMinutes,
  totalVocabCount,
  activityBreakdown,
  userId,
}: EnglishContentProps) {
  const [activeTab, setActiveTab] = useState('today')
  const router = useRouter()
  const [, startTransition] = useTransition()
  const refresh = () => startTransition(() => router.refresh())

  const speakingMinutes = activityBreakdown['speaking'] || 0
  const vocabToday = todayVocab.length
  const readingMinutes = activityBreakdown['reading_aloud'] || 0
  const grammarSessions = todaySessions.filter(s => s.activity_type === 'grammar').length
  const interviewSessions = todaySessions.filter(s => s.activity_type === 'interview_speaking').length

  // English score for today (0-100)
  const englishScore = Math.min(100, Math.round(
    (speakingMinutes >= 10 ? 25 : (speakingMinutes / 10) * 25) +
    (vocabToday >= 5 ? 25 : (vocabToday / 5) * 25) +
    (readingMinutes >= 10 ? 20 : (readingMinutes / 10) * 20) +
    (grammarSessions >= 1 ? 15 : 0) +
    (interviewSessions >= 1 ? 15 : 0)
  ))

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        {dayNumber && <p className="day-counter">Day {dayNumber} / {PROGRAM_DAYS}</p>}
        <h1 className="text-2xl font-black text-foreground mt-1">English Communication</h1>
        <p className="text-sm text-muted-foreground">Speaking · Vocabulary · Grammar · Interview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="arc-card text-center">
          <p className="text-2xl font-black text-primary">{todayMinutes}m</p>
          <p className="text-xs text-muted-foreground mt-1">Today</p>
        </div>
        <div className="arc-card text-center">
          <p className="text-2xl font-black text-foreground">{vocabToday}</p>
          <p className="text-xs text-muted-foreground mt-1">Words today</p>
        </div>
        <div className="arc-card text-center">
          <p className="text-2xl font-black text-foreground">{totalVocabCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Total vocab</p>
        </div>
      </div>

      {/* Daily English score */}
      <div className="arc-card space-y-3">
        <div className="flex items-center justify-between">
          <p className="section-header">English Today</p>
          <span className={cn(
            'text-sm font-bold',
            englishScore >= 80 ? 'text-green-400' : englishScore >= 50 ? 'text-yellow-400' : 'text-muted-foreground'
          )}>
            {englishScore}%
          </span>
        </div>

        {/* Activity rows */}
        {[
          { key: 'speaking', label: 'Speaking', target: '10 min', value: speakingMinutes, unit: 'm', targetVal: 10 },
          { key: 'vocab', label: 'Vocabulary', target: '5 words', value: vocabToday, unit: ' words', targetVal: 5 },
          { key: 'reading_aloud', label: 'Reading Aloud', target: '10 min', value: readingMinutes, unit: 'm', targetVal: 10 },
          { key: 'grammar', label: 'Grammar', target: '1 session', value: grammarSessions, unit: ' session', targetVal: 1 },
          { key: 'interview_speaking', label: 'Interview Practice', target: '1 session', value: interviewSessions, unit: ' session', targetVal: 1 },
        ].map((item) => (
          <div key={item.key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-foreground font-medium">{item.label}</span>
              <span className={item.value >= item.targetVal ? 'text-green-400' : 'text-muted-foreground'}>
                {item.value}{item.unit} / {item.target}
              </span>
            </div>
            <div className="arc-progress">
              <div
                className={cn(
                  'arc-progress-fill',
                  item.value >= item.targetVal ? 'bg-green-500' : ''
                )}
                style={{ width: `${Math.min(100, (item.value / item.targetVal) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-english-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 rounded-lg transition-all duration-200',
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="hidden sm:block">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'today' && (
        <div className="space-y-4">
          {todaySessions.length === 0 ? (
            <div className="arc-card text-center py-8 space-y-2">
              <p className="text-3xl">🗣️</p>
              <p className="font-semibold text-foreground">No English practice yet today</p>
              <p className="text-sm text-muted-foreground">Use the tabs above to log sessions</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="section-header">Today's practice</p>
              {todaySessions.map((s) => (
                <div key={s.id} className="arc-card flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {ACTIVITY_LABELS[s.activity_type] || s.activity_type}
                    </p>
                    {s.topic && <p className="text-xs text-muted-foreground">{s.topic}</p>}
                    {s.self_rating && (
                      <p className="text-xs text-muted-foreground">
                        Self-rating: {s.self_rating}/5
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-primary">{s.minutes}m</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'speaking' && (
        <SpeakingLogger date={today} onSave={refresh} />
      )}

      {activeTab === 'vocab' && (
        <VocabLogger
          date={today}
          todayWords={todayVocab}
          onSave={refresh}
        />
      )}

      {activeTab === 'interview' && (
        <div className="space-y-4">
          <GrammarLogger date={today} onSave={refresh} />
          <InterviewAnswerCards answers={interviewAnswers} onUpdate={refresh} />
        </div>
      )}
    </div>
  )
}
