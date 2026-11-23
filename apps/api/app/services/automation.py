from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Activity, AutomationRule, User

TRIGGER_KINDS = {"task_completed", "expense_added", "study_session"}


def fire_trigger(db: Session, user: User, key: str, detail: str = "") -> list[AutomationRule]:
    if key not in TRIGGER_KINDS:
        return []

    rules = db.scalars(
        select(AutomationRule).where(
            AutomationRule.user_id == user.id,
            AutomationRule.active.is_(True),
            AutomationRule.trigger_kind == key,
        )
    ).all()

    fired: list[AutomationRule] = []
    for rule in rules:
        rule.runs += 1
        suffix = f" · {detail}" if detail else ""
        db.add(
            Activity(
                user_id=user.id,
                title=f"{rule.trigger} → {rule.action}{suffix}",
            )
        )
        fired.append(rule)
    return fired
