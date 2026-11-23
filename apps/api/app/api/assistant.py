from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.services.assistant import answer_prompt
from app.services.seed import ensure_user_seed

router = APIRouter(prefix="/assistant", tags=["assistant"])


class Ask(BaseModel):
    prompt: str = Field(min_length=1, max_length=2000)
    currency: Literal["USD", "KSH"] = "USD"


@router.post("")
def ask(
    payload: Ask,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    ensure_user_seed(db, user)
    return {"answer": answer_prompt(db, user, payload.prompt.strip(), payload.currency)}
