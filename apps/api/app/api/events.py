from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Event, User
from app.schemas.planner import EventCreate, EventOut, EventUpdate
from app.services.seed import ensure_user_seed

router = APIRouter(prefix="/events", tags=["events"])


def event_or_404(db: Session, user: User, event_id: str) -> Event:
    event = db.scalar(select(Event).where(Event.id == event_id, Event.user_id == user.id))
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


@router.get("", response_model=list[EventOut])
def list_events(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Event]:
    ensure_user_seed(db, user)
    rows = db.scalars(
        select(Event).where(Event.user_id == user.id).order_by(Event.starts_at.asc())
    ).all()
    return list(rows)


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Event:
    event = Event(
        user_id=user.id,
        title=payload.title.strip(),
        place=payload.place.strip(),
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        tone=payload.tone,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/{event_id}", response_model=EventOut)
def update_event(
    event_id: str,
    payload: EventUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Event:
    event = event_or_404(db, user, event_id)
    changes = {key: value for key, value in payload.model_dump(exclude_unset=True).items() if value is not None}
    for key, value in changes.items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    event = event_or_404(db, user, event_id)
    db.delete(event)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
