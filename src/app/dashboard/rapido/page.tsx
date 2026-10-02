import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getISTMonthBounds } from '@/lib/dates'
import { RapidoContent } from '@/components/rapido/RapidoContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Rapido' }

export default async function RapidoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = getTodayIST()

  // Use IST-safe month bounds (not new Date().toISOString() which gives UTC)
  const { monthStart } = getISTMonthBounds()

  const [{ data: entries }, { data: monthEntries }] = await Promise.all([
    supabase.from('rapido_entries').select('*').eq('user_id', user!.id)
      .order('date', { ascending: false }).limit(30),
    supabase.from('rapido_entries').select('gross_earnings, fuel_cost, net_earnings, hours, rides')
      .eq('user_id', user!.id).gte('date', monthStart),
  ])

  const monthStats = (monthEntries ?? []).reduce((acc, e) => ({
    gross: acc.gross + Number(e.gross_earnings),
    fuel: acc.fuel + Number(e.fuel_cost),
    net: acc.net + Number(e.net_earnings),
    hours: acc.hours + Number(e.hours),
    rides: acc.rides + Number(e.rides),
    days: acc.days + 1,
  }), { gross: 0, fuel: 0, net: 0, hours: 0, rides: 0, days: 0 })

  return (
    <RapidoContent
      today={today}
      entries={entries ?? []}
      monthStats={monthStats}
      userId={user!.id}
    />
  )
}
