import { createClient } from '@/lib/supabase/server'
import { getTodayIST, getTodayDayNumber } from '@/lib/dates'
import { FinanceContent } from '@/components/finance/FinanceContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Finance' }

export default async function FinancePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = getTodayIST()

  // Get current month bounds
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const monthEnd = new Date(nextMonth.getTime() - 1).toISOString().split('T')[0]

  const [
    { data: expenses },
    { data: income },
    { data: rapidoEntries },
    { data: profile },
  ] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', user!.id)
      .gte('date', monthStart).lte('date', monthEnd).order('date', { ascending: false }),
    supabase.from('income_entries').select('*').eq('user_id', user!.id)
      .gte('date', monthStart).lte('date', monthEnd).order('date', { ascending: false }),
    supabase.from('rapido_entries').select('date, net_earnings, gross_earnings, fuel_cost')
      .eq('user_id', user!.id).gte('date', monthStart).lte('date', monthEnd),
    supabase.from('profiles').select('monthly_income, score_weights').eq('user_id', user!.id).single(),
  ])

  const totalExpenses = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0)
  const totalIncome = (income ?? []).reduce((s, i) => s + Number(i.amount), 0)
  const rapidoIncome = (rapidoEntries ?? []).reduce((s, r) => s + Number(r.net_earnings), 0)
  const monthlyIncome = profile?.monthly_income ?? 23600
  const remaining = monthlyIncome + rapidoIncome + totalIncome - totalExpenses

  return (
    <FinanceContent
      today={today}
      expenses={expenses ?? []}
      income={income ?? []}
      totalExpenses={totalExpenses}
      totalIncome={totalIncome}
      rapidoIncome={rapidoIncome}
      monthlyIncome={monthlyIncome}
      remaining={remaining}
      currentMonth={`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`}
      userId={user!.id}
    />
  )
}
