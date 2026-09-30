import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

const SETTINGS_SECTIONS = [
  {
    title: 'Account',
    items: [
      { href: '/dashboard/settings/profile', label: 'Profile', description: 'Name and display preferences', icon: '👤' },
      { href: '/dashboard/settings/habits', label: 'Habits', description: 'Manage your Winter Arc habits', icon: '📋' },
      { href: '/dashboard/settings/notifications', label: 'Notifications', description: 'Push notification schedule', icon: '🔔' },
    ],
  },
  {
    title: 'Privacy & Data',
    items: [
      { href: '/dashboard/settings/data', label: 'Export & Delete', description: 'Export your data or delete account', icon: '🔒' },
      { href: '/privacy', label: 'Privacy Policy', description: 'What we collect and why', icon: '🛡️' },
    ],
  },
]

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, monthly_income')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">{profile?.display_name ?? user.email}</p>
      </div>

      {SETTINGS_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-2">
          <p className="section-header">{section.title}</p>
          <div className="space-y-2">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="arc-card flex items-center gap-4 hover:border-primary/30 transition-all group"
              >
                <span className="text-xl w-8 text-center">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <span className="text-muted-foreground text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Winter Arc Rules */}
      <div className="space-y-2">
        <p className="section-header">Winter Arc</p>
        <Link href="/dashboard/rules" className="arc-card flex items-center gap-4 hover:border-primary/30 transition-all group">
          <span className="text-xl w-8 text-center">📜</span>
          <div className="flex-1">
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">The 17 Rules</p>
            <p className="text-xs text-muted-foreground">Winter Arc philosophy</p>
          </div>
          <span className="text-muted-foreground text-sm">→</span>
        </Link>
      </div>

      {/* Sign out */}
      <form action="/api/auth/signout" method="POST">
        <button
          id="settings-signout"
          type="submit"
          className="w-full py-3 rounded-xl border border-destructive/30 text-destructive font-semibold text-sm hover:bg-destructive/10 transition-all"
        >
          Sign out
        </button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        Winter Arc 90 · Privacy-first personal OS
      </p>
    </div>
  )
}
