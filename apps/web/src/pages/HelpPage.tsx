import { Keyboard, LifeBuoy, Mail, MessageSquare } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

const faqs = [
  { q: 'Where is my data stored?', a: 'Everything is stored locally in your browser. There is no account or server sync yet, so clearing site data resets the app.' },
  { q: 'How do I switch themes?', a: 'Use the toggle at the bottom of the sidebar, or open Settings → Appearance. Your choice persists across reloads.' },
  { q: 'Why do amounts change between themes?', a: 'Light mode displays USD while dark mode displays KSh, matching the two dashboard concepts. Values are converted at a fixed display rate.' },
  { q: 'How does the AI assistant work?', a: 'The assistant is rule-based right now: it reads your live tasks, courses, finances, goals and health log to answer prompts.' },
  { q: 'Can I undo a reset?', a: 'No — resetting deletes local data. Export anything important before resetting from Settings.' },
]

export function HelpPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Help & support"
        title="Need a hand?"
        description="Short answers, keyboard shortcuts and ways to reach out."
      />

      <div className="planner-grid">
        <section className="card">
          <header className="card-head"><h2>Frequently asked</h2></header>
          <div className="faq-list">
            {faqs.map(item => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="settings-side">
          <section className="card">
            <header className="card-head"><h2>Keyboard shortcuts</h2><Keyboard size={17} aria-hidden="true" /></header>
            <ul className="shortcut-list">
              <li><span>Search</span><kbd>⌘ / Ctrl</kbd><kbd>K</kbd></li>
              <li><span>Close search</span><kbd>Esc</kbd></li>
              <li><span>Go home</span><kbd>G</kbd><kbd>H</kbd></li>
            </ul>
          </section>

          <section className="card">
            <header className="card-head"><h2>Contact</h2><LifeBuoy size={17} aria-hidden="true" /></header>
            <div className="contact-list">
              <a href="mailto:support@lifeos.app"><Mail size={15} /> support@lifeos.app</a>
              <a href="https://github.com/Kilo-Org/kilocode/issues" target="_blank" rel="noreferrer"><MessageSquare size={15} /> Report an issue</a>
            </div>
            <p className="note">LifeOS is an early build. Feedback shapes the next module slice.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
