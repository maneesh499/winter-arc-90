'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DataSettingsPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleExportJSON = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/export?format=json')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `winter-arc-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed. Please try again.')
    }
    setExporting(false)
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/export?format=csv')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `winter-arc-data-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed. Please try again.')
    }
    setExporting(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') return
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (!res.ok) throw new Error('Delete failed')
      router.push('/')
    } catch (err) {
      alert('Account deletion failed. Please contact support.')
    }
    setDeleting(false)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-foreground">Data & Privacy</h1>
        <p className="text-sm text-muted-foreground">Your data belongs to you</p>
      </div>

      {/* What we store */}
      <div className="arc-card space-y-3">
        <p className="section-header">What we store</p>
        <ul className="space-y-2 text-sm">
          {[
            'Your email address (for authentication)',
            'Display name you set in Profile',
            'Daily habit logs you manually enter',
            'Learning sessions you record',
            'Vocabulary words you add',
            'Job applications you track',
            'Expenses and income you enter',
            'Daily review notes you write',
            'Notification preferences',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-muted-foreground">
              <span className="text-green-400 shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* What we never access */}
      <div className="arc-card space-y-3 border-green-500/10">
        <p className="section-header">What we never access</p>
        <ul className="space-y-2 text-sm">
          {[
            'Contacts, SMS, or call logs',
            'Photos, videos, or files',
            'GPS location',
            'Installed apps',
            'Browser history',
            'Social media accounts',
            'Other applications',
            'Device identifiers',
            'Phone sensors (automatically)',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-muted-foreground">
              <span className="text-red-400 shrink-0">✕</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Export */}
      <div className="arc-card space-y-3">
        <p className="section-header">Export Your Data</p>
        <p className="text-sm text-muted-foreground">Download all your personal data. Everything you've logged.</p>
        <div className="flex gap-3">
          <button
            id="export-json"
            onClick={handleExportJSON}
            disabled={exporting}
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-bold py-2.5 rounded-xl text-sm border border-border disabled:opacity-50 transition-all"
          >
            {exporting ? 'Exporting…' : 'Export JSON'}
          </button>
          <button
            id="export-csv"
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-bold py-2.5 rounded-xl text-sm border border-border disabled:opacity-50 transition-all"
          >
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Delete account */}
      <div className="arc-card space-y-3 border-destructive/20">
        <p className="section-header text-destructive">Delete Account</p>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <button
            id="delete-account-btn"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full border border-destructive/30 text-destructive font-semibold py-2.5 rounded-xl text-sm hover:bg-destructive/10 transition-all"
          >
            Delete my account
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
              <p className="text-sm text-destructive font-semibold">⚠️ This will permanently delete:</p>
              <ul className="text-xs text-destructive/80 mt-1 space-y-0.5 list-disc list-inside">
                <li>All your habit logs</li>
                <li>All learning sessions</li>
                <li>All career data</li>
                <li>All English practice data</li>
                <li>All finance records</li>
                <li>Your entire profile and account</li>
              </ul>
            </div>
            <p className="text-sm text-foreground">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              id="delete-confirm-input"
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-secondary border border-destructive/30 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50"
            />
            <div className="flex gap-2">
              <button
                id="delete-account-confirm"
                onClick={handleDeleteAccount}
                disabled={deleteText !== 'DELETE' || deleting}
                className="flex-1 bg-destructive hover:bg-destructive/90 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all"
              >
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteText('') }}
                className="px-4 py-2.5 bg-secondary text-foreground font-semibold rounded-xl text-sm border border-border"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
