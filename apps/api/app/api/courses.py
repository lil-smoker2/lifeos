from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Course, User
from app.schemas.modules import CourseOut, CourseUpdate
from app.services.seed import ensure_user_seed

router = APIRouter(prefix="/courses", tags=["learning"])


def course_out(row: Course) -> CourseOut:
    return CourseOut(
        id=row.id,
        name=row.name,
        done=row.lessons_done,
        total=row.lessons_total,
        tone=row.tone,
    )


@router.get("", response_model=list[CourseOut])
def list_courses(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[CourseOut]:
    ensure_user_seed(db, user)
    rows = db.scalars(select(Course).where(Course.user_id == user.id)).all()
    return [course_out(row) for row in rows]


@router.patch("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: str,
    payload: CourseUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CourseOut:
    row = db.scalar(select(Course).where(Course.id == course_id, Course.user_id == user.id))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    row.lessons_done = min(row.lessons_total, payload.done)
    db.commit()
    db.refresh(row)
    return course_out(row)
