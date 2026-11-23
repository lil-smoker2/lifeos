from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Document, Event, Note, Task, User
from app.services.seed import ensure_user_seed

router = APIRouter(prefix="/search", tags=["search"])

LIMIT_PER_GROUP = 3
TOTAL_LIMIT = 12


@router.get("")
def search(
    q: str = Query(default="", max_length=120),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    term = f"%{q.strip().lower()}%"
    if not q.strip():
        return []

    ensure_user_seed(db, user)
    results: list[dict] = []

    for task in db.scalars(
        select(Task)
        .where(Task.user_id == user.id)
        .where(Task.title.ilike(term) | Task.category.ilike(term))
        .limit(LIMIT_PER_GROUP)
    ).all():
        results.append(
            {
                "type": "task",
                "id": task.id,
                "title": task.title,
                "subtitle": f"{task.priority} priority · {task.category} · {task.due_time}",
                "group": "Tasks",
                "to": "/tasks",
            }
        )

    for event in db.scalars(
        select(Event)
        .where(Event.user_id == user.id)
        .where(Event.title.ilike(term) | Event.place.ilike(term))
        .limit(LIMIT_PER_GROUP)
    ).all():
        results.append(
            {
                "type": "event",
                "id": event.id,
                "title": event.title,
                "subtitle": f"{event.starts_at:%b %d · %H:%M} · {event.place}",
                "group": "Events",
                "to": "/planner",
            }
        )

    for note in db.scalars(
        select(Note)
        .where(Note.user_id == user.id)
        .where(Note.title.ilike(term) | Note.body.ilike(term) | Note.class_name.ilike(term))
        .limit(LIMIT_PER_GROUP)
    ).all():
        results.append(
            {
                "type": "note",
                "id": note.id,
                "title": f"{note.emoji} {note.title}",
                "subtitle": f"{note.class_name} · {note.type}",
                "group": "Notes",
                "to": "/notes",
            }
        )

    for doc in db.scalars(
        select(Document)
        .where(Document.user_id == user.id)
        .where(Document.name.ilike(term) | Document.tag.ilike(term))
        .limit(LIMIT_PER_GROUP)
    ).all():
        size = (
            f"{doc.size_bytes / (1024 * 1024):.1f} MB"
            if doc.size_bytes > 1024 * 1024
            else f"{max(1, round(doc.size_bytes / 1024))} KB"
        )
        results.append(
            {
                "type": "file",
                "id": doc.id,
                "title": doc.name,
                "subtitle": f"{doc.kind} · {size} · {doc.tag}",
                "group": "Files",
                "to": "/files",
            }
        )

    return results[:TOTAL_LIMIT]
