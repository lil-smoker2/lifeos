from datetime import date, datetime

from sqlalchemy.orm import Session

from app.models import Course, Event, Goal, HealthLog, Task, Transaction, User

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


def ensure_user_seed(db: Session, user: User) -> None:
    if user.seed_version >= 2:
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

    user.seeded = True
    db.commit()
