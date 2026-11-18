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

export type Txn = {
  id: string
  label: string
  amount: number
  type: TxnType
  date: string
}

export type Course = {
  id: string
  name: string
  done: number
  total: number
  tone: 'blue' | 'teal' | 'orange' | 'purple'
}

export type Goal = {
  id: string
  title: string
  current: number
  target: number
  unit: string
  tone: 'indigo' | 'green' | 'orange'
}

export type Note = {
  id: string
  title: string
  emoji: string
  className: string
  type: string
  reviewed: boolean
}

export type FileDoc = {
  id: string
  name: string
  kind: string
  size: string
  tag: string
}

export type Reminder = {
  id: string
  title: string
  time: string
  badge: 'red' | 'purple' | 'gold'
  done: boolean
}

export type Activity = {
  id: string
  title: string
  time: string
}

export type Rule = {
  id: string
  trigger: string
  action: string
  active: boolean
  runs: number
}

export type Profile = {
  name: string
  role: string
  focus: string
}

export type HealthLog = {
  steps: number
  sleep: number
  water: number
  diet: boolean
}

export const STORE_KEYS = {
  tasks: 'lifeos.tasks',
  events: 'lifeos.events',
  txns: 'lifeos.txns',
  courses: 'lifeos.courses',
  goals: 'lifeos.goals',
  notes: 'lifeos.notes',
  files: 'lifeos.files',
  reminders: 'lifeos.reminders',
  activity: 'lifeos.activity',
  rules: 'lifeos.rules',
  profile: 'lifeos.profile',
  health: 'lifeos.health',
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

export const seedTxns: Txn[] = [
  { id: 'x1', label: 'Part-time salary', amount: 1200, type: 'income', date: 'Nov 2' },
  { id: 'x2', label: 'Rent share', amount: 380, type: 'expense', date: 'Nov 4' },
  { id: 'x3', label: 'Groceries', amount: 96, type: 'expense', date: 'Nov 6' },
  { id: 'x4', label: 'Freelance design', amount: 260, type: 'income', date: 'Nov 9' },
  { id: 'x5', label: 'Savings transfer', amount: 200, type: 'savings', date: 'Nov 10' },
  { id: 'x6', label: 'Study materials', amount: 74, type: 'expense', date: 'Nov 13' },
  { id: 'x7', label: 'Campus dinner', amount: 28, type: 'expense', date: 'Nov 16' },
]

export const seedCourses: Course[] = [
  { id: 'c1', name: 'Mathematics', done: 9, total: 12, tone: 'blue' },
  { id: 'c2', name: 'Computer Science', done: 14, total: 18, tone: 'teal' },
  { id: 'c3', name: 'Economics', done: 7, total: 10, tone: 'orange' },
  { id: 'c4', name: 'Python', done: 5, total: 8, tone: 'purple' },
]

export const seedGoals: Goal[] = [
  { id: 'g1', title: 'Read 12 books', current: 9, target: 12, unit: 'books', tone: 'indigo' },
  { id: 'g2', title: 'Save for a laptop', current: 840, target: 1200, unit: '$', tone: 'green' },
  { id: 'g3', title: 'Run 100 km', current: 68, target: 100, unit: 'km', tone: 'orange' },
]

export const seedNotes: Note[] = [
  { id: 'n1', title: 'Renaissance art timeline', emoji: '🎨', className: 'ENG 455', type: 'Lecture', reviewed: false },
  { id: 'n2', title: 'Big-O cheat sheet', emoji: '🧮', className: 'COSC 210', type: 'Study Group', reviewed: true },
  { id: 'n3', title: 'Macroeconomics: inflation notes', emoji: '📈', className: 'ECON 302', type: 'Reading', reviewed: false },
  { id: 'n4', title: 'Python decorators explained', emoji: '🐍', className: 'Python', type: 'Section', reviewed: true },
  { id: 'n5', title: 'Essay outline: modernism', emoji: '✍️', className: 'ENG 455', type: 'Seminar', reviewed: false },
]

export const seedFiles: FileDoc[] = [
  { id: 'f1', name: 'Thesis draft v2.pdf', kind: 'PDF', size: '1.8 MB', tag: 'Thesis' },
  { id: 'f2', name: 'Calculus notes.docx', kind: 'DOCX', size: '480 KB', tag: 'Study' },
  { id: 'f3', name: 'Budget 2026.xlsx', kind: 'XLSX', size: '96 KB', tag: 'Finance' },
  { id: 'f4', name: 'Campus map.png', kind: 'PNG', size: '2.4 MB', tag: 'Personal' },
]

export const seedReminders: Reminder[] = [
  { id: 'r1', title: 'Submit research summary', time: 'Today · 17:00', badge: 'red', done: false },
  { id: 'r2', title: 'Call the registrar', time: 'Tomorrow · 09:00', badge: 'purple', done: false },
  { id: 'r3', title: 'Renew library books', time: 'Fri · 12:00', badge: 'gold', done: false },
]

export const seedActivity: Activity[] = [
  { id: 'a1', title: 'Completed “Review project proposal”', time: '2h ago' },
  { id: 'a2', title: 'Added a note to COSC 210', time: '5h ago' },
  { id: 'a3', title: 'Logged 7,500 steps', time: 'Yesterday' },
  { id: 'a4', title: 'Paid internet bill', time: 'Yesterday' },
]

export const seedRules: Rule[] = [
  { id: 'ru1', trigger: 'Task completed', action: 'Log an activity entry', active: true, runs: 12 },
  { id: 'ru2', trigger: 'New expense added', action: 'Update monthly budget', active: true, runs: 7 },
  { id: 'ru3', trigger: 'Study session ended', action: 'Add 30 min to learning goal', active: false, runs: 3 },
]

export const seedProfile: Profile = { name: 'Brian Acon', role: 'Student • Life Manager', focus: 'Plan my study schedule for this week' }

export const seedHealth: HealthLog = { steps: 7500, sleep: 7.2, water: 1.8, diet: true }

const KSH_PER_USD = 10

export function money(value: number, isDark: boolean) {
  const amount = isDark ? value * KSH_PER_USD : value
  const formatted = amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return isDark ? `KSh ${formatted}` : `$${formatted}`
}

export function goalPercent(goal: Goal) {
  return Math.min(100, Math.round((goal.current / goal.target) * 100))
}

export function balanceOf(txns: Txn[]) {
  return txns.reduce((total, txn) => {
    if (txn.type === 'income') return total + txn.amount
    if (txn.type === 'expense') return total - txn.amount
    return total
  }, 0)
}

export function learningPercent(courses: Course[]) {
  const done = courses.reduce((sum, course) => sum + course.done, 0)
  const total = courses.reduce((sum, course) => sum + course.total, 0)
  return total === 0 ? 0 : Math.round((done / total) * 100)
}
