from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Alert, User
from app.services.format import relative_time
from app.services.seed import ensure_user_seed

router = APIRouter(prefix="/alerts", tags=["alerts"])


class AlertOut(BaseModel):
    id: str
    title: str
    detail: str
    kind: str
    read: bool
    time: str

    model_config = ConfigDict(from_attributes=True)


class AlertUpdate(BaseModel):
    read: bool


def alert_out(row: Alert) -> AlertOut:
    return AlertOut(
        id=row.id,
        title=row.title,
        detail=row.detail,
        kind=row.kind,
        read=row.read,
        time=relative_time(row.created_at),
    )


def alert_or_404(db: Session, user: User, alert_id: str) -> Alert:
    row = db.scalar(select(Alert).where(Alert.id == alert_id, Alert.user_id == user.id))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return row


@router.get("", response_model=list[AlertOut])
def list_alerts(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[AlertOut]:
    ensure_user_seed(db, user)
    rows = db.scalars(
        select(Alert).where(Alert.user_id == user.id).order_by(Alert.created_at.desc())
    ).all()
    return [alert_out(row) for row in rows]


@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_read(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Response:
    ensure_user_seed(db, user)
    rows = db.scalars(select(Alert).where(Alert.user_id == user.id, Alert.read.is_(False))).all()
    for row in rows:
        row.read = True
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{alert_id}", response_model=AlertOut)
def update_alert(
    alert_id: str,
    payload: AlertUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AlertOut:
    row = alert_or_404(db, user, alert_id)
    row.read = payload.read
    db.commit()
    db.refresh(row)
    return alert_out(row)


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(
    alert_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    row = alert_or_404(db, user, alert_id)
    db.delete(row)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
