export type Priority = 'High' | 'Medium' | 'Low'
export type TxnType = 'income' | 'expense' | 'savings'

export type Task = {
  id: string
  title: string
  category: string
  priority: Priority
  due: string
  done: boolean
}

export type EventItem = {
  id: string
  title: string
  place: string
  day: number
  start: string
  tone: 'blue' | 'violet' | 'orange' | 'green'
}

export type Reminder = {
  id: string
  title: string
  time: string
  badge: 'red' | 'purple' | 'gold'
  done: boolean
}

export type Profile = {
  name: string
  role: string
  focus: string
}

export const STORE_KEYS = {
  reminders: 'lifeos.reminders',
  profile: 'lifeos.profile',
} as const

export const seedTasks: Task[] = [
  { id: 't1', title: 'Review project proposal', category: 'Work', priority: 'High', due: '09:00', done: true },
  { id: 't2', title: 'Complete mathematics exercises', category: 'Study', priority: 'Medium', due: '11:30', done: false },
  { id: 't3', title: 'Team project meeting', category: 'Meeting', priority: 'High', due: '14:00', done: false },
  { id: 't4', title: 'Evening workout', category: 'Health', priority: 'Low', due: '18:30', done: false },
  { id: 't5', title: 'Read 30 pages of Deep Work', category: 'Study', priority: 'Medium', due: '20:00', done: false },
  { id: 't6', title: 'Pay internet bill', category: 'Finance', priority: 'High', due: '08:00', done: true },
]

export const seedEvents: EventItem[] = [
  { id: 'e1', title: 'Data Structures lecture', place: 'Room 204 · Prof. Smith', day: 18, start: '10:30', tone: 'blue' },
  { id: 'e2', title: 'Focus session', place: 'Library · 90 minutes', day: 18, start: '12:30', tone: 'violet' },
  { id: 'e3', title: 'Student council', place: 'Conference room', day: 18, start: '15:00', tone: 'orange' },
  { id: 'e4', title: 'Gym with Sam', place: 'FitHub · 60 minutes', day: 19, start: '07:00', tone: 'green' },
  { id: 'e5', title: 'Calculus review', place: 'Study room 3', day: 20, start: '16:00', tone: 'blue' },
]

export const seedReminders: Reminder[] = [
  { id: 'r1', title: 'Submit research summary', time: 'Today · 17:00', badge: 'red', done: false },
  { id: 'r2', title: 'Call the registrar', time: 'Tomorrow · 09:00', badge: 'purple', done: false },
  { id: 'r3', title: 'Renew library books', time: 'Fri · 12:00', badge: 'gold', done: false },
]

export const seedProfile: Profile = { name: 'Brian Acon', role: 'Student • Life Manager', focus: 'Plan my study schedule for this week' }

const KSH_PER_USD = 10

export function money(value: number, isDark: boolean) {
  const amount = isDark ? value * KSH_PER_USD : value
  const formatted = amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return isDark ? `KSh ${formatted}` : `$${formatted}`
}

export function goalPercent(goal: { current: number; target: number }) {
  return Math.min(100, Math.round((goal.current / goal.target) * 100))
}

export function balanceOf(txns: { type: string; amount: number }[]) {
  return txns.reduce((total, txn) => {
    if (txn.type === 'income') return total + txn.amount
    if (txn.type === 'expense') return total - txn.amount
    return total
  }, 0)
}

export function learningPercent(courses: { done: number; total: number }[]) {
  const done = courses.reduce((sum, course) => sum + course.done, 0)
  const total = courses.reduce((sum, course) => sum + course.total, 0)
  return total === 0 ? 0 : Math.round((done / total) * 100)
}
