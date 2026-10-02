'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn, formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface FinanceContentProps {
  today: string
  expenses: any[]
  income: any[]
  totalExpenses: number
  totalIncome: number
  rapidoIncome: number
  monthlyIncome: number
  remaining: number
  currentMonth: string
  userId: string
}

const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'home_family', label: 'Home / Family' },
  { value: 'food', label: 'Food' },
  { value: 'seeds_oats_eggs', label: 'Seeds / Oats / Eggs' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'gym', label: 'Gym' },
  { value: 'investment', label: 'Investment' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
]

export function FinanceContent({
  today,
  expenses,
  income,
  totalExpenses,
  totalIncome,
  rapidoIncome,
  monthlyIncome,
  remaining,
  currentMonth,
  userId,
}: FinanceContentProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expForm, setExpForm] = useState({ amount: '', category: 'food', description: '', date: today })
  const [saving, setSaving] = useState(false)
  const [expenseError, setExpenseError] = useState<string | null>(null)
  const router = useRouter()
  const [, startTransition] = useTransition()
  const refresh = () => startTransition(() => router.refresh())
  const supabase = createClient()

  const handleAddExpense = async () => {
    if (!expForm.amount || Number(expForm.amount) <= 0) return
    setSaving(true)
    setExpenseError(null)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      setExpenseError('Authentication error. Please refresh.')
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        date: expForm.date,
        category: expForm.category,
        amount: Number(expForm.amount),
        description: expForm.description || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[FinanceContent] expense insert failed', { userId: user.id, amount: expForm.amount, error })
      setExpenseError(`Could not save expense: ${error.message}`)
      setSaving(false)
      return
    }

    setSaving(false)
    setExpForm({ amount: '', category: 'food', description: '', date: today })
    setShowExpenseForm(false)
    refresh()
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'expenses', label: 'Expenses', icon: '💸' },
    { id: 'budget', label: 'Budget', icon: '📋' },
  ]

  const MONTHLY_BUDGET = [
    { category: 'Rent', amount: 8000, color: 'bg-blue-500' },
    { category: 'Home/Family', amount: 10000, color: 'bg-purple-500' },
    { category: 'Investment', amount: 1000, color: 'bg-green-500' },
    { category: 'Gym', amount: 1500, color: 'bg-orange-500' },
  ]

  const totalBudget = MONTHLY_BUDGET.reduce((s, b) => s + b.amount, 0)
  const totalInAll = monthlyIncome + rapidoIncome + totalIncome

  // Group expenses by category
  const expenseByCategory = expenses.reduce((acc, e) => {
    const cat = e.category || 'other'
    acc[cat] = (acc[cat] || 0) + Number(e.amount)
    return acc
  }, {} as Record<string, number>)

  const monthName = new Date(currentMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground">Finance</h1>
        <p className="text-sm text-muted-foreground">{monthName}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="arc-card">
          <p className="text-xs text-muted-foreground mb-1">Total income</p>
          <p className="text-xl font-black text-green-400">{formatCurrency(totalInAll)}</p>
          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
            <div>Salary: {formatCurrency(monthlyIncome)}</div>
            {rapidoIncome > 0 && <div>Rapido: {formatCurrency(rapidoIncome)}</div>}
            {totalIncome > 0 && <div>Other: {formatCurrency(totalIncome)}</div>}
          </div>
        </div>
        <div className="arc-card">
          <p className="text-xs text-muted-foreground mb-1">Spent</p>
          <p className="text-xl font-black text-red-400">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {expenses.length} transactions
          </p>
        </div>
      </div>

      {/* Remaining */}
      <div className={cn(
        'arc-card text-center py-4',
        remaining >= 0 ? 'border-green-500/20' : 'border-red-500/20'
      )}>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Remaining</p>
        <p className={`text-4xl font-black ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatCurrency(Math.abs(remaining))}
        </p>
        {remaining < 0 && <p className="text-xs text-red-400 mt-1">Over budget</p>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-finance-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all duration-200',
              activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {(Object.entries(expenseByCategory) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
            const label = EXPENSE_CATEGORIES.find(c => c.value === cat)?.label ?? cat
            const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground font-medium">{label}</span>
                  <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                </div>
                <div className="arc-progress">
                  <div className="arc-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          {Object.keys(expenseByCategory).length === 0 && (
            <div className="text-center py-8 arc-card space-y-2">
              <p className="text-3xl">💸</p>
              <p className="font-semibold text-foreground">No expenses this month</p>
              <p className="text-sm text-muted-foreground">Add expenses to track your spending</p>
            </div>
          )}
        </div>
      )}

      {/* Expenses tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="section-header">Expenses ({expenses.length})</p>
            <button
              id="add-expense"
              onClick={() => setShowExpenseForm(!showExpenseForm)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              + Add
            </button>
          </div>

          {showExpenseForm && (
            <div className="arc-card space-y-3">
              <h3 className="font-bold text-sm text-foreground">Add Expense</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Amount (₹)</label>
                  <input
                    id="expense-amount"
                    type="number"
                    min="0"
                    value={expForm.amount}
                    onChange={(e) => setExpForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0"
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Date</label>
                  <input
                    type="date"
                    value={expForm.date}
                    onChange={(e) => setExpForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <select
                value={expForm.category}
                onChange={(e) => setExpForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input
                type="text"
                value={expForm.description}
                onChange={(e) => setExpForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {expenseError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  ⚠️ {expenseError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  id="expense-save"
                  onClick={handleAddExpense}
                  disabled={saving}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-xl text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => { setShowExpenseForm(false); setExpenseError(null) }} className="px-4 py-2 bg-secondary text-foreground rounded-xl text-sm border border-border">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {expenses.slice(0, 20).map((exp) => (
              <div key={exp.id} className="arc-card flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {EXPENSE_CATEGORIES.find(c => c.value === exp.category)?.label ?? exp.category}
                  </p>
                  {exp.description && <p className="text-xs text-muted-foreground">{exp.description}</p>}
                  <p className="text-xs text-muted-foreground">{exp.date}</p>
                </div>
                <p className="text-sm font-bold text-red-400">{formatCurrency(Number(exp.amount))}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget tab */}
      {activeTab === 'budget' && (
        <div className="space-y-4">
          <div className="arc-card space-y-3">
            <p className="section-header">Monthly Budget Plan</p>
            <p className="text-xs text-muted-foreground">Edit in Settings → Finance</p>
            {MONTHLY_BUDGET.map((b) => {
              const spent = expenseByCategory[b.category.toLowerCase().replace('/', '_').replace(' ', '_')] ?? 0
              const pct = Math.min(100, (spent / b.amount) * 100)
              return (
                <div key={b.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">{b.category}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(spent)} / {formatCurrency(b.amount)}
                    </span>
                  </div>
                  <div className="arc-progress">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-red-500' : b.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="arc-card space-y-2">
            <p className="section-header">Fixed commitments</p>
            {MONTHLY_BUDGET.map(b => (
              <div key={b.category} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{b.category}</span>
                <span className="font-semibold text-foreground">{formatCurrency(b.amount)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
              <span className="text-foreground">Total committed</span>
              <span className="text-foreground">{formatCurrency(totalBudget)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-green-400">Discretionary</span>
              <span className="text-green-400">{formatCurrency(monthlyIncome - totalBudget)}</span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Personal tracking only. Not financial advice.
          </p>
        </div>
      )}
    </div>
  )
}
