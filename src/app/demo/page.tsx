import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo — Winter Arc 90',
  description: 'See what Winter Arc 90 looks like after 27 days of use.',
}

// Completely static demo data — zero connection to real database
const DEMO_DAY = 27
const DEMO_SCORE = 78
const DEMO_STREAK = 19

const DEMO_HABITS = [
  { name: 'No Porn', icon: '🔥', status: 'kept', category: 'discipline' },
  { name: 'Digital Discipline', icon: '📵', status: 'kept', category: 'discipline' },
  { name: 'No Added Sugar', icon: '🚫', status: 'partial', category: 'discipline' },
  { name: 'Gym / Workout', icon: '💪', status: 'kept', category: 'health' },
  { name: 'Reading', icon: '📚', status: 'kept', category: 'health' },
  { name: 'Outdoor Time', icon: '☀️', status: 'kept', category: 'health' },
  { name: 'English Practice', icon: '🗣️', status: 'kept', category: 'english' },
  { name: 'Career Study', icon: '💼', status: 'kept', category: 'career' },
  { name: 'Healthy Eating', icon: '🥗', status: 'partial', category: 'health' },
  { name: 'Daily Review', icon: '📝', status: 'kept', category: 'productivity' },
]

const DEMO_HEATMAP = [
  78, 82, 65, 90, 55, 45, 88, 76, 91, 83, 72, 60, 85, 79, 88, 92, 67, 74, 81, 88, 76, 90, 83, 71, 85, 88, 78,
  ...Array(63).fill(null),
]

const DEMO_CAREER = { today: 75, week: 420, total: 1680 }
const DEMO_ENGLISH = { today: 25, vocabToday: 7, totalVocab: 189 }
const DEMO_GYM = { sessions: 21, currentStreak: 5, bestStreak: 12 }
const DEMO_WATER = { today: 2.2, target: 2.5 }
const DEMO_READING = { pages: 84, booksInProgress: 1 }
const DEMO_APPS = 8
const DEMO_FINANCE = { spent: 14200, income: 23600, remaining: 9400 }

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    kept: 'bg-green-500',
    partial: 'bg-yellow-500',
    failed: 'bg-red-500',
    not_logged: 'bg-secondary',
  }
  return <span className={`w-2 h-2 rounded-full shrink-0 ${colors[status] ?? 'bg-secondary'}`} />
}

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 max-w-md mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl px-4 py-3 text-center">
        <p className="text-sm text-amber-400 font-semibold">📺 Demo Mode — Fake Data</p>
        <p className="text-xs text-muted-foreground mt-0.5">This is not your real data. Sign in to get started.</p>
      </div>

      {/* Header */}
      <div>
        <p className="text-xs font-bold text-primary uppercase tracking-widest">Day {DEMO_DAY} / 90</p>
        <h1 className="text-2xl font-black text-foreground mt-1">Winter Arc 90</h1>
        <p className="text-sm text-muted-foreground">Oct 27, 2026 · Asia/Kolkata</p>
      </div>

      {/* Score ring */}
      <div className="arc-card text-center py-6 space-y-1">
        <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center mx-auto relative">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
            <circle
              cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8"
              className="text-primary"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - DEMO_SCORE / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">{DEMO_SCORE}%</p>
          </div>
        </div>
        <p className="text-sm font-semibold text-foreground">🟢 Good Day</p>
        <p className="text-xs text-muted-foreground">Streak: {DEMO_STREAK} days 🔥</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="arc-card text-center">
          <p className="text-xl font-black text-primary">{DEMO_CAREER.today}m</p>
          <p className="text-xs text-muted-foreground mt-1">Career</p>
        </div>
        <div className="arc-card text-center">
          <p className="text-xl font-black text-foreground">{DEMO_ENGLISH.today}m</p>
          <p className="text-xs text-muted-foreground mt-1">English</p>
        </div>
        <div className="arc-card text-center">
          <p className="text-xl font-black text-foreground">{DEMO_GYM.sessions}</p>
          <p className="text-xs text-muted-foreground mt-1">Gym sessions</p>
        </div>
      </div>

      {/* Today's habits */}
      <div className="arc-card space-y-3">
        <p className="section-header">Today's Habits</p>
        <div className="space-y-2">
          {DEMO_HABITS.map((h) => (
            <div key={h.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{h.icon}</span>
                <span className="text-sm text-foreground font-medium">{h.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot status={h.status} />
                <span className="text-xs text-muted-foreground capitalize">{h.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 90-Day Heatmap preview */}
      <div className="arc-card space-y-3">
        <p className="section-header">27-Day Heatmap</p>
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
          {DEMO_HEATMAP.map((score, i) => (
            <div
              key={i}
              className={`heatmap-cell aspect-square rounded-sm ${
                score === null
                  ? 'opacity-10 bg-secondary'
                  : score >= 80 ? 'heatmap-full'
                  : score >= 60 ? 'heatmap-high'
                  : score >= 40 ? 'heatmap-medium'
                  : 'heatmap-low'
              }`}
              title={score !== null ? `Day ${i + 1}: ${score}%` : `Day ${i + 1}: Future`}
            />
          ))}
        </div>
      </div>

      {/* Career & English */}
      <div className="grid grid-cols-2 gap-3">
        <div className="arc-card space-y-2">
          <p className="section-header">Career</p>
          <p className="text-xl font-black text-primary">{Math.floor(DEMO_CAREER.total / 60)}h</p>
          <p className="text-xs text-muted-foreground">Total prep</p>
          <p className="text-xs text-foreground">{DEMO_APPS} applications tracked</p>
        </div>
        <div className="arc-card space-y-2">
          <p className="section-header">English</p>
          <p className="text-xl font-black text-foreground">{DEMO_ENGLISH.totalVocab}</p>
          <p className="text-xs text-muted-foreground">Words learned</p>
          <p className="text-xs text-foreground">{DEMO_ENGLISH.vocabToday} added today</p>
        </div>
      </div>

      {/* Finance */}
      <div className="arc-card space-y-2">
        <p className="section-header">Finance — October</p>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Income</span>
          <span className="text-green-400 font-bold">₹{DEMO_FINANCE.income.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Spent</span>
          <span className="text-red-400 font-bold">₹{DEMO_FINANCE.spent.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-border pt-2">
          <span className="text-foreground">Remaining</span>
          <span className="text-primary">₹{DEMO_FINANCE.remaining.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="arc-card text-center space-y-3 py-6">
        <p className="text-3xl">🏔️</p>
        <p className="font-black text-foreground text-lg">Ready to start your 90 days?</p>
        <p className="text-sm text-muted-foreground">Oct 1 – Dec 29, 2026</p>
        <div className="flex gap-3">
          <Link
            href="/auth/signup"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl text-sm transition-all text-center"
          >
            Start Winter Arc
          </Link>
          <Link
            href="/auth/login"
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-bold py-3 rounded-xl text-sm border border-border transition-all text-center"
          >
            Sign in
          </Link>
        </div>
        <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Privacy policy →
        </Link>
      </div>
    </main>
  )
}
