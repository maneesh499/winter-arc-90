'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { PROGRAM_DAYS, formatDate, formatTime } from '@/lib/dates'
import Link from 'next/link'

interface CommandCenterProps {
  today: string
  dayNumber: number | null
  profile: any
  metrics: any
  habitLogs: any[]
  sleep: any
  wake: any
  waterTotal: number
  gym: any
  careerMinutes: number
  englishMinutes: number
  plan: any
  review: any
}

export function CommandCenter({
  today,
  dayNumber,
  profile,
  metrics,
  habitLogs,
  sleep,
  wake,
  waterTotal,
  gym,
  careerMinutes,
  englishMinutes,
  plan,
  review
}: CommandCenterProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const hour = currentTime.getHours()
  const name = profile?.display_name?.split(' ')[0] || 'Champion'
  const score = metrics?.total_score ?? 0

  // 1. Time-Aware Mode
  let modeName = 'DAY MODE'
  if (hour >= 5 && hour < 9) modeName = 'MORNING MODE'
  else if (hour >= 9 && hour < 17) modeName = 'WORK MODE'
  else if (hour >= 17 && hour < 21) modeName = 'CAREER MODE'
  else if (hour >= 21 || hour < 5) modeName = 'REVIEW MODE'

  // If weekend
  const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6
  if (isWeekend && hour >= 9 && hour < 18) modeName = 'BUILD MODE'

  // 2. Smart Status
  const getSmartStatus = () => {
    if (score >= 80) return { label: 'Strong', color: 'text-green-400' }
    if (score >= 60) return { label: 'Good', color: 'text-blue-400' }
    if (score >= 40) return { label: 'Average', color: 'text-yellow-400' }
    if (score > 0) return { label: 'Needs Attention', color: 'text-orange-400' }
    return { label: 'Day in Progress', color: 'text-muted-foreground' }
  }
  const status = getSmartStatus()

  // 3. Attention Center & Priority Engine
  const alerts: { level: 'high' | 'medium' | 'ontrack', title: string, desc: string, action: string, href: string }[] = []
  const onTrack: string[] = []

  // Water Intelligence
  const waterTarget = 2500 // Can be from profile in future
  if (waterTotal < waterTarget) {
    const remaining = waterTarget - waterTotal
    alerts.push({
      level: remaining > 1000 && hour > 15 ? 'high' : 'medium',
      title: 'Water',
      desc: `${(waterTotal / 1000).toFixed(1)}L / ${(waterTarget / 1000).toFixed(1)}L`,
      action: 'Log Water',
      href: '/dashboard/health'
    })
  } else {
    onTrack.push('Water target complete')
  }

  // Sleep Intelligence (basic diff)
  if (sleep && sleep.bedtime && sleep.wake_time) {
    // Basic duration calc if implemented
  } else if (!sleep) {
    alerts.push({
      level: hour < 12 ? 'high' : 'medium',
      title: 'Sleep',
      desc: 'No sleep logged for last night',
      action: 'Log Sleep',
      href: '/dashboard/health'
    })
  }

  // Gym Intelligence
  if (!gym) {
    alerts.push({
      level: hour > 18 ? 'high' : 'medium',
      title: 'Gym',
      desc: 'Not completed today',
      action: 'Mark Status',
      href: '/dashboard/health'
    })
  } else if (gym.status === 'completed') {
    onTrack.push('Workout logged')
  } else if (gym.status === 'missed') {
    onTrack.push('Gym missed')
  } else if (gym.status === 'recovery') {
    onTrack.push('Recovery day active')
  }

  // Career Intelligence
  const careerTarget = 90
  if (careerMinutes === 0) {
    alerts.push({
      level: hour > 18 ? 'high' : 'medium',
      title: 'Career',
      desc: '0m logged today',
      action: 'Start Session',
      href: '/dashboard/career'
    })
  } else if (careerMinutes < careerTarget) {
    alerts.push({
      level: 'medium',
      title: 'Career',
      desc: `${careerTarget - careerMinutes}m remaining`,
      action: 'Continue',
      href: '/dashboard/career'
    })
  } else {
    onTrack.push('Career target complete')
  }

  // English Intelligence
  const englishTarget = 20
  if (englishMinutes === 0) {
    alerts.push({
      level: 'medium',
      title: 'English',
      desc: 'Not started',
      action: 'Start Session',
      href: '/dashboard/english'
    })
  } else if (englishMinutes < englishTarget) {
    alerts.push({
      level: 'medium',
      title: 'English',
      desc: `${englishTarget - englishMinutes}m remaining`,
      action: 'Practice',
      href: '/dashboard/english'
    })
  } else {
    onTrack.push('English target complete')
  }

  // Reading Intelligence (via habit logs)
  const readingLog = habitLogs.find(l => l.habits?.name.toLowerCase().includes('reading'))
  if (!readingLog || (readingLog.status !== 'kept' && (readingLog.value || 0) < 3)) {
    alerts.push({
      level: 'medium',
      title: 'Reading',
      desc: readingLog ? `${readingLog.value || 0} / 3 pages` : '0 / 3 pages',
      action: 'Log Reading',
      href: '/dashboard'
    })
  } else {
    onTrack.push('Reading complete')
  }

  // Top 3
  if (plan && (plan.top_1 || plan.top_2 || plan.top_3)) {
    // We would need to track completion of these. Since we don't have a completion status on daily_plans,
    // we just show them as a focus.
  }

  // Determine Next Action
  const sortedAlerts = [...alerts].sort((a, b) => a.level === 'high' ? -1 : 1)
  const nextAction = sortedAlerts[0]

  return (
    <div className="space-y-6 animate-slide-up pb-24">
      {/* 1. STATUS HEADER */}
      <div>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">{modeName}</p>
        <h1 className="text-3xl font-black text-foreground mt-1">WINTER ARC 90</h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="day-counter">
            DAY {dayNumber} / {PROGRAM_DAYS}
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs">{formatDate(today, 'MMM d')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="arc-card flex flex-col justify-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Daily Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-foreground">{score}</span>
            <span className="text-sm text-muted-foreground font-bold">/ 100</span>
          </div>
        </div>
        <div className="arc-card flex flex-col justify-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Status</p>
          <p className={`text-xl font-bold ${status.color}`}>{status.label}</p>
        </div>
      </div>

      {/* 2. NEXT ACTION (What Should I Do Now?) */}
      {nextAction && (
        <div className="arc-card border-primary/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
          <div className="relative">
            <p className="text-xs text-primary uppercase tracking-widest font-black mb-3">Next Action</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-foreground">{nextAction.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{nextAction.desc}</p>
              </div>
              <Link
                href={nextAction.href}
                className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-sm hover:scale-105 transition-transform"
              >
                {nextAction.action}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. ATTENTION CENTER */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <p className="section-header">Attention Required</p>
          <div className="grid gap-2">
            {alerts.filter(a => a !== nextAction).map((alert, i) => (
              <div key={i} className={cn(
                "flex items-center justify-between p-4 rounded-xl border",
                alert.level === 'high' ? 'bg-red-500/5 border-red-500/20' : 'bg-secondary border-border'
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    alert.level === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                  )} />
                  <div>
                    <p className="text-sm font-bold text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.desc}</p>
                  </div>
                </div>
                <Link href={alert.href} className="text-xs font-semibold text-primary hover:underline px-2 py-1">
                  {alert.action} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ON TRACK */}
      {onTrack.length > 0 && (
        <div className="space-y-3">
          <p className="section-header text-green-400">On Track</p>
          <div className="flex flex-wrap gap-2">
            {onTrack.map((item, i) => (
              <span key={i} className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                ✓ {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. TODAY'S PRIORITIES (From Plan) */}
      {plan && (plan.top_1 || plan.top_2 || plan.top_3) && (
        <div className="arc-card space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Today's Priorities</p>
          <ul className="space-y-2">
            {plan.top_1 && <li className="text-sm font-medium flex gap-2"><span className="text-primary font-bold">1.</span> {plan.top_1}</li>}
            {plan.top_2 && <li className="text-sm font-medium flex gap-2"><span className="text-primary font-bold">2.</span> {plan.top_2}</li>}
            {plan.top_3 && <li className="text-sm font-medium flex gap-2"><span className="text-primary font-bold">3.</span> {plan.top_3}</li>}
          </ul>
        </div>
      )}

      {/* 5. TIME AUDIT & TIMELINE */}
      <div className="grid gap-4 mt-6">
        <div className="arc-card space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Where did your day go?</p>
          <div className="space-y-2">
            {careerMinutes > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Career</span>
                <span className="font-bold">{Math.floor(careerMinutes / 60)}h {careerMinutes % 60}m</span>
              </div>
            )}
            {englishMinutes > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> English</span>
                <span className="font-bold">{Math.floor(englishMinutes / 60)}h {englishMinutes % 60}m</span>
              </div>
            )}
            {gym && gym.status === 'completed' && (
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Gym</span>
                <span className="font-bold">{gym.duration_minutes ? `${gym.duration_minutes}m` : 'Completed'}</span>
              </div>
            )}
            {careerMinutes === 0 && englishMinutes === 0 && (!gym || gym.status !== 'completed') && (
              <p className="text-sm text-muted-foreground italic">No time blocks logged yet today.</p>
            )}
          </div>
        </div>
      </div>

      {/* 6. GLOBAL QUICK ACTIONS */}
      <div className="mt-6">
        <p className="section-header">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/dashboard/career" className="bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 p-3 rounded-xl flex items-center justify-between transition-colors">
            <span className="text-sm font-semibold">💼 Career</span>
            <span className="text-primary">→</span>
          </Link>
          <Link href="/dashboard/english" className="bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 p-3 rounded-xl flex items-center justify-between transition-colors">
            <span className="text-sm font-semibold">🗣️ English</span>
            <span className="text-primary">→</span>
          </Link>
          <Link href="/dashboard/health" className="bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 p-3 rounded-xl flex items-center justify-between transition-colors">
            <span className="text-sm font-semibold">💪 Health</span>
            <span className="text-primary">→</span>
          </Link>
          <Link href="/dashboard/finance" className="bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 p-3 rounded-xl flex items-center justify-between transition-colors">
            <span className="text-sm font-semibold">₹ Finance</span>
            <span className="text-primary">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
