'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navSections = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', label: 'Command Center', icon: '⚡' },
      { href: '/dashboard/today', label: 'Today', icon: '📅' },
    ],
  },
  {
    label: 'Core Modules',
    items: [
      { href: '/dashboard/career', label: 'Career Mode', icon: '💼' },
      { href: '/dashboard/english', label: 'English', icon: '🗣️' },
      { href: '/dashboard/health', label: 'Health', icon: '💪' },
      { href: '/dashboard/creative', label: 'Creative', icon: '🎬' },
      { href: '/dashboard/finance', label: 'Finance', icon: '₹' },
    ],
  },
  {
    label: 'Track',
    items: [
      { href: '/dashboard/progress', label: '90-Day Progress', icon: '📈' },
      { href: '/dashboard/calendar', label: 'Calendar', icon: '🗓️' },
      { href: '/dashboard/review', label: 'Daily Review', icon: '📝' },
      { href: '/dashboard/rapido', label: 'Rapido', icon: '🛵' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
      { href: '/privacy', label: 'Privacy', icon: '🔒' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arc-500 to-frost-500 flex items-center justify-center">
          <span className="text-sm font-black text-white">W</span>
        </div>
        <div>
          <p className="font-black text-foreground text-sm">WINTER ARC</p>
          <p className="text-xs text-muted-foreground">90 Days</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-4 text-xs font-bold tracking-widest text-muted-foreground uppercase mb-1">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href)

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2 text-sm transition-all duration-150 rounded-lg mx-2',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      )}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleSignOut}
          className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 px-2 py-2"
        >
          <span>👋</span> Sign Out
        </button>
      </div>
    </aside>
  )
}
