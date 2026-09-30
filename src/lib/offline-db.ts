import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { OfflineEntry, Json } from '@/types'
import { generateId } from '@/lib/utils'

interface WinterArcDB extends DBSchema {
  offline_queue: {
    key: string
    value: OfflineEntry
    indexes: { by_table: string; by_synced: number }
  }
  daily_cache: {
    key: string // date string
    value: {
      date: string
      data: Record<string, Json>
      cached_at: number
    }
  }
}

let db: IDBPDatabase<WinterArcDB> | null = null

async function getDB(): Promise<IDBPDatabase<WinterArcDB>> {
  if (db) return db

  db = await openDB<WinterArcDB>('winter-arc-90', 2, {
    upgrade(database, oldVersion) {
      if (oldVersion < 1) {
        const offlineStore = database.createObjectStore('offline_queue', {
          keyPath: 'id',
        })
        offlineStore.createIndex('by_table', 'table')
        offlineStore.createIndex('by_synced', 'synced')

        database.createObjectStore('daily_cache', {
          keyPath: 'date',
        })
      }
    },
  })

  return db
}

// Add an entry to the offline queue
export async function queueOfflineEntry(
  table: string,
  operation: 'insert' | 'update' | 'delete',
  data: Record<string, Json>
): Promise<string> {
  const database = await getDB()
  const id = generateId()

  const entry: OfflineEntry = {
    id,
    table,
    operation,
    data,
    created_at: Date.now(),
    synced: false,
  }

  await database.add('offline_queue', entry)
  return id
}

// Get all unsynced entries
export async function getPendingEntries(): Promise<OfflineEntry[]> {
  const database = await getDB()
  const all = await database.getAll('offline_queue')
  return all.filter((e) => !e.synced)
}

// Mark entry as synced
export async function markSynced(id: string): Promise<void> {
  const database = await getDB()
  const entry = await database.get('offline_queue', id)
  if (entry) {
    await database.put('offline_queue', { ...entry, synced: true })
  }
}

// Delete synced entries older than 7 days
export async function cleanupSyncedEntries(): Promise<void> {
  const database = await getDB()
  const all = await database.getAll('offline_queue')
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000

  for (const entry of all) {
    if (entry.synced && entry.created_at < cutoff) {
      await database.delete('offline_queue', entry.id)
    }
  }
}

// Cache daily data locally
export async function cacheDailyData(
  date: string,
  data: Record<string, Json>
): Promise<void> {
  const database = await getDB()
  await database.put('daily_cache', {
    date,
    data,
    cached_at: Date.now(),
  })
}

// Get cached daily data
export async function getCachedDailyData(
  date: string
): Promise<Record<string, Json> | null> {
  const database = await getDB()
  const cached = await database.get('daily_cache', date)
  if (!cached) return null

  // Expire after 1 hour
  if (Date.now() - cached.cached_at > 3600000) return null

  return cached.data
}

// Count pending entries
export async function getPendingCount(): Promise<number> {
  const entries = await getPendingEntries()
  return entries.length
}
