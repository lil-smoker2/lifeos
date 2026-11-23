from datetime import UTC, date, datetime, timedelta
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import (
    Activity,
    Alert,
    AutomationRule,
    Course,
    Document,
    Event,
    Goal,
    HealthLog,
    Note,
    Reminder,
    Task,
    Transaction,
    User,
)

settings = get_settings()

SEED_TASKS = [
    {"title": "Review project proposal", "category": "Work", "priority": "High", "due_time": "09:00", "done": True},
    {"title": "Complete mathematics exercises", "category": "Study", "priority": "Medium", "due_time": "11:30", "done": False},
    {"title": "Team project meeting", "category": "Meeting", "priority": "High", "due_time": "14:00", "done": False},
    {"title": "Evening workout", "category": "Health", "priority": "Low", "due_time": "18:30", "done": False},
    {"title": "Read 30 pages of Deep Work", "category": "Study", "priority": "Medium", "due_time": "20:00", "done": False},
    {"title": "Pay internet bill", "category": "Finance", "priority": "High", "due_time": "08:00", "done": True},
]

SEED_EVENTS = [
    {"title": "Data Structures lecture", "place": "Room 204 · Prof. Smith", "starts_at": datetime(2026, 11, 19, 10, 30), "tone": "blue"},
    {"title": "Focus session", "place": "Library · 90 minutes", "starts_at": datetime(2026, 11, 19, 12, 30), "tone": "violet"},
    {"title": "Student council", "place": "Conference room", "starts_at": datetime(2026, 11, 19, 15, 0), "tone": "orange"},
    {"title": "Gym with Sam", "place": "FitHub · 60 minutes", "starts_at": datetime(2026, 11, 20, 7, 0), "tone": "green"},
    {"title": "Calculus review", "place": "Study room 3", "starts_at": datetime(2026, 11, 18, 16, 0), "tone": "blue"},
]

SEED_TXNS = [
    {"label": "Part-time salary", "amount_minor": 120000, "type": "income", "occurred_on": date(2026, 11, 2)},
    {"label": "Rent share", "amount_minor": 38000, "type": "expense", "occurred_on": date(2026, 11, 4)},
    {"label": "Groceries", "amount_minor": 9600, "type": "expense", "occurred_on": date(2026, 11, 6)},
    {"label": "Freelance design", "amount_minor": 26000, "type": "income", "occurred_on": date(2026, 11, 9)},
    {"label": "Savings transfer", "amount_minor": 20000, "type": "savings", "occurred_on": date(2026, 11, 10)},
    {"label": "Study materials", "amount_minor": 7400, "type": "expense", "occurred_on": date(2026, 11, 13)},
    {"label": "Campus dinner", "amount_minor": 2800, "type": "expense", "occurred_on": date(2026, 11, 16)},
]

SEED_COURSES = [
    {"name": "Mathematics", "lessons_done": 9, "lessons_total": 12, "tone": "blue"},
    {"name": "Computer Science", "lessons_done": 14, "lessons_total": 18, "tone": "teal"},
    {"name": "Economics", "lessons_done": 7, "lessons_total": 10, "tone": "orange"},
    {"name": "Python", "lessons_done": 5, "lessons_total": 8, "tone": "purple"},
]

SEED_GOALS = [
    {"title": "Read 12 books", "current": 9, "target": 12, "unit": "books", "tone": "indigo"},
    {"title": "Save for a laptop", "current": 840, "target": 1200, "unit": "$", "tone": "green"},
    {"title": "Run 100 km", "current": 68, "target": 100, "unit": "km", "tone": "orange"},
]

SEED_HEALTH = {"steps": 7500, "sleep_minutes": 432, "water_ml": 1800, "diet_ok": True}

SEED_NOTES = [
    {"title": "Renaissance art timeline", "emoji": "🎨", "class_name": "ENG 455", "type": "Lecture", "reviewed": False, "body": "Early Renaissance, High Renaissance and Mannerism timeline."},
    {"title": "Big-O cheat sheet", "emoji": "🧮", "class_name": "COSC 210", "type": "Study Group", "reviewed": True, "body": "Common complexity classes and examples."},
    {"title": "Macroeconomics: inflation notes", "emoji": "📈", "class_name": "ECON 302", "type": "Reading", "reviewed": False, "body": "Demand-pull versus cost-push inflation."},
    {"title": "Python decorators explained", "emoji": "🐍", "class_name": "Python", "type": "Section", "reviewed": True, "body": "Functions that wrap other functions."},
    {"title": "Essay outline: modernism", "emoji": "✍️", "class_name": "ENG 455", "type": "Seminar", "reviewed": False, "body": "Thesis, three supporting arguments, counterpoint."},
]

SEED_DOCUMENTS = [
    {"name": "Thesis draft v2.txt", "kind": "TXT", "tag": "Thesis", "content": "LifeOS thesis draft v2\n\nChapter 1: Introduction\nChapter 2: Background\n"},
    {"name": "Calculus notes.txt", "kind": "TXT", "tag": "Study", "content": "Derivatives\nIntegrals\nSeries and sequences\n"},
    {"name": "Budget 2026.csv", "kind": "CSV", "tag": "Finance", "content": "month,income,expenses,savings\nJanuary,1200,480,200\nFebruary,1200,520,200\n"},
    {"name": "Campus map.txt", "kind": "TXT", "tag": "Personal", "content": "Library: block A\nStudent union: block C\nSports hall: block E\n"},
]

SEED_RULES = [
    {"trigger": "Task completed", "trigger_kind": "task_completed", "action": "Log an activity entry", "active": True, "runs": 12},
    {"trigger": "New expense added", "trigger_kind": "expense_added", "action": "Update monthly budget", "active": True, "runs": 7},
    {"trigger": "Study session ended", "trigger_kind": "study_session", "action": "Add 30 min to learning goal", "active": False, "runs": 3},
]

SEED_ACTIVITY = [
    {"title": "Completed “Review project proposal”", "offset_minutes": 120},
    {"title": "Added a note to COSC 210", "offset_minutes": 300},
    {"title": "Logged 7,500 steps", "offset_minutes": 60 * 24},
    {"title": "Paid internet bill", "offset_minutes": 60 * 26},
]

SEED_ALERTS = [
    {"title": "3 tasks are due before 18:00", "detail": "Mathematics exercises and 2 more", "kind": "task", "read": False, "offset_minutes": 12},
    {"title": "Internet bill due Nov 20", "detail": "Budgeted at $45 from Finance", "kind": "finance", "read": False, "offset_minutes": 120},
    {"title": "5 notes awaiting review", "detail": "Including Renaissance art timeline", "kind": "note", "read": False, "offset_minutes": 60 * 24},
    {"title": "Automation rule paused", "detail": "“Study session ended” is inactive", "kind": "system", "read": True, "offset_minutes": 60 * 26},
]

SEED_REMINDERS = [
    {"title": "Submit research summary", "badge": "red", "done": False},
    {"title": "Call the registrar", "badge": "purple", "done": False},
    {"title": "Renew library books", "badge": "gold", "done": False},
]


def _write_seed_document(user: User, index: int, doc: dict) -> Document:
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(doc["name"]).suffix
    stored_name = f"seed-{user.id[:8]}-{index}{suffix}"
    payload = doc["content"].encode("utf-8")
    (upload_dir / stored_name).write_bytes(payload)
    return Document(
        user_id=user.id,
        name=doc["name"],
        kind=doc["kind"],
        size_bytes=len(payload),
        tag=doc["tag"],
        stored_name=stored_name,
    )


def ensure_user_seed(db: Session, user: User) -> None:
    if user.seed_version >= 3:
        return

    if user.seed_version < 1:
        for item in SEED_TASKS:
            db.add(Task(user_id=user.id, **item))
        for item in SEED_EVENTS:
            db.add(Event(user_id=user.id, **item))
        user.seed_version = 1

    if user.seed_version < 2:
        for item in SEED_TXNS:
            db.add(Transaction(user_id=user.id, **item))
        for item in SEED_COURSES:
            db.add(Course(user_id=user.id, **item))
        for item in SEED_GOALS:
            db.add(Goal(user_id=user.id, **item))
        db.add(HealthLog(user_id=user.id, log_date=date.today(), **SEED_HEALTH))
        user.seed_version = 2

    if user.seed_version < 3:
        for item in SEED_NOTES:
            db.add(Note(user_id=user.id, **item))
        for index, doc in enumerate(SEED_DOCUMENTS):
            db.add(_write_seed_document(user, index, doc))
        for item in SEED_RULES:
            db.add(AutomationRule(user_id=user.id, **item))
        now = datetime.now(UTC)
        for item in SEED_ACTIVITY:
            db.add(
                Activity(
                    user_id=user.id,
                    title=item["title"],
                    occurred_at=now - timedelta(minutes=item["offset_minutes"]),
                )
            )
        for item in SEED_ALERTS:
            db.add(
                Alert(
                    user_id=user.id,
                    title=item["title"],
                    detail=item["detail"],
                    kind=item["kind"],
                    read=item["read"],
                    created_at=now - timedelta(minutes=item["offset_minutes"]),
                )
            )
        for item in SEED_REMINDERS:
            db.add(Reminder(user_id=user.id, **item))
        user.seed_version = 3

    user.seeded = True
    db.commit()
