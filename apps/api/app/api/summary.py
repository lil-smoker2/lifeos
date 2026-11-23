from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Course, Goal, HealthLog, Transaction, User
from app.services.seed import ensure_user_seed
from app.services.summary import finance_summary, goals_summary, learning_summary

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("")
def all_summaries(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    ensure_user_seed(db, user)

    txns = db.scalars(select(Transaction).where(Transaction.user_id == user.id)).all()
    courses = db.scalars(select(Course).where(Course.user_id == user.id)).all()
    goals = db.scalars(select(Goal).where(Goal.user_id == user.id)).all()
    health = db.scalar(
        select(HealthLog)
        .where(HealthLog.user_id == user.id)
        .order_by(HealthLog.log_date.desc())
        .limit(1)
    )

    return {
        "finance": finance_summary(txns),
        "learning": learning_summary(courses),
        "goals": goals_summary(goals),
        "health": {
            "steps": health.steps if health else 0,
            "sleep": round(health.sleep_minutes / 60, 2) if health else 0,
            "water": round(health.water_ml / 1000, 2) if health else 0,
            "diet": health.diet_ok if health else False,
        },
    }
