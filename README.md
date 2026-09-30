# WINTER ARC 90

A complete, privacy-first personal operating system for a 90-day challenge covering discipline, health, career growth, English communication, finances, and creativity.

## Overview
Winter Arc 90 is designed to function as a personal command center. The goal is to help you execute one day at a time while showing progress across the full 90 days (October 1 to December 29, 2026). It prioritizes "winning today" and prevents overwhelming check-listing.

## Features
- **Daily Dashboard:** Top 3 priorities, Morning Routine, Minimum Day, Recovery Mode.
- **Career Mode:** Topics, Application Tracker, Interview Prep.
- **English Mode:** Speaking, Vocabulary, Grammar, Interview Speaking.
- **Health & Fitness:** Gym logs, daily movement, sleep tracker, hydration, healthy eating.
- **Creative Mode:** Vault for projects, ideas, and sessions.
- **Finance:** Monthly tracking for income, expenses, and Rapido side-hustle.
- **Review System:** Nightly, Weekly, Monthly, and 90-Day Reviews.
- **PWA & Offline:** Works offline via IndexedDB, syncs when online.

## Architecture
- `app/`: Next.js 14 App Router for pages and API endpoints.
- `components/`: Modular UI components organized by feature.
- `lib/`: Utilities for dates (timezone-safe IST), offline IndexedDB queue, and Supabase clients.
- `types/`: Shared TypeScript definitions.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database & Auth:** Supabase (PostgreSQL, RLS)
- **Deployment:** Vercel
- **Others:** `date-fns-tz` (Timezones), Recharts

## Supabase & Database
Relational schema using PostgreSQL. Enforces Row Level Security (RLS) so users can only read/write their own data.
Key tables:
- `profiles`, `programs`, `habits`, `habit_logs`, `daily_metrics`
- Career: `learning_topics`, `learning_sessions`, `job_applications`, `interviews`
- Health: `sleep_logs`, `gym_logs`, `water_logs`
- Finance: `income_entries`, `expenses`, `rapido_entries`

Run the migrations in `supabase/migrations/` sequentially.

## Environment Variables
Create a `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your@email.com
CRON_SECRET=your-cron-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Local Setup
1. Clone the repository
2. Run `npm install`
3. Setup `.env.local`
4. Run `npm run dev`
5. Open `http://localhost:3000`

## PWA & Offline
Fully installable Progressive Web App. Includes a service worker (`public/sw.js`) and `manifest.json`. Actions made offline are queued in IndexedDB (`src/lib/offline-db.ts`) and synced automatically when the connection is restored via the `/api/sync` route.

## Notifications
Uses Web Push (VAPID) to send push notifications. Supports an optional "Private Mode" which hides sensitive habit names from the lock screen.

## Telegram
Optional Telegram bot integration. Add `TELEGRAM_BOT_TOKEN` to your `.env` (kept server-side only).

## GitHub & CI
Automated CI using GitHub Actions (`.github/workflows/ci.yml`). Runs `npm run lint`, `npm run typecheck`, and `npm run build` on every push to main/develop.

## Vercel Deployment
Deploy easily to Vercel. Ensure all environment variables are mapped. Vercel config (`vercel.json`) defines cron job schedules.

## Cron Jobs
Daily processing runs via `/api/cron/daily`. Protected by the `CRON_SECRET`. Generates daily metrics securely on the server.

## Testing
Tests exist for day calculations (Day 1 to 90), timezone adherence (IST), streak logic, and offline sync queuing.

## Privacy
- **Zero Device Monitoring**: No access to contacts, GPS, SMS, files, photos, or other apps.
- **No Instagram Tracking**: Replaced by a manual "Digital Discipline" habit.
- **Microphone**: No automatic mic access. Speaking trackers are manual.

## Security
- Fully protected by Row Level Security (RLS).
- API routes validate authentication status.
- Service Role keys are strictly kept server-side.

## Backup & Export
Users can export their complete dataset in JSON or CSV format (via Settings -> Data). They can also permanently delete their account.

## Troubleshooting
- **Build fails**: Ensure `npm run lint` and `npm run typecheck` pass. Check your environment variables.
- **Offline sync fails**: Check IndexedDB storage quotas or Service Worker status in DevTools.
