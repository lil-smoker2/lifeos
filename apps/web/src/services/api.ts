export type AuthUser = {
  id: string
  name: string
  role: string
}

export type AuthResponse = {
  access_token: string
  token_type: string
  user: AuthUser
}

export type RegistrationResponse = AuthResponse & {
  recovery_codes: string[]
}

const TOKEN_KEY = 'lifeos.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const API_BASE = (typeof window !== 'undefined' && (window as any).electronAPI)
  ? 'http://localhost:8000'
  : ''

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE}/api${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'Cannot reach the LifeOS API. Is it running on port 8000?')
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as { detail?: string | { msg?: string }[] }
      if (typeof body.detail === 'string') detail = body.detail
      else if (Array.isArray(body.detail) && body.detail[0]?.msg) detail = body.detail[0].msg
    } catch {
      // Keep the status-based message when the body is not JSON.
    }
    throw new ApiError(response.status, detail)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  login: (name: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    }),
  register: (name: string, password: string) =>
    request<RegistrationResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    }),
  resetPassword: (name: string, recoveryCode: string, newPassword: string) =>
    request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ name, recovery_code: recoveryCode, new_password: newPassword }),
    }),
  me: () => request<AuthUser>('/auth/me'),
  tasks: {
    list: () => request<ApiTask[]>('/tasks'),
    create: (input: NewTask) =>
      request<ApiTask>('/tasks', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: string, changes: Partial<NewTask & { done: boolean }>) =>
      request<ApiTask>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
    remove: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  },
  events: {
    list: () => request<ApiEvent[]>('/events'),
    create: (input: NewEvent) =>
      request<ApiEvent>('/events', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: string, changes: Partial<NewEvent>) =>
      request<ApiEvent>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
    remove: (id: string) => request<void>(`/events/${id}`, { method: 'DELETE' }),
  },
  transactions: {
    list: () => request<ApiTxn[]>('/transactions'),
    create: (input: NewTxn) =>
      request<ApiTxn>('/transactions', { method: 'POST', body: JSON.stringify(input) }),
    remove: (id: string) => request<void>(`/transactions/${id}`, { method: 'DELETE' }),
  },
  courses: {
    list: () => request<ApiCourse[]>('/courses'),
    update: (id: string, changes: { done: number }) =>
      request<ApiCourse>(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
  },
  goals: {
    list: () => request<ApiGoal[]>('/goals'),
    create: (input: NewGoal) =>
      request<ApiGoal>('/goals', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: string, changes: Partial<NewGoal & { current: number }>) =>
      request<ApiGoal>(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
    remove: (id: string) => request<void>(`/goals/${id}`, { method: 'DELETE' }),
  },
  healthlog: {
    get: () => request<ApiHealth>('/health-log'),
    update: (input: ApiHealth) =>
      request<ApiHealth>('/health-log', { method: 'PUT', body: JSON.stringify(input) }),
  },
  summary: () => request<ApiSummary>('/summary'),
  notes: {
    list: (limit = 50, offset = 0) =>
      request<ApiNote[]>(`/notes?limit=${limit}&offset=${offset}`),
    create: (input: NewNote) =>
      request<ApiNote>('/notes', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: string, changes: Partial<NewNote & { reviewed: boolean }>) =>
      request<ApiNote>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
    remove: (id: string) => request<void>(`/notes/${id}`, { method: 'DELETE' }),
  },
  documents: {
    list: () => request<ApiDocument[]>('/documents'),
    upload: (file: File, tag = 'Uploaded') => {
      const form = new FormData()
      form.append('file', file)
      form.append('tag', tag)
      return request<ApiDocument>('/documents', { method: 'POST', body: form })
    },
    remove: (id: string) => request<void>(`/documents/${id}`, { method: 'DELETE' }),
    download: async (id: string, name: string) => {
      const blob = await fetchBlob(`/documents/${id}/download`)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = name
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    preview: async (id: string) => {
      const blob = await fetchBlob(`/documents/${id}/preview`)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    },
  },
  alerts: {
    list: () => request<ApiAlert[]>('/alerts'),
    update: (id: string, read: boolean) =>
      request<ApiAlert>(`/alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ read }) }),
    readAll: () => request<void>('/alerts/read-all', { method: 'POST' }),
    remove: (id: string) => request<void>(`/alerts/${id}`, { method: 'DELETE' }),
  },
  search: (query: string) =>
    request<ApiSearchHit[]>(`/search?q=${encodeURIComponent(query)}`),
  assistant: {
    ask: (prompt: string, currency = 'USD') =>
      request<{ answer: string }>('/assistant', { method: 'POST', body: JSON.stringify({ prompt, currency }) }),
  },
  automation: {
    rules: () => request<ApiRule[]>('/automation/rules'),
    createRule: (input: NewRule) =>
      request<ApiRule>('/automation/rules', { method: 'POST', body: JSON.stringify(input) }),
    updateRule: (id: string, changes: Partial<NewRule>) =>
      request<ApiRule>(`/automation/rules/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
    removeRule: (id: string) => request<void>(`/automation/rules/${id}`, { method: 'DELETE' }),
    runRule: (id: string) =>
      request<ApiActivity>(`/automation/rules/${id}/run`, { method: 'POST' }),
    activity: () => request<ApiActivity[]>('/automation/activity'),
  },
  budget: {
    get: () => request<ApiBudgetSnapshot>('/budget'),
    setCurrency: (currency: string) =>
      request<ApiBudgetOut>('/budget/currency', { method: 'POST', body: JSON.stringify({ currency }) }),
    setWallet: (amount: number) =>
      request<ApiBudgetOut>('/budget/wallet', { method: 'POST', body: JSON.stringify({ amount }) }),
    setDistribution: (input: { food_pct: number; rent_pct: number; savings_pct: number }) =>
      request<{ food: number; rent: number; savings: number }>('/budget/distribution', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    addItem: (input: { name: string; price: number }) =>
      request<ApiBudgetItemOut>('/budget/items', { method: 'POST', body: JSON.stringify(input) }),
    removeItem: (id: string) => request<void>(`/budget/items/${id}`, { method: 'DELETE' }),
    regenerateTimetable: () =>
      request<ApiFoodTimetableOut[]>('/budget/timetable/regenerate', { method: 'POST' }),
  },
}

async function fetchBlob(path: string): Promise<Blob> {
  const token = getToken()
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`/api${path}`, { headers })
  if (!response.ok) throw new ApiError(response.status, `Request failed (${response.status})`)
  return response.blob()
}

export type ApiTask = {
  id: string
  title: string
  category: string
  priority: 'High' | 'Medium' | 'Low'
  due: string
  done: boolean
}

export type NewTask = {
  title: string
  category: string
  priority: 'High' | 'Medium' | 'Low'
  due: string
}

export type ApiEvent = {
  id: string
  title: string
  place: string
  starts_at: string
  ends_at: string | null
  tone: 'blue' | 'violet' | 'orange' | 'green'
}

export type NewEvent = {
  title: string
  place: string
  starts_at: string
  tone: 'blue' | 'violet' | 'orange' | 'green'
}

export type ApiTxn = {
  id: string
  label: string
  amount: number
  currency: string
  type: string
  date: string
}

export type NewTxn = {
  label: string
  amount: number
  currency: string
  type: 'income' | 'expense' | 'savings'
  date?: string
}

export type ApiCourse = {
  id: string
  name: string
  done: number
  total: number
  tone: string
}

export type ApiGoal = {
  id: string
  title: string
  current: number
  target: number
  unit: string
  tone: string
}

export type NewGoal = {
  title: string
  target: number
  unit: string
  tone: 'indigo' | 'green' | 'orange'
}

export type ApiHealth = {
  steps: number
  sleep: number
  water: number
  diet: boolean
}

export type ApiSummary = {
  finance: { by_currency: Record<string, { income: number; expenses: number; savings: number; balance: number; count: number }> }
  learning: { courses: number; lessons_done: number; lessons_total: number; percent: number }
  goals: { count: number; average_percent: number }
  health: ApiHealth
}

export type ApiBudgetOut = {
  id: string
  wallet: number
  currency: string
  food_pct: number
  rent_pct: number
  savings_pct: number
  updated_at: string
}

export type ApiBudgetItemOut = {
  id: string
  name: string
  price: number
  affordable: boolean
}

export type ApiFoodTimetableOut = {
  id: string
  day_of_week: number
  day: string
  meal: string
  cost: number
}

export type ApiBudgetSnapshot = {
  wallet: number
  currency: string
  distribution: { food: number; rent: number; savings: number }
  essentials: number
  discretionary: number
  items: ApiBudgetItemOut[]
  timetable: ApiFoodTimetableOut[]
}

export type ApiNote = {
  id: string
  title: string
  emoji: string
  class_name: string
  type: string
  body: string
  reviewed: boolean
}

export type NewNote = {
  title: string
  emoji: string
  class_name: string
  type: string
  body?: string
}

export type ApiDocument = {
  id: string
  name: string
  kind: string
  size_bytes: number
  tag: string
  uploaded_at: string
}

export type ApiAlert = {
  id: string
  title: string
  detail: string
  kind: 'task' | 'finance' | 'note' | 'system'
  read: boolean
  time: string
}

export type ApiSearchHit = {
  type: string
  id: string
  title: string
  subtitle: string
  group: 'Pages' | 'Tasks' | 'Events' | 'Notes' | 'Files'
  to: string
}

export type ApiRule = {
  id: string
  trigger: string
  trigger_kind: string | null
  action: string
  active: boolean
  runs: number
}

export type NewRule = {
  trigger: string
  trigger_kind: 'task_completed' | 'expense_added' | 'study_session'
  action: string
  active?: boolean
}

export type ApiActivity = {
  id: string
  title: string
  time: string
}
