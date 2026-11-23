import { useState, type FormEvent } from 'react'
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Plus, Trash2, Wallet } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { CURRENCIES, DEFAULT_CURRENCY, formatCurrency } from '../lib/currencies'
import { useTransactions } from '../features/finance/useTransactions'

const TYPES = ['income', 'expense', 'savings'] as const

export function FinancePage() {
  const { transactions: txns, create, remove } = useTransactions()
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<(typeof TYPES)[number]>('expense')
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY)

  const selectedTransactions = txns.filter(t => t.currency === currency)
  const income = selectedTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = selectedTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savings = selectedTransactions.filter(t => t.type === 'savings').reduce((s, t) => s + t.amount, 0)
  const balance = income - expenses
  const max = Math.max(income, expenses, savings, 1)

  function addTxn(event: FormEvent) {
    event.preventDefault()
    const cleanLabel = label.trim()
    const parsed = Number(amount)
    if (!cleanLabel || !Number.isFinite(parsed) || parsed <= 0) return
    create.mutate({ label: cleanLabel, amount: parsed, type, currency, date: new Date().toISOString().slice(0, 10) })
    setLabel('')
    setAmount('')
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Finance"
        title="Money, clearly"
        description="Track money in different currencies. Totals only combine entries in the selected currency; no exchange rates are assumed."
      >
        <div className="kpi-row">
          <label className="kpi">
            Currency
            <select value={currency} onChange={event => setCurrency(event.target.value)} aria-label="Currency for new entries and totals">
              {CURRENCIES.map(option => <option key={option.code} value={option.code}>{option.code} — {option.name}</option>)}
            </select>
          </label>
          <span className="kpi"><strong>{formatCurrency(balance, currency)}</strong> balance</span>
          <span className="kpi"><strong>{formatCurrency(savings, currency)}</strong> saved</span>
        </div>
      </PageHeader>

      <section className="summary-grid">
        <article className="summary-card">
          <span className="mini-icon grad-teal"><Wallet size={18} /></span>
          <span>Available</span>
          <strong>{formatCurrency(balance, currency)}</strong>
          <small>↑ 12% vs October</small>
        </article>
        <article className="summary-card">
          <span className="mini-icon grad-green"><ArrowDownLeft size={18} /></span>
          <span>Income</span>
          <strong>{formatCurrency(income, currency)}</strong>
          <small>2 deposits this month</small>
        </article>
        <article className="summary-card">
          <span className="mini-icon grad-orange"><ArrowUpRight size={18} /></span>
          <span>Expenses</span>
          <strong>{formatCurrency(expenses, currency)}</strong>
          <small>{Math.round((expenses / Math.max(income, 1)) * 100)}% of income</small>
        </article>
        <article className="summary-card">
          <span className="mini-icon grad-purple"><PiggyBank size={18} /></span>
          <span>Savings</span>
          <strong>{formatCurrency(savings, currency)}</strong>
          <small>On track for laptop goal</small>
        </article>
      </section>

      <div className="planner-grid">
        <section className="card">
          <header className="card-head"><h2>Transactions</h2><span className="trend">{txns.length} entries</span></header>
          <form className="inline-form" onSubmit={addTxn}>
            <input value={label} onChange={event => setLabel(event.target.value)} placeholder="Description" aria-label="Transaction description" required />
            <input type="number" min="1" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} placeholder="Amount" aria-label="Amount" required />
            <select value={currency} onChange={event => setCurrency(event.target.value)} aria-label="Transaction currency">
              {CURRENCIES.map(option => <option key={option.code} value={option.code}>{option.code}</option>)}
            </select>
            <select value={type} onChange={event => setType(event.target.value as (typeof TYPES)[number])} aria-label="Type">
              {TYPES.map(option => <option key={option}>{option}</option>)}
            </select>
            <button className="btn btn-primary" type="submit"><Plus size={16} /> Add</button>
          </form>

          <ul className="txn-list">
            {txns.map(txn => (
              <li className="txn-row" key={txn.id}>
                <span className={`txn-icon ${txn.type}`}>
                  {txn.type === 'income' ? <ArrowDownLeft size={15} /> : txn.type === 'savings' ? <PiggyBank size={15} /> : <ArrowUpRight size={15} />}
                </span>
                <div className="txn-copy"><strong>{txn.label}</strong><span>{txn.date} · {txn.type}</span></div>
                <span className={`txn-amount ${txn.type}`}>
                  {txn.type === 'income' ? '+' : txn.type === 'expense' ? '−' : ''}{formatCurrency(txn.amount, txn.currency)}
                </span>
                <button className="icon-ghost" type="button" aria-label={`Delete ${txn.label}`} onClick={() => remove.mutate(txn.id)}>
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <header className="card-head"><h2>Cash flow split</h2><p>This month</p></header>
          <div className="flow-bars">
            {[
              { label: 'Income', value: income, tone: 'green' },
              { label: 'Expenses', value: expenses, tone: 'orange' },
              { label: 'Savings', value: savings, tone: 'purple' },
            ].map(row => (
              <div key={row.label} className="flow-row">
                <div><span>{row.label}</span><strong>{formatCurrency(row.value, currency)}</strong></div>
                <div className={`track ${row.tone}`}><i style={{ width: `${Math.round((row.value / max) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="note">Expenses stay under 45% of income — a healthy month. Next bill: internet on Nov 20.</p>
        </section>
      </div>
    </div>
  )
}
