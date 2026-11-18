import { useState, type FormEvent } from 'react'
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Plus, Trash2, Wallet } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useTheme } from '../features/theme/ThemeProvider'
import { STORE_KEYS, balanceOf, money, seedTxns, type Txn, type TxnType } from '../lib/seed'
import { useLocalStore, uid } from '../lib/useLocalStore'

const TYPES: TxnType[] = ['income', 'expense', 'savings']

export function FinancePage() {
  const { isDark } = useTheme()
  const [txns, setTxns] = useLocalStore<Txn[]>(STORE_KEYS.txns, seedTxns)
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TxnType>('expense')

  const balance = balanceOf(txns)
  const income = txns.filter(txn => txn.type === 'income').reduce((sum, txn) => sum + txn.amount, 0)
  const expenses = txns.filter(txn => txn.type === 'expense').reduce((sum, txn) => sum + txn.amount, 0)
  const savings = txns.filter(txn => txn.type === 'savings').reduce((sum, txn) => sum + txn.amount, 0)
  const max = Math.max(income, expenses, savings, 1)

  function addTxn(event: FormEvent) {
    event.preventDefault()
    const cleanLabel = label.trim()
    const parsed = Number(amount)
    if (!cleanLabel || !Number.isFinite(parsed) || parsed <= 0) return
    setTxns(current => [
      { id: uid(), label: cleanLabel, amount: parsed, type, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
      ...current,
    ])
    setLabel('')
    setAmount('')
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Finance"
        title="Money, clearly"
        description="Log income, expenses and savings. Totals convert to KSh automatically in dark mode."
      >
        <div className="kpi-row">
          <span className="kpi"><strong>{money(balance, isDark)}</strong> balance</span>
          <span className="kpi"><strong>{money(savings, isDark)}</strong> saved</span>
        </div>
      </PageHeader>

      <section className="summary-grid">
        <article className="summary-card">
          <span className="mini-icon grad-teal"><Wallet size={18} /></span>
          <span>Available</span>
          <strong>{money(balance, isDark)}</strong>
          <small>↑ 12% vs October</small>
        </article>
        <article className="summary-card">
          <span className="mini-icon grad-green"><ArrowDownLeft size={18} /></span>
          <span>Income</span>
          <strong>{money(income, isDark)}</strong>
          <small>2 deposits this month</small>
        </article>
        <article className="summary-card">
          <span className="mini-icon grad-orange"><ArrowUpRight size={18} /></span>
          <span>Expenses</span>
          <strong>{money(expenses, isDark)}</strong>
          <small>{Math.round((expenses / Math.max(income, 1)) * 100)}% of income</small>
        </article>
        <article className="summary-card">
          <span className="mini-icon grad-purple"><PiggyBank size={18} /></span>
          <span>Savings</span>
          <strong>{money(savings, isDark)}</strong>
          <small>On track for laptop goal</small>
        </article>
      </section>

      <div className="planner-grid">
        <section className="card">
          <header className="card-head"><h2>November transactions</h2><span className="trend">{txns.length} entries</span></header>
          <form className="inline-form" onSubmit={addTxn}>
            <input value={label} onChange={event => setLabel(event.target.value)} placeholder="Description" aria-label="Transaction description" required />
            <input type="number" min="1" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} placeholder="Amount" aria-label="Amount" required />
            <select value={type} onChange={event => setType(event.target.value as TxnType)} aria-label="Type">
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
                  {txn.type === 'income' ? '+' : txn.type === 'expense' ? '−' : ''}{money(txn.amount, isDark)}
                </span>
                <button className="icon-ghost" type="button" aria-label={`Delete ${txn.label}`} onClick={() => setTxns(current => current.filter(item => item.id !== txn.id))}>
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
                <div><span>{row.label}</span><strong>{money(row.value, isDark)}</strong></div>
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
