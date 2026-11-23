from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Note, User
from app.services.seed import ensure_user_seed

router = APIRouter(prefix="/notes", tags=["notes"])


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    emoji: str = "📝"
    class_name: str = ""
    type: str = "Lecture"
    body: str = ""
    reviewed: bool = False


class NoteUpdate(BaseModel):
    title: str | None = None
    emoji: str | None = None
    class_name: str | None = None
    type: str | None = None
    body: str | None = None
    reviewed: bool | None = None


class NoteOut(BaseModel):
    id: str
    title: str
    emoji: str
    class_name: str
    type: str
    body: str
    reviewed: bool


def note_or_404(db, user, note_id):
    note = db.scalar(select(Note).where(Note.id == note_id, Note.user_id == user.id))
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.get("", response_model=list[NoteOut])
def list_notes(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_user_seed(db, user)
    rows = db.scalars(
        select(Note)
        .where(Note.user_id == user.id)
        .order_by(Note.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    return list(rows)


@router.post("", response_model=NoteOut, status_code=201)
def create_note(payload: NoteCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = Note(user_id=user.id, **payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.patch("/{note_id}", response_model=NoteOut)
def update_note(note_id: str, payload: NoteUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = note_or_404(db, user, note_id)
    for k, v in payload.model_dump(exclude_unset=True).items():
        if v is not None:
            setattr(note, k if k != "class_name" else "class_name", v)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = note_or_404(db, user, note_id)
    db.delete(note)
    db.commit()
