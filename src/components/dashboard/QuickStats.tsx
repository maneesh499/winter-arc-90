'use client'

import { formatMinutes, formatCurrency } from '@/lib/utils'
import type { DailyMetrics } from '@/types'

interface QuickStatsProps {
  metrics: Partial<DailyMetrics> | null
}

export function QuickStats({ metrics }: QuickStatsProps) {
  const stats = [
    {
      icon: '💼',
      label: 'Career',
      value: formatMinutes(metrics?.career_minutes ?? 0),
    },
    {
      icon: '🗣️',
      label: 'English',
      value: formatMinutes(metrics?.english_minutes ?? 0),
    },
    {
      icon: '💪',
      label: 'Gym',
      value: metrics?.gym_done ? '✓ Done' : '—',
    },
    {
      icon: '📚',
      label: 'Reading',
      value: metrics?.reading_pages ? `${metrics.reading_pages}p` : '0p',
    },
    {
      icon: '💧',
      label: 'Water',
      value: metrics?.water_ml
        ? `${(metrics.water_ml / 1000).toFixed(1)}L`
        : '0L',
    },
    {
      icon: '🎬',
      label: 'Creative',
      value: formatMinutes(metrics?.creative_minutes ?? 0),
    },
  ]

  return (
    <div className="arc-card">
      <p className="section-header">Today at a Glance</p>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-xl mb-1">{stat.icon}</div>
            <p className="text-sm font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
