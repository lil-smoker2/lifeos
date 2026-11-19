from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Goal, User
from app.schemas.modules import GoalCreate, GoalOut, GoalUpdate
from app.services.seed import ensure_user_seed

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=list[GoalOut])
def list_goals(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Goal]:
    ensure_user_seed(db, user)
    return list(db.scalars(select(Goal).where(Goal.user_id == user.id)).all())


@router.post("", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: GoalCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Goal:
    row = Goal(
        user_id=user.id,
        title=payload.title.strip(),
        current=0,
        target=payload.target,
        unit=payload.unit,
        tone=payload.tone,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.patch("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: str,
    payload: GoalUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Goal:
    row = db.scalar(select(Goal).where(Goal.id == goal_id, Goal.user_id == user.id))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    changes = {key: value for key, value in payload.model_dump(exclude_unset=True).items() if value is not None}
    for key, value in changes.items():
        setattr(row, key, value)
    row.current = min(row.current, row.target)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    row = db.scalar(select(Goal).where(Goal.id == goal_id, Goal.user_id == user.id))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    db.delete(row)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
