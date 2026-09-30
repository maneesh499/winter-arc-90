import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Winter Arc 90',
  description: 'What Winter Arc 90 collects, what it never accesses, and how to export or delete your data.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 max-w-2xl mx-auto">
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="space-y-2">
          <Link href="/" className="text-sm text-primary hover:underline">← Back to Winter Arc</Link>
          <h1 className="text-3xl font-black text-foreground mt-4">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Winter Arc 90 · Last updated: October 1, 2026</p>
        </div>

        {/* Summary */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 space-y-3">
          <p className="font-bold text-foreground text-lg">🛡️ The Short Version</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Winter Arc 90 is a manual personal tracking app. <strong className="text-foreground">We only store what you explicitly type.</strong> We do not access your phone, contacts, location, camera, microphone, photos, call logs, SMS, installed apps, social media, or any other data beyond what you deliberately enter.
          </p>
        </div>

        {[
          {
            title: '1. What We Collect',
            content: `We collect only information you voluntarily provide:
- Email address (for authentication)
- Display name (if you set one)
- Habit logs you manually enter
- Learning session minutes you record
- Vocabulary words you add
- Job applications you track
- Gym and workout data you enter
- Water intake you log
- Finance data (income/expenses) you enter
- Sleep and wake times you record
- Daily review notes you write
- Notification preferences you set
- Push subscription token (if you enable notifications)`,
          },
          {
            title: '2. What We Never Access',
            content: `Winter Arc 90 never accesses:
- Your contacts or phone book
- SMS messages or call logs
- Photos or camera
- Videos
- Files or documents
- GPS location
- Bluetooth or nearby devices
- Installed applications
- Browser history
- Clipboard contents
- Device identifiers
- Advertising identifiers
- Instagram, WhatsApp, or any social media
- Screen time data
- Any background sensor data

The app works entirely on information you manually enter.`,
          },
          {
            title: '3. Microphone',
            content: `Winter Arc 90 does NOT request microphone access.

The speaking practice features (English module) are manual trackers. You speak independently, then log your session. No audio is recorded, transmitted, or stored by this application.`,
          },
          {
            title: '4. Authentication',
            content: `We use Supabase Auth for secure authentication. Your password is never stored in plain text. We use industry-standard bcrypt hashing.

Sessions are stored securely in your browser. You can sign out at any time.`,
          },
          {
            title: '5. Database and Storage',
            content: `Your data is stored in a Supabase (PostgreSQL) database with Row Level Security (RLS) enabled.

RLS means: every database query is filtered by your user ID. You cannot access another user's data. We cannot accidentally expose your data to other users.`,
          },
          {
            title: '6. Push Notifications',
            content: `Notifications are optional. You must explicitly grant permission in your browser.

We use Web Push (VAPID) for PWA notifications. If enabled, your browser generates a push subscription token stored in our database. This token allows us to send notifications. It does not identify you to any third-party service beyond the browser's push network.

By default, notifications use private text that does not expose sensitive habit names on your lock screen.`,
          },
          {
            title: '7. Data Sharing',
            content: `We do not sell your data. We do not share your data with advertisers. We do not share your data with third parties for commercial purposes.

Third-party services used:
- Supabase (database + auth) — governed by Supabase privacy policy
- Vercel (hosting) — governed by Vercel privacy policy

No analytics, tracking pixels, or advertising SDKs are used.`,
          },
          {
            title: '8. Your Rights',
            content: `You can:
- Export all your data at any time (Settings → Data → Export)
- Delete your account and all associated data (Settings → Data → Delete Account)
- Update your profile information at any time

Account deletion permanently removes all your personal data from our database.`,
          },
          {
            title: '9. Children',
            content: `Winter Arc 90 is not designed for users under 18. We do not knowingly collect data from minors.`,
          },
          {
            title: '10. Contact',
            content: `For privacy questions or concerns, use the Settings → Data section within the app, or contact the developer directly.`,
          },
        ].map((section) => (
          <div key={section.title} className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}

        <div className="arc-card text-center space-y-3">
          <p className="font-bold text-foreground">Your data. Your 90 days. Your privacy.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/login" className="text-sm text-primary font-semibold hover:underline">
              Sign in →
            </Link>
            <Link href="/demo" className="text-sm text-muted-foreground hover:text-foreground font-semibold transition-colors">
              View demo →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
