from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Activity, AutomationRule, User
from app.services.format import relative_time
from app.services.seed import ensure_user_seed

TRIGGER_KIND = Literal["task_completed", "expense_added", "study_session"]

router = APIRouter(prefix="/automation", tags=["automation"])


class RuleCreate(BaseModel):
    trigger: str = Field(min_length=1, max_length=255)
    trigger_kind: TRIGGER_KIND
    action: str = Field(min_length=1, max_length=255)
    active: bool = True


class RuleUpdate(BaseModel):
    trigger: str | None = Field(default=None, min_length=1, max_length=255)
    trigger_kind: TRIGGER_KIND | None = None
    action: str | None = Field(default=None, min_length=1, max_length=255)
    active: bool | None = None


class RuleOut(BaseModel):
    id: str
    trigger: str
    trigger_kind: str | None
    action: str
    active: bool
    runs: int

    model_config = ConfigDict(from_attributes=True)


class ActivityOut(BaseModel):
    id: str
    title: str
    time: str


def rule_or_404(db: Session, user: User, rule_id: str) -> AutomationRule:
    row = db.scalar(
        select(AutomationRule).where(AutomationRule.id == rule_id, AutomationRule.user_id == user.id)
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    return row


def log_run(db: Session, user: User, rule: AutomationRule, prefix: str = "") -> None:
    rule.runs += 1
    title = f"{prefix}{rule.trigger} → {rule.action}"
    db.add(Activity(user_id=user.id, title=title))


@router.get("/rules", response_model=list[RuleOut])
def list_rules(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ensure_user_seed(db, user)
    return list(db.scalars(select(AutomationRule).where(AutomationRule.user_id == user.id)).all())


@router.post("/rules", response_model=RuleOut, status_code=status.HTTP_201_CREATED)
def create_rule(
    payload: RuleCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AutomationRule:
    row = AutomationRule(
        user_id=user.id,
        trigger=payload.trigger.strip(),
        trigger_kind=payload.trigger_kind,
        action=payload.action.strip(),
        active=payload.active,
        runs=0,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.patch("/rules/{rule_id}", response_model=RuleOut)
def update_rule(
    rule_id: str,
    payload: RuleUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AutomationRule:
    row = rule_or_404(db, user, rule_id)
    changes = {key: value for key, value in payload.model_dump(exclude_unset=True).items() if value is not None}
    for key, value in changes.items():
        setattr(row, key, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rule(
    rule_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    row = rule_or_404(db, user, rule_id)
    db.delete(row)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/rules/{rule_id}/run", response_model=ActivityOut)
def run_rule(
    rule_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ActivityOut:
    rule = rule_or_404(db, user, rule_id)
    log_run(db, user, rule, prefix="Ran ")
    db.commit()
    activity = db.scalar(
        select(Activity).where(Activity.user_id == user.id).order_by(Activity.occurred_at.desc())
    )
    return ActivityOut(id=activity.id, title=activity.title, time=relative_time(activity.occurred_at))


@router.get("/activity", response_model=list[ActivityOut])
def list_activity(
    limit: int = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ActivityOut]:
    ensure_user_seed(db, user)
    rows = db.scalars(
        select(Activity)
        .where(Activity.user_id == user.id)
        .order_by(Activity.occurred_at.desc())
        .limit(max(1, min(limit, 100)))
    ).all()
    return [ActivityOut(id=row.id, title=row.title, time=relative_time(row.occurred_at)) for row in rows]
