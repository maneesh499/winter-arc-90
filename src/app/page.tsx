import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-arc-950 via-background to-background pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-arc-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-frost-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8 animate-slide-up">
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-arc-500 to-frost-500 flex items-center justify-center shadow-xl glow-primary">
            <span className="text-2xl font-black text-white">W</span>
          </div>
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">
              WINTER ARC
            </h1>
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase mt-1">
              90 Days · Your Operating System
            </p>
          </div>
        </div>

        {/* Program dates */}
        <div className="arc-card text-left space-y-3">
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            The Program
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-foreground">90</p>
              <p className="text-xs text-muted-foreground">Days</p>
            </div>
            <div>
              <p className="text-lg font-bold text-arc-400">Oct 1</p>
              <p className="text-xs text-muted-foreground">Start</p>
            </div>
            <div>
              <p className="text-lg font-bold text-frost-400">Dec 29</p>
              <p className="text-xs text-muted-foreground">End</p>
            </div>
          </div>
        </div>

        {/* What's inside */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {[
            { icon: '💼', label: 'Career Mode', desc: 'Job switch preparation' },
            { icon: '🗣️', label: 'English', desc: 'Communication skills' },
            { icon: '💪', label: 'Health', desc: 'Gym, nutrition, sleep' },
            { icon: '🎬', label: 'Creative', desc: 'Filmmaking & writing' },
            { icon: '📈', label: 'Finance', desc: 'Income & expense tracking' },
            { icon: '🔥', label: 'Discipline', desc: 'Streaks & consistency' },
          ].map((item) => (
            <div key={item.label} className="arc-card flex items-start gap-2 p-3">
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <div className="bg-secondary/50 border border-border rounded-xl p-3 text-xs text-muted-foreground text-left">
          <span className="font-semibold text-foreground">🔒 Privacy-first.</span>{' '}
          Winter Arc stores only what you enter. No phone monitoring, no location, no contacts.{' '}
          <Link href="/privacy" className="text-arc-400 hover:underline">
            Read our privacy page →
          </Link>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/auth/signup"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-all duration-200 text-center glow-primary"
          >
            Start Winter Arc
          </Link>
          <Link
            href="/auth/login"
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 text-center border border-border"
          >
            Sign In
          </Link>
        </div>

        <Link
          href="/demo"
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View demo (no account needed) →
        </Link>
      </div>
    </main>
  )
}
