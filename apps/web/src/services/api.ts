export type AuthUser = {
  id: string
  email: string
  name: string
  role: string
}

export type AuthResponse = {
  access_token: string
  token_type: string
  user: AuthUser
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`/api${path}`, { ...init, headers })
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
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
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
    get: () => request<ApiHealth>('/healthlog'),
    update: (input: ApiHealth) =>
      request<ApiHealth>('/healthlog', { method: 'PUT', body: JSON.stringify(input) }),
  },
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
  type: string
  date: string
}

export type NewTxn = {
  label: string
  amount: number
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