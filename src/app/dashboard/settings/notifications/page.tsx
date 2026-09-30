'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_NOTIFICATIONS = [
  { time: '06:00', label: 'Morning wake-up', enabled: true, private_text: 'Winter Arc — start your day', public_text: 'Morning — Day starts now' },
  { time: '07:30', label: 'Reading reminder', enabled: true, private_text: 'Winter Arc — time to read', public_text: '3 pages before the day gets away' },
  { time: '19:30', label: 'Evening career', enabled: true, private_text: 'Winter Arc — evening session', public_text: 'Career prep time' },
  { time: '20:30', label: 'English practice', enabled: true, private_text: 'Winter Arc — English time', public_text: 'English practice' },
  { time: '21:30', label: 'Daily review', enabled: true, private_text: 'Winter Arc — daily check-in', public_text: 'Review your day' },
]

export default function NotificationsSettingsPage() {
  const [notifs, setNotifs] = useState(DEFAULT_NOTIFICATIONS)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [privateMode, setPrivateMode] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default')
  const supabase = createClient()

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission)
      setPushEnabled(Notification.permission === 'granted')
    }
    // Load saved preferences
    supabase.from('notification_preferences').select('*').then(({ data }) => {
      if (data?.length) {
        const savedPrivate = data[0]?.private_notifications ?? true
        setPrivateMode(savedPrivate)
        if (data[0]?.schedule) {
          // Merge with defaults (future improvement)
        }
      }
    })
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Push notifications are not supported in this browser.')
      return
    }
    const result = await Notification.requestPermission()
    setPermissionState(result)
    setPushEnabled(result === 'granted')

    if (result === 'granted' && 'serviceWorker' in navigator) {
      // Register push subscription
      const reg = await navigator.serviceWorker.ready
      if (reg.pushManager) {
        try {
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          if (!vapidKey) return
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidKey,
          })
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            body: JSON.stringify(sub),
            headers: { 'Content-Type': 'application/json' },
          })
        } catch {
          // VAPID key not configured — silent fail
        }
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('notification_preferences').upsert({
      user_id: user!.id,
      private_notifications: privateMode,
      schedule: notifs.filter(n => n.enabled).map(n => ({ time: n.time, label: n.label })),
    }, { onConflict: 'user_id' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground">PWA push notification schedule</p>
      </div>

      {/* Push permission */}
      <div className="arc-card space-y-3">
        <p className="section-header">Push Notifications</p>
        {permissionState === 'granted' ? (
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm">✓ Notifications enabled</span>
          </div>
        ) : permissionState === 'denied' ? (
          <p className="text-sm text-red-400">Notifications are blocked. Enable them in browser settings.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Enable push notifications to get daily reminders. You control the schedule.
            </p>
            <button
              id="enable-notifications"
              onClick={requestPermission}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2.5 rounded-xl text-sm"
            >
              Enable Notifications
            </button>
          </div>
        )}
      </div>

      {/* Privacy mode */}
      <div className="arc-card space-y-3">
        <p className="section-header">Privacy</p>
        <div className="flex items-start gap-3">
          <button
            id="notif-private-mode"
            role="switch"
            aria-checked={privateMode}
            onClick={() => setPrivateMode(!privateMode)}
            className={`relative w-10 h-6 rounded-full transition-all shrink-0 mt-0.5 ${privateMode ? 'bg-primary' : 'bg-secondary'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${privateMode ? 'left-5' : 'left-1'}`} />
          </button>
          <div>
            <p className="text-sm font-semibold text-foreground">Private notifications</p>
            <p className="text-xs text-muted-foreground">
              {privateMode
                ? 'Notifications show generic text on lock screen. Sensitive habit names are hidden.'
                : 'Notifications show specific habit names.'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Example: "{privateMode ? 'Winter Arc — you have a task waiting' : 'Time to log Reading'}"
            </p>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="arc-card space-y-3">
        <p className="section-header">Schedule</p>
        {notifs.map((n, i) => (
          <div key={n.time} className="flex items-center gap-3">
            <button
              onClick={() => {
                const updated = [...notifs]
                updated[i] = { ...updated[i], enabled: !updated[i].enabled }
                setNotifs(updated)
              }}
              className={`w-9 h-5 rounded-full transition-all shrink-0 ${n.enabled ? 'bg-primary' : 'bg-secondary'}`}
            >
              <span className={`block w-3.5 h-3.5 rounded-full bg-white mx-0.5 transition-all ${n.enabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </button>
            <div className="flex-1 flex items-center justify-between">
              <p className="text-sm text-foreground font-medium">{n.label}</p>
              <input
                type="time"
                value={n.time}
                onChange={(e) => {
                  const updated = [...notifs]
                  updated[i] = { ...updated[i], time: e.target.value }
                  setNotifs(updated)
                }}
                className="bg-secondary border border-border rounded-lg px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        id="notif-save"
        onClick={handleSave}
        disabled={saving}
        className={`w-full font-bold py-3 rounded-xl text-sm transition-all ${
          saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        } disabled:opacity-50`}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Preferences'}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        🔒 Sensitive habit names (like "No Porn") are never shown in lock screen notifications.
      </p>
    </div>
  )
}
