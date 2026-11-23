import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { Bot, Send, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { api } from '../services/api'
import { useTheme } from '../features/theme/theme-context'
import { uid } from '../lib/useLocalStore'

type Message = { id: string; role: 'user' | 'assistant'; text: string }

const suggestions = [
  'What is due today?',
  'How is my study progress?',
  'Summarise my finances',
  'Am I on track with goals?',
]

export function AiPage() {
  const location = useLocation()
  const { isDark } = useTheme()
  const initialPrompt = (location.state as { prompt?: string } | null)?.prompt
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const started = useRef(false)

  const send = useCallback((question: string) => {
    const clean = question.trim()
    if (!clean) return
    setMessages(current => [...current, { id: uid(), role: 'user', text: clean }])
    setDraft('')
    api.assistant
      .ask(clean, isDark ? 'KSH' : 'USD')
      .then(({ answer }) => {
        setMessages(current => [...current, { id: uid(), role: 'assistant', text: answer }])
      })
      .catch(cause => {
        const text = cause instanceof Error ? cause.message : 'The assistant is unavailable right now.'
        setMessages(current => [...current, { id: uid(), role: 'assistant', text }])
      })
  }, [isDark])

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
        description="A rule-based assistant backed by your live account data, with an optional provider adapter."
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
