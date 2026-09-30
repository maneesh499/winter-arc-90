import Link from 'next/link'
import { getTodayDayNumber, PROGRAM_DAYS } from '@/lib/dates'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'More' }

const MODULES = [
  { href: '/dashboard/career', label: 'Career Mode', description: 'SQL, Python, PySpark, Databricks, ADF…', icon: '💼' },
  { href: '/dashboard/english', label: 'English Communication', description: 'Speaking, vocabulary, grammar, interview', icon: '🗣️' },
  { href: '/dashboard/health', label: 'Health', description: 'Gym, sleep, nutrition, water', icon: '💪' },
  { href: '/dashboard/finance', label: 'Finance', description: 'Income, expenses, budget', icon: '💰' },
  { href: '/dashboard/creative', label: 'Creative Mode', description: 'Filmmaking, screenplay, creative vault', icon: '🎬' },
  { href: '/dashboard/rapido', label: 'Rapido', description: 'Side income tracker (optional)', icon: '🛵' },
  { href: '/dashboard/progress', label: '90-Day Progress', description: 'Heatmap, stats, streaks', icon: '📊' },
  { href: '/dashboard/calendar', label: 'Calendar', description: 'Monthly view', icon: '📅' },
  { href: '/dashboard/review', label: 'Reviews', description: 'Weekly, monthly, 90-day', icon: '📝' },
  { href: '/dashboard/rules', label: 'The 17 Rules', description: 'Winter Arc philosophy', icon: '📜' },
  { href: '/dashboard/settings', label: 'Settings', description: 'Profile, habits, notifications, data', icon: '⚙️' },
  { href: '/privacy', label: 'Privacy', description: 'What we collect and why', icon: '🛡️' },
]

export default function MorePage() {
  const dayNumber = getTodayDayNumber()

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        {dayNumber && <p className="day-counter">Day {dayNumber} / {PROGRAM_DAYS}</p>}
        <h1 className="text-2xl font-black text-foreground mt-1">All Modules</h1>
        <p className="text-sm text-muted-foreground">Winter Arc 90 — Command Center</p>
      </div>

      <div className="space-y-2">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="arc-card flex items-center gap-4 hover:border-primary/30 transition-all group"
          >
            <span className="text-2xl w-9 text-center">{m.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.description}</p>
            </div>
            <span className="text-muted-foreground">→</span>
          </Link>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        🔒 Privacy-first · No phone monitoring · Your data stays yours
      </p>
    </div>
  )
}
