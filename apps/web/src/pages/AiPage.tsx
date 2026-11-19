import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { Bot, Send, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import {
  STORE_KEYS, balanceOf, goalPercent, learningPercent, money, seedCourses,
  seedGoals, seedHealth, seedNotes, seedTxns, type Course, type Goal,
  type HealthLog, type Note, type Txn,
} from '../lib/seed'
import { useTasks } from '../features/tasks/useTasks'
import { useLocalStore, uid } from '../lib/useLocalStore'

type Message = { id: string; role: 'user' | 'assistant'; text: string }

const suggestions = [
  'What is due today?',
  'How is my study progress?',
  'Summarise my finances',
  'Am I on track with goals?',
]

export function AiPage() {
  const location = useLocation()
  const initialPrompt = (location.state as { prompt?: string } | null)?.prompt
  const { tasks } = useTasks()
  const [courses] = useLocalStore<Course[]>(STORE_KEYS.courses, seedCourses)
  const [goals] = useLocalStore<Goal[]>(STORE_KEYS.goals, seedGoals)
  const [txns] = useLocalStore<Txn[]>(STORE_KEYS.txns, seedTxns)
  const [health] = useLocalStore<HealthLog>(STORE_KEYS.health, seedHealth)
  const [notes] = useLocalStore<Note[]>(STORE_KEYS.notes, seedNotes)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const started = useRef(false)

  const answer = useCallback((question: string) => {
    const text = question.toLowerCase()
    const open = tasks.filter(task => !task.done)

    if (text.includes('task') || text.includes('due') || text.includes('today')) {
      if (!open.length) return 'You are all caught up — no open tasks.'
      return `You have ${open.length} open tasks. Next: ${open.slice(0, 3).map(task => `${task.title} at ${task.due}`).join('; ')}.`
    }
    if (text.includes('study') || text.includes('course') || text.includes('learn')) {
      const overall = learningPercent(courses)
      const next = courses.find(course => course.done < course.total)
      return `Overall learning progress is ${overall}%. ${next ? `Pick up ${next.name} — ${next.total - next.done} lessons left.` : 'Every course is complete.'}`
    }
    if (text.includes('money') || text.includes('financ') || text.includes('budget') || text.includes('spend')) {
      return `Available balance is ${money(balanceOf(txns), false)}. Saving ${money(200, false)} this month keeps your laptop goal on track.`
    }
    if (text.includes('goal')) {
      return goals.map(goal => `${goal.title}: ${goalPercent(goal)}%`).join(' · ')
    }
    if (text.includes('health') || text.includes('step') || text.includes('sleep')) {
      return `Today: ${health.steps.toLocaleString()} steps, ${health.sleep}h sleep, ${health.water}L water. Diet is ${health.diet ? 'on plan' : 'off plan'}.`
    }
    if (text.includes('note')) {
      return `Your knowledge base holds ${notes.length} notes, ${notes.filter(note => !note.reviewed).length} awaiting review.`
    }
    return `Here is your snapshot: ${open.length} open tasks, ${learningPercent(courses)}% learning progress, balance ${money(balanceOf(txns), false)}, and ${notes.length} notes saved.`
  }, [tasks, courses, goals, txns, health, notes])

  const send = useCallback((question: string) => {
    const clean = question.trim()
    if (!clean) return
    setMessages(current => [
      ...current,
      { id: uid(), role: 'user', text: clean },
      { id: uid(), role: 'assistant', text: answer(clean) },
    ])
    setDraft('')
  }, [answer])

  useEffect(() => {
    if (initialPrompt && !started.current) {
      started.current = true
      send(initialPrompt)
    }
  }, [initialPrompt, send])

  function submit(event: FormEvent) {
    event.preventDefault()
    send(draft)
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="AI assistant"
        title="Ask LifeOS"
        description="A rule-based assistant that reads your live tasks, courses, finances, goals and health log."
      />

      <section className="ai-room">
        <div className="chat-log" aria-live="polite">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <span className="ai-orb big"><Bot size={30} /></span>
              <h2>How can I help today?</h2>
              <p>Try one of these prompts to get a quick read on your day.</p>
              <div className="suggestions">
                {suggestions.map(prompt => (
                  <button key={prompt} type="button" onClick={() => send(prompt)}><Sparkles size={14} /> {prompt}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(message => (
              <div className={`bubble-row ${message.role}`} key={message.id}>
                {message.role === 'assistant' ? <span className="bubble-avatar"><Bot size={15} /></span> : null}
                <p className="bubble">{message.text}</p>
              </div>
            ))
          )}
        </div>

        <form className="chat-form" onSubmit={submit}>
          <input
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="Ask about tasks, study, money, goals..."
            aria-label="Message the assistant"
          />
          <button className="btn btn-primary" type="submit"><Send size={16} /> Send</button>
        </form>
      </section>
    </div>
  )
}
