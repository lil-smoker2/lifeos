from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import HealthLog, User
from app.schemas.modules import HealthOut, HealthUpdate
from app.services.seed import ensure_user_seed

router = APIRouter(prefix="/health-log", tags=["health"])


def health_out(row: HealthLog | None) -> HealthOut:
    if row is None:
        return HealthOut(steps=0, sleep=0, water=0, diet=False)
    return HealthOut(
        steps=row.steps,
        sleep=round(row.sleep_minutes / 60, 2),
        water=round(row.water_ml / 1000, 2),
        diet=row.diet_ok,
    )


@router.get("", response_model=HealthOut)
def get_health_log(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> HealthOut:
    ensure_user_seed(db, user)
    row = db.scalar(
        select(HealthLog).where(HealthLog.user_id == user.id, HealthLog.log_date == date.today())
    )
    return health_out(row)


@router.put("", response_model=HealthOut)
def save_health_log(
    payload: HealthUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HealthOut:
    ensure_user_seed(db, user)
    row = db.scalar(
        select(HealthLog).where(HealthLog.user_id == user.id, HealthLog.log_date == date.today())
    )
    if row is None:
        row = HealthLog(user_id=user.id, log_date=date.today())
        db.add(row)
    row.steps = payload.steps
    row.sleep_minutes = round(payload.sleep * 60)
    row.water_ml = round(payload.water * 1000)
    row.diet_ok = payload.diet
    db.commit()
    db.refresh(row)
    return health_out(row)
