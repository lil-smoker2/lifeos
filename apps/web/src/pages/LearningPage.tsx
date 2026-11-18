import { GraduationCap, Minus, Plus } from 'lucide-react'
import { DonutRing } from '../components/DonutRing'
import { PageHeader } from '../components/PageHeader'
import { STORE_KEYS, learningPercent, seedCourses, type Course } from '../lib/seed'
import { useLocalStore } from '../lib/useLocalStore'

export function LearningPage() {
  const [courses, setCourses] = useLocalStore<Course[]>(STORE_KEYS.courses, seedCourses)
  const overall = learningPercent(courses)
  const totalDone = courses.reduce((sum, course) => sum + course.done, 0)
  const totalLessons = courses.reduce((sum, course) => sum + course.total, 0)

  function adjust(id: string, delta: number) {
    setCourses(current => current.map(course => {
      if (course.id !== id) return course
      return { ...course, done: Math.min(course.total, Math.max(0, course.done + delta)) }
    }))
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Study & learning"
        title="Keep the streak alive"
        description="Track lessons per course. Progress updates the dashboard donut instantly."
      >
        <div className="kpi-row">
          <span className="kpi"><strong>{overall}%</strong> overall</span>
          <span className="kpi"><strong>{totalDone}/{totalLessons}</strong> lessons</span>
        </div>
      </PageHeader>

      <section className="card split-card">
        <DonutRing percent={overall} color="var(--green)" label={`${courses.length} active courses`} size={148} />
        <div className="course-list">
          {courses.map(course => {
            const percent = Math.round((course.done / course.total) * 100)
            return (
              <div className="course-row" key={course.id}>
                <div className="course-copy">
                  <strong>{course.name}</strong>
                  <span>{course.done} of {course.total} lessons · {percent}%</span>
                </div>
                <div className={`track ${course.tone}`}><i style={{ width: `${percent}%` }} /></div>
                <div className="stepper">
                  <button type="button" aria-label={`Remove a ${course.name} lesson`} onClick={() => adjust(course.id, -1)}><Minus size={14} /></button>
                  <button type="button" aria-label={`Complete a ${course.name} lesson`} onClick={() => adjust(course.id, 1)}><Plus size={14} /></button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="info-grid">
        <article className="card mini">
          <span className="mini-icon grad-blue"><GraduationCap size={18} /></span>
          <div><strong>Focus suggestion</strong><p>Finish the next COSC lesson before the 14:00 project meeting.</p></div>
        </article>
        <article className="card mini">
          <span className="mini-icon grad-orange"><GraduationCap size={18} /></span>
          <div><strong>Weekly goal</strong><p>18h 20m studied. 1h 40m left to hit this week's target.</p></div>
        </article>
      </section>
    </div>
  )
}
