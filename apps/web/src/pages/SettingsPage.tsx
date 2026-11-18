import { useState, type FormEvent } from 'react'
import { Check, Moon, RotateCcw, Sun } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useTheme } from '../features/theme/ThemeProvider'
import { STORE_KEYS, seedProfile, type Profile } from '../lib/seed'
import { useLocalStore } from '../lib/useLocalStore'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useLocalStore<Profile>(STORE_KEYS.profile, seedProfile)
  const [draft, setDraft] = useState(profile)
  const [saved, setSaved] = useState(false)

  function save(event: FormEvent) {
    event.preventDefault()
    const cleanName = draft.name.trim() || seedProfile.name
    setProfile({ ...draft, name: cleanName })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  function resetData() {
    Object.values(STORE_KEYS).forEach(key => localStorage.removeItem(key))
    window.location.reload()
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Settings"
        title="Make LifeOS yours"
        description="Profile, appearance and local data controls."
      />

      <div className="planner-grid">
        <section className="card">
          <header className="card-head"><h2>Profile</h2><p>Shown in the top bar and greetings</p></header>
          <form className="stack-form" onSubmit={save}>
            <label className="field"><span>Full name</span>
              <input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} required />
            </label>
            <label className="field"><span>Role</span>
              <input value={draft.role} onChange={event => setDraft({ ...draft, role: event.target.value })} />
            </label>
            <label className="field"><span>Default AI prompt</span>
              <input value={draft.focus} onChange={event => setDraft({ ...draft, focus: event.target.value })} />
            </label>
            <button className="btn btn-primary" type="submit">{saved ? <><Check size={16} /> Saved</> : 'Save profile'}</button>
          </form>
        </section>

        <div className="settings-side">
          <section className="card">
            <header className="card-head"><h2>Appearance</h2><p>Saved on this device</p></header>
            <div className="theme-choice">
              <button type="button" className={`theme-option ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} aria-pressed={theme === 'light'}>
                <span className="theme-preview light"><Sun size={16} /></span>
                <strong>Light</strong>
                <small>Lavender canvas, white cards</small>
              </button>
              <button type="button" className={`theme-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} aria-pressed={theme === 'dark'}>
                <span className="theme-preview dark"><Moon size={16} /></span>
                <strong>Dark</strong>
                <small>Navy canvas, glowing cards</small>
              </button>
            </div>
          </section>

          <section className="card">
            <header className="card-head"><h2>Local data</h2><p>Everything lives in your browser</p></header>
            <p className="note">Tasks, events, transactions, notes and settings are stored in localStorage. Resetting restores the demo data.</p>
            <button className="btn btn-ghost danger" type="button" onClick={resetData}><RotateCcw size={15} /> Reset all data</button>
          </section>
        </div>
      </div>
    </div>
  )
}
