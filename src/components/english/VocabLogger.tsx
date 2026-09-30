'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { queueOfflineEntry } from '@/lib/offline-db'
import type { EnglishVocabulary } from '@/types'

interface VocabLoggerProps {
  date: string
  todayWords: EnglishVocabulary[]
  onSave: () => void
}

export function VocabLogger({ date, todayWords, onSave }: VocabLoggerProps) {
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [userSentence, setUserSentence] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    if (!word.trim() || !meaning.trim()) return
    setSaving(true)
    const isOnline = navigator.onLine

    const data = {
      date,
      word: word.trim(),
      meaning: meaning.trim(),
      example_sentence: example.trim() || null,
      user_sentence: userSentence.trim() || null,
      reviewed: false,
    }

    if (!isOnline) {
      const { data: { user } } = await supabase.auth.getUser()
      await queueOfflineEntry('english_vocabulary', 'insert', { ...data, user_id: user!.id })
    } else {
      await supabase.from('english_vocabulary').insert(data)
    }

    setSaving(false)
    setWord('')
    setMeaning('')
    setExample('')
    setUserSentence('')
    onSave()
  }

  return (
    <div className="space-y-4">
      {/* Add word form */}
      <div className="arc-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm">Add Vocabulary Word</h3>
          <span className="text-xs text-muted-foreground">
            {todayWords.length} / 5 today
          </span>
        </div>

        <input
          id="vocab-word"
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="New word"
          className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <textarea
          id="vocab-meaning"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="Meaning / definition"
          rows={2}
          className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
        <input
          type="text"
          value={example}
          onChange={(e) => setExample(e.target.value)}
          placeholder="Example sentence (optional)"
          className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="text"
          value={userSentence}
          onChange={(e) => setUserSentence(e.target.value)}
          placeholder="Your own sentence (optional)"
          className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />

        <button
          id="vocab-save"
          onClick={handleSave}
          disabled={saving || !word.trim() || !meaning.trim()}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2.5 rounded-xl transition-all text-sm"
        >
          {saving ? 'Adding…' : 'Add word'}
        </button>
      </div>

      {/* Daily target indicator */}
      <div className="arc-card space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-medium text-foreground">Daily target: 5 words</span>
          <span className={todayWords.length >= 5 ? 'text-green-400 font-semibold' : 'text-muted-foreground'}>
            {todayWords.length}/5
          </span>
        </div>
        <div className="arc-progress">
          <div
            className={`arc-progress-fill ${todayWords.length >= 5 ? 'bg-green-500' : ''}`}
            style={{ width: `${Math.min(100, (todayWords.length / 5) * 100)}%` }}
          />
        </div>
      </div>

      {/* Today's words */}
      {todayWords.length > 0 && (
        <div className="space-y-2">
          <p className="section-header">Today's vocabulary</p>
          {todayWords.map((w) => (
            <div key={w.id} className="arc-card space-y-1">
              <p className="font-bold text-foreground">{w.word}</p>
              <p className="text-sm text-muted-foreground">{w.meaning}</p>
              {w.example_sentence && (
                <p className="text-xs text-muted-foreground italic">"{w.example_sentence}"</p>
              )}
              {w.user_sentence && (
                <p className="text-xs text-primary">Your sentence: {w.user_sentence}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
