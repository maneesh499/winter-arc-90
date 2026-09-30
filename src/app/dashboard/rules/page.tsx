import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Winter Arc Rules',
  description: 'The 17 Winter Arc principles for 90 days of discipline and growth.',
}

const RULES = [
  { num: 1, rule: "Don't chase perfection.", detail: "A good day is better than a perfect plan. Start." },
  { num: 2, rule: "Never miss twice.", detail: "One miss is an accident. Two misses is a new habit. Stop it at one." },
  { num: 3, rule: "Focus on today's actions.", detail: "You can't control Day 45. You can control the next hour." },
  { num: 4, rule: "Protect sleep.", detail: "No hustle is worth chronic sleep deprivation. Sleep is performance." },
  { num: 5, rule: "Train consistently, not recklessly.", detail: "Show up. Don't try to make up for missed weeks in one session." },
  { num: 6, rule: "Study for the career you want.", detail: "Every session of SQL, Python, PySpark is an investment. Do the work." },
  { num: 7, rule: "Practice English every day.", detail: "Even 5 minutes of conscious practice compounds. Don't skip." },
  { num: 8, rule: "Track money honestly.", detail: "Awareness of spending is the first step. Track it, don't judge it." },
  { num: 9, rule: "Build something every week.", detail: "A project, a script, a query — something tangible. Show the work." },
  { num: 10, rule: "Keep filmmaking alive.", detail: "A story idea. A shot plan. A scene. Creative work deserves time." },
  { num: 11, rule: "Keep your environment clean.", detail: "A clean desk is a clear mind. 10 minutes before bed." },
  { num: 12, rule: "A bad day is information, not identity.", detail: "What happened? What caused it? What do I change tomorrow?" },
  { num: 13, rule: "Recovery is part of consistency.", detail: "Rest is not weakness. It is how the gains consolidate." },
  { num: 14, rule: "Don't compare your journey with someone else's.", detail: "Their Day 1 is not your Day 1. Focus on your arc." },
  { num: 15, rule: "Don't let the tracker itself become procrastination.", detail: "Log quickly. Execute first." },
  { num: 16, rule: "If you fall off, restart the next day.", detail: "Not next Monday. Not next month. Tomorrow." },
  { num: 17, rule: "Win today.", detail: "That's it. That's the whole plan." },
]

export default function RulesPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-foreground">The 17 Rules</h1>
        <p className="text-sm text-muted-foreground">Winter Arc 90 — Philosophy</p>
      </div>

      <div className="space-y-3">
        {RULES.map((r) => (
          <div key={r.num} className="arc-card flex gap-4">
            <span className="text-primary font-black text-lg w-7 shrink-0">{r.num}.</span>
            <div>
              <p className="font-bold text-foreground">{r.rule}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{r.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="arc-card text-center py-6 space-y-2">
        <p className="text-3xl">🏔️</p>
        <p className="font-black text-foreground text-lg">90 Days.</p>
        <p className="text-sm text-muted-foreground">Oct 1 → Dec 29, 2026</p>
        <Link href="/dashboard" className="inline-block mt-2 text-primary font-semibold hover:underline text-sm">
          Back to Dashboard →
        </Link>
      </div>
    </div>
  )
}
