from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Course, Goal, HealthLog, Note, Task, Transaction, User

settings = get_settings()

KSH_PER_USD = 10


def _money(value: float, currency: str = "USD") -> str:
    amount = value * KSH_PER_USD if currency.upper() == "KSH" else value
    symbol = "KSh" if currency.upper() == "KSH" else "$"
    return f"{symbol}{amount:,.0f}"


def build_snapshot(db: Session, user: User) -> dict:
    tasks = list(db.scalars(select(Task).where(Task.user_id == user.id)).all())
    courses = list(db.scalars(select(Course).where(Course.user_id == user.id)).all())
    goals = list(db.scalars(select(Goal).where(Goal.user_id == user.id)).all())
    txns = list(db.scalars(select(Transaction).where(Transaction.user_id == user.id)).all())
    health = db.scalar(select(HealthLog).where(HealthLog.user_id == user.id).order_by(HealthLog.log_date.desc()))
    notes = list(db.scalars(select(Note).where(Note.user_id == user.id)).all())

    open_tasks = [task for task in tasks if not task.done]
    lessons_done = sum(course.lessons_done for course in courses)
    lessons_total = sum(course.lessons_total for course in courses)
    learning = round((lessons_done / lessons_total) * 100) if lessons_total else 0

    income = sum(row.amount_minor for row in txns if row.type == "income") / 100
    expenses = sum(row.amount_minor for row in txns if row.type == "expense") / 100
    savings = sum(row.amount_minor for row in txns if row.type == "savings") / 100
    balance = income - expenses

    return {
        "tasks": tasks,
        "open_tasks": open_tasks,
        "courses": courses,
        "goals": goals,
        "health": health,
        "notes": notes,
        "learning": learning,
        "lessons_done": lessons_done,
        "lessons_total": lessons_total,
        "income": income,
        "expenses": expenses,
        "savings": savings,
        "balance": balance,
    }


def rule_based_answer(prompt: str, snapshot: dict, currency: str = "USD") -> str:
    text = prompt.lower()
    open_tasks = snapshot["open_tasks"]

    if any(word in text for word in ("task", "due", "today")):
        if not open_tasks:
            return "You are all caught up — no open tasks."
        listing = "; ".join(f"{task.title} at {task.due_time}" for task in open_tasks[:3])
        return f"You have {len(open_tasks)} open tasks. Next: {listing}."

    if any(word in text for word in ("study", "course", "learn")):
        next_course = next((course for course in snapshot["courses"] if course.lessons_done < course.lessons_total), None)
        if next_course is None:
            return f"Overall learning progress is {snapshot['learning']}%. Every course is complete."
        remaining = next_course.lessons_total - next_course.lessons_done
        return f"Overall learning progress is {snapshot['learning']}%. Pick up {next_course.name} — {remaining} lessons left."

    if any(word in text for word in ("money", "financ", "budget", "spend")):
        return (
            f"Available balance is {_money(snapshot['balance'], currency)}. "
            f"Income {_money(snapshot['income'], currency)}, expenses {_money(snapshot['expenses'], currency)} and "
            f"savings {_money(snapshot['savings'], currency)} this period."
        )

    if "goal" in text:
        if not snapshot["goals"]:
            return "You have no goals yet — add one from Goals & habits."
        parts = [
            f"{goal.title}: {min(100, round((goal.current / goal.target) * 100))}%"
            for goal in snapshot["goals"]
        ]
        return " · ".join(parts)

    if any(word in text for word in ("health", "step", "sleep", "water")):
        health = snapshot["health"]
        if health is None:
            return "No health log for today yet."
        return (
            f"Today: {health.steps:,} steps, {round(health.sleep_minutes / 60, 1)}h sleep, "
            f"{round(health.water_ml / 1000, 2)}L water. Diet is {'on plan' if health.diet_ok else 'off plan'}."
        )

    if "note" in text:
        reviewed = sum(1 for note in snapshot["notes"] if note.reviewed)
        return f"Your knowledge base holds {len(snapshot['notes'])} notes, {len(snapshot['notes']) - reviewed} awaiting review."

    return (
        f"Here is your snapshot: {len(open_tasks)} open tasks, {snapshot['learning']}% learning progress, "
        f"balance {_money(snapshot['balance'], currency)}, and {len(snapshot['notes'])} notes saved."
    )


def provider_answer(prompt: str, snapshot: dict, currency: str = "USD") -> str | None:
    if settings.ai_provider == "rules" or not settings.ai_api_key:
        return None

    import httpx

    open_tasks = ", ".join(task.title for task in snapshot["open_tasks"][:5]) or "none"
    context = (
        f"Open tasks: {open_tasks}. Learning progress: {snapshot['learning']}%. "
        f"Balance: {_money(snapshot['balance'], currency)}. Notes: {len(snapshot['notes'])}."
    )
    try:
        response = httpx.post(
            f"{settings.ai_base_url.rstrip('/')}/chat/completions",
            headers={"Authorization": f"Bearer {settings.ai_api_key}"},
            json={
                "model": settings.ai_model,
                "messages": [
                    {"role": "system", "content": f"You are the LifeOS personal assistant. Use this context: {context}"},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3,
            },
            timeout=20,
        )
        response.raise_for_status()
        choices = response.json().get("choices") or []
        if choices:
            return choices[0]["message"]["content"].strip()
    except Exception:
        return None
    return None


def answer_prompt(db: Session, user: User, prompt: str, currency: str = "USD") -> str:
    snapshot = build_snapshot(db, user)
    return provider_answer(prompt, snapshot, currency) or rule_based_answer(prompt, snapshot, currency)
