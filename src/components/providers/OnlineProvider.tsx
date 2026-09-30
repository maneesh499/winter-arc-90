'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getPendingCount } from '@/lib/offline-db'

interface OnlineContextType {
  isOnline: boolean
  pendingCount: number
  syncNow: () => Promise<void>
}

const OnlineContext = createContext<OnlineContextType>({
  isOnline: true,
  pendingCount: 0,
  syncNow: async () => {},
})

export function OnlineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check pending entries periodically
    const checkPending = async () => {
      const count = await getPendingCount()
      setPendingCount(count)
    }

    checkPending()
    const interval = setInterval(checkPending, 30000)

    // Listen for service worker sync messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SYNC_REQUESTED') {
          syncNow()
        }
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const syncNow = async () => {
    if (!isOnline) return

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
      })

      if (response.ok) {
        const count = await getPendingCount()
        setPendingCount(count)
      }
    } catch {
      // Silent fail — will retry
    }
  }

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncNow()
    }
  }, [isOnline])

  return (
    <OnlineContext.Provider value={{ isOnline, pendingCount, syncNow }}>
      {!isOnline && (
        <div className="offline-banner">
          📡 Offline — changes saved locally, will sync when connected
        </div>
      )}
      {isOnline && pendingCount > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500/90 text-white text-center text-xs py-1 font-medium">
          Syncing {pendingCount} pending {pendingCount === 1 ? 'entry' : 'entries'}...
        </div>
      )}
      {children}
    </OnlineContext.Provider>
  )
}

export function useOnline() {
  return useContext(OnlineContext)
}
