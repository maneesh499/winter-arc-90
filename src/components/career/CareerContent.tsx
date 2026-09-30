'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { formatMinutes } from '@/lib/utils'
import { PROGRAM_DAYS } from '@/lib/dates'
import { LearningSessionForm } from './LearningSessionForm'
import { JobApplicationList } from './JobApplicationList'
import { InterviewList } from './InterviewList'
import type { LearningSession, JobApplication, Interview } from '@/types'

interface CareerContentProps {
  today: string
  dayNumber: number | null
  todaySessions: LearningSession[]
  todayMinutes: number
  weekMinutes: number
  totalMinutes: number
  applications: Partial<JobApplication>[]
  activeApplications: number
  interviews: Partial<Interview>[]
  userId: string
}

const TABS = [
  { id: 'today', label: 'Today', icon: '⚡' },
  { id: 'jobs', label: 'Jobs', icon: '💼' },
  { id: 'interviews', label: 'Interviews', icon: '🎯' },
]

export function CareerContent({
  today,
  dayNumber,
  todaySessions,
  todayMinutes,
  weekMinutes,
  totalMinutes,
  applications,
  activeApplications,
  interviews,
  userId,
}: CareerContentProps) {
  const [activeTab, setActiveTab] = useState('today')
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()
  const [, startTransition] = useTransition()

  const refresh = () => startTransition(() => router.refresh())

  const CAREER_TOPICS = [
    'SQL', 'Python', 'PySpark', 'Spark', 'Databricks',
    'Azure Data Factory', 'ADLS', 'Azure', 'Power BI', 'Microsoft Fabric',
    'LangChain', 'RAG', 'GenAI', 'Data Engineering', 'System Design',
    'Project Explanation', 'Interview Preparation', 'Resume', 'LinkedIn',
    'Applications', 'Referrals', 'Mock Interviews', 'Other',
  ]

  // Group sessions by topic today
  const topicMap = todaySessions.reduce((acc, s) => {
    acc[s.topic] = (acc[s.topic] || 0) + s.minutes
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        {dayNumber && (
          <p className="day-counter">Day {dayNumber} / {PROGRAM_DAYS}</p>
        )}
        <h1 className="text-2xl font-black text-foreground mt-1">Career Mode</h1>
        <p className="text-sm text-muted-foreground">Job switch preparation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="arc-card text-center">
          <p className="text-2xl font-black text-primary">
            {todayMinutes >= 60
              ? `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60 > 0 ? `${todayMinutes % 60}m` : ''}`
              : `${todayMinutes}m`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Today</p>
        </div>
        <div className="arc-card text-center">
          <p className="text-2xl font-black text-foreground">
            {weekMinutes >= 60 ? `${Math.floor(weekMinutes / 60)}h` : `${weekMinutes}m`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">This week</p>
        </div>
        <div className="arc-card text-center">
          <p className="text-2xl font-black text-foreground">
            {Math.floor(totalMinutes / 60)}h
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-career-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all duration-200',
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TODAY tab */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {/* Log session button */}
          {!showForm ? (
            <button
              id="career-log-session"
              onClick={() => setShowForm(true)}
              className="w-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-semibold py-3 rounded-xl transition-all text-sm"
            >
              + Log Learning Session
            </button>
          ) : (
            <LearningSessionForm
              date={today}
              topics={CAREER_TOPICS}
              onSave={() => { setShowForm(false); refresh() }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Today's sessions */}
          {todaySessions.length === 0 ? (
            <div className="arc-card text-center py-8 space-y-2">
              <p className="text-3xl">📚</p>
              <p className="font-semibold text-foreground">No sessions logged yet today</p>
              <p className="text-sm text-muted-foreground">Target: 60+ minutes daily</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="section-header">Today's sessions</p>
              {todaySessions.map((s) => (
                <div key={s.id} className="arc-card flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{s.topic}</p>
                    {s.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5">{s.notes}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {s.minutes}m
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Topic breakdown */}
          {Object.keys(topicMap).length > 0 && (
            <div className="arc-card space-y-2">
              <p className="section-header">Today by topic</p>
              {Object.entries(topicMap).map(([topic, mins]) => (
                <div key={topic} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground font-medium">{topic}</span>
                    <span className="text-muted-foreground">{mins}m</span>
                  </div>
                  <div className="arc-progress">
                    <div
                      className="arc-progress-fill"
                      style={{ width: `${Math.min(100, (mins / Math.max(todayMinutes, 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick nav */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/dashboard/career/applications"
              className="arc-card hover:border-primary/30 transition-all text-center py-4"
            >
              <p className="text-2xl font-black text-foreground">{applications.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Applications</p>
            </a>
            <a
              href="/dashboard/career/interviews"
              className="arc-card hover:border-primary/30 transition-all text-center py-4"
            >
              <p className="text-2xl font-black text-foreground">{interviews.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Interviews</p>
            </a>
          </div>
        </div>
      )}

      {/* JOBS tab */}
      {activeTab === 'jobs' && (
        <JobApplicationList applications={applications} onUpdate={refresh} />
      )}

      {/* INTERVIEWS tab */}
      {activeTab === 'interviews' && (
        <InterviewList interviews={interviews} onUpdate={refresh} />
      )}
    </div>
  )
}
