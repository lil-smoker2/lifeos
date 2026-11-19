from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Task, User
from app.schemas.planner import TaskCreate, TaskOut, TaskUpdate
from app.services.seed import ensure_user_seed

router = APIRouter(prefix="/tasks", tags=["tasks"])


def task_or_404(db: Session, user: User, task_id: str) -> Task:
    task = db.scalar(select(Task).where(Task.id == task_id, Task.user_id == user.id))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.get("", response_model=list[TaskOut])
def list_tasks(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Task]:
    ensure_user_seed(db, user)
    rows = db.scalars(
        select(Task).where(Task.user_id == user.id).order_by(Task.created_at.desc())
    ).all()
    return list(rows)


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Task:
    task = Task(
        user_id=user.id,
        title=payload.title.strip(),
        category=payload.category,
        priority=payload.priority,
        due_time=payload.due,
        done=payload.done,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Task:
    task = task_or_404(db, user, task_id)
    changes = {key: value for key, value in payload.model_dump(exclude_unset=True).items() if value is not None}
    if "due" in changes:
        changes["due_time"] = changes.pop("due")
    for key, value in changes.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    task = task_or_404(db, user, task_id)
    db.delete(task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
