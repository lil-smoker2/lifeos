import { useState, type FormEvent } from 'react'
import { Plus, Trash2, Wallet } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useBudget } from '../features/budget/useBudget'
import { CURRENCIES, DEFAULT_CURRENCY, formatCurrency } from '../lib/currencies'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function BudgetPage() {
  const {
    currency,
    wallet,
    distribution,
    essentials,
    discretionary,
    items,
    timetable,
    isLoading,
    setWallet,
    setCurrency,
    setDistribution,
    addItem,
    removeItem,
    regenerateTimetable,
  } = useBudget()

  const itemList = items ?? []
  const currencyCode = currency ?? DEFAULT_CURRENCY

  const [walletInput, setWalletInput] = useState(String(wallet ?? 0))
  const [food, setFood] = useState(distribution?.food ?? 30)
  const [rent, setRent] = useState(distribution?.rent ?? 40)
  const [savings, setSavings] = useState(distribution?.savings ?? 30)
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const foodMin = 15

  const totalPct = food + rent + savings

  function setWalletAmount(event: FormEvent) {
    event.preventDefault()
    const amount = Number(walletInput)
    if (!Number.isFinite(amount) || amount < 0) return
    setWallet.mutate(amount)
  }

  function applyDistribution(event: FormEvent) {
    event.preventDefault()
    setDistribution.mutate({ food_pct: food, rent_pct: rent, savings_pct: savings })
  }

  function addBuyingItem(event: FormEvent) {
    event.preventDefault()
    const name = itemName.trim()
    const price = Number(itemPrice)
    if (!name || !Number.isFinite(price) || price < 0) return
    addItem.mutate({ name, price })
    setItemName('')
    setItemPrice('')
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Budget planner"
        title="Make your money work"
        description="Set your wallet amount, split it between food, rent and savings, and see what you can afford."
      >
        <div className="kpi-row">
          <span className="kpi"><strong>{formatCurrency(wallet ?? 0, currencyCode)}</strong> wallet</span>
          <span className="kpi"><strong>{formatCurrency(discretionary ?? 0, currencyCode)}</strong> left after essentials</span>
        </div>
      </PageHeader>

      <section className="card">
        <header className="card-head"><h2>Your wallet</h2><p>How much money do you have?</p></header>
        <form className="inline-form" onSubmit={setWalletAmount}>
          <select
            value={currencyCode}
            onChange={event => setCurrency.mutate(event.target.value)}
            aria-label="Budget currency"
            disabled={setCurrency.isPending}
          >
            {CURRENCIES.map(option => <option key={option.code} value={option.code}>{option.code} — {option.name}</option>)}
          </select>
          <input
            value={walletInput}
            onChange={event => setWalletInput(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="Wallet amount"
            aria-label="Wallet amount"
            required
          />
          <button className="btn btn-primary" type="submit" disabled={isLoading}>
            <Wallet size={16} /> Set wallet
          </button>
        </form>
        <p className="note">Changing currency relabels your existing amounts; it does not convert them or use an exchange rate.</p>
      </section>

      <section className="card">
        <header className="card-head"><h2>Money distribution</h2><p>How you want to split your wallet.</p></header>
        <form className="inline-form" onSubmit={applyDistribution} style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '120px' }}>
            <label>Food <span>min {foodMin}%</span></label>
            <input
              type="number" min={foodMin} max="100" step="1" value={food}
              onChange={event => setFood(Number(event.target.value))}
              aria-label="Food percent" required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '120px' }}>
            <label>Rent</label>
            <input type="number" min="0" max="100" step="1" value={rent}
              onChange={event => setRent(Number(event.target.value))} aria-label="Rent percent" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '120px' }}>
            <label>Savings</label>
            <input type="number" min="0" max="100" step="1" value={savings}
              onChange={event => setSavings(Number(event.target.value))} aria-label="Savings percent" required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={isLoading || totalPct > 100 || food < foodMin}>
            Apply distribution
          </button>
          {food < foodMin ? <span className="note">Food cannot go below {foodMin}% — it is a priority.</span> : null}
          {totalPct > 100 ? <span className="note">Total cannot exceed 100%.</span> : null}
        </form>
        <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--muted)' }}>
          <strong>Essentials:</strong> {formatCurrency(essentials ?? 0, currencyCode)} &nbsp;|&nbsp;
          <strong>Left for other items:</strong> {formatCurrency(discretionary ?? 0, currencyCode)}
        </div>
      </section>

      <section className="card">
        <header className="card-head"><h2>What you want to buy</h2><p>Items are marked affordable when they fit within what is left after essentials.</p></header>
        <form className="inline-form" onSubmit={addBuyingItem} style={{ display: 'flex', gap: '8px', alignItems: 'end', flexWrap: 'wrap' }}>
          <input value={itemName} onChange={event => setItemName(event.target.value)} placeholder="Item (e.g. shoes, sweater)" aria-label="Item name" required />
          <input value={itemPrice} onChange={event => setItemPrice(event.target.value)} type="number" min="0" step="0.01" placeholder="Price" aria-label="Item price" required />
          <button className="btn btn-primary" type="submit">Add item</button>
        </form>
        <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--muted)' }}>
          Discretionary remaining: <strong>{formatCurrency(discretionary ?? 0, currencyCode)}</strong>
        </div>
        <ul style={{ marginTop: '10px', listStyle: 'none', padding: 0 }}>
          {itemList.map(item => (
            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{item.name} — {formatCurrency(item.price, currencyCode)}</span>
              <span style={{ fontWeight: 'bold', color: item.affordable ? 'var(--green)' : 'var(--red)' }}>
                {item.affordable ? 'Affordable' : 'Too expensive'}
              </span>
              <button className="icon-ghost" type="button" aria-label={`Remove ${item.name}`} onClick={() => removeItem.mutate(item.id)}>
                <Trash2 size={15} />
              </button>
            </li>
          ))}
          {itemList.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No items yet. Add shoes, a sweater or anything you are saving for.</p>}
        </ul>
      </section>

      <section className="card">
        <header className="card-head"><h2>Weekly food timetable</h2><p>Rewritten automatically from your food budget.</p></header>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
          <button className="btn btn-ghost" type="button" onClick={() => regenerateTimetable.mutate()} disabled={isLoading}>
            <Plus size={14} /> Regenerate timetable
          </button>
          <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Food budget: {formatCurrency(((wallet ?? 0) * (distribution?.food ?? 30)) / 100, currencyCode)}
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Day', 'Meal', 'Cost'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, index) => {
              const entry = timetable?.[index]
              return (
                <tr key={day} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px' }}><strong>{day}</strong></td>
                  <td style={{ padding: '8px' }}>{entry?.meal ?? (MEALS[index % MEALS.length])}</td>
                  <td style={{ padding: '8px' }}>{formatCurrency(entry?.cost ?? 0, currencyCode)}</td>
                </tr>
              )
            })}
            <tr style={{ fontWeight: 'bold', borderTop: '2px solid var(--border)' }}>
              <td style={{ padding: '8px' }}>Total</td>
              <td style={{ padding: '8px' }}>{timetable?.length ?? 0} meals</td>
              <td style={{ padding: '8px' }}>{formatCurrency(timetable?.reduce((sum, e) => sum + e.cost, 0) ?? 0, currencyCode)}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  )
}

const MEALS = [
  'Maize porridge & tea',
  'Rice & beans',
  'Ugali & sukuma wiki',
  'Chapati & lentils',
  'Potatoes & eggs',
  'Pasta & tomato sauce',
  'Millet porridge & milk',
]
