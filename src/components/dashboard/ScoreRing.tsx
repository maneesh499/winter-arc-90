'use client'

import { cn, getScoreColor, getScoreBg } from '@/lib/utils'

interface ScoreRingProps {
  score: number
}

export function ScoreRing({ score }: ScoreRingProps) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="arc-card flex flex-col items-center justify-center gap-2 py-4">
      <p className="section-header">Today's Score</p>
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          {/* Background circle */}
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
          />
          {/* Score arc */}
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke={
              score >= 80
                ? 'hsl(142 71% 45%)'
                : score >= 60
                ? 'hsl(38 92% 50%)'
                : score >= 40
                ? 'hsl(21 90% 48%)'
                : 'hsl(0 72% 51%)'
            }
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-xl font-black', getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
      <p className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', getScoreBg(score))}>
        {score >= 80 ? 'Strong' : score >= 60 ? 'Good' : score >= 40 ? 'Partial' : 'Keep going'}
      </p>
    </div>
  )
}
