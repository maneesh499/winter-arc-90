'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (active: boolean) => (
      <svg className={cn('w-5 h-5', active ? 'fill-current' : 'stroke-current fill-none')} viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    href: '/dashboard/today',
    label: 'Today',
    icon: (active: boolean) => (
      <svg className={cn('w-5 h-5', active ? 'fill-current' : 'stroke-current fill-none')} viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/dashboard/career',
    label: 'Career',
    icon: (active: boolean) => (
      <svg className={cn('w-5 h-5', active ? 'fill-current' : 'stroke-current fill-none')} viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    ),
  },
  {
    href: '/dashboard/progress',
    label: 'Progress',
    icon: (active: boolean) => (
      <svg className={cn('w-5 h-5', active ? 'fill-current' : 'stroke-current fill-none')} viewBox="0 0 24 24" strokeWidth={2}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: '/dashboard/more',
    label: 'More',
    icon: (active: boolean) => (
      <svg className={cn('w-5 h-5', active ? 'fill-current' : 'stroke-current fill-none')} viewBox="0 0 24 24" strokeWidth={2}>
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav lg:hidden" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon(isActive)}
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
