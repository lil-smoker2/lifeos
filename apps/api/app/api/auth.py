from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_recovery_codes,
    hash_password,
    hash_recovery_code,
    verify_password,
)
from app.models import RecoveryCode, User
from app.schemas.auth import (
    LoginRequest,
    PasswordResetRequest,
    RegisterRequest,
    RegistrationResponse,
    TokenResponse,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> RegistrationResponse:
    existing = db.scalar(select(User).where(User.name == payload.name.strip()))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Name already taken")

    user = User(name=payload.name.strip(), hashed_password=hash_password(payload.password))
    db.add(user)
    recovery_codes = create_recovery_codes()
    db.flush()
    db.add_all(
        RecoveryCode(code_hash=hash_recovery_code(code), user_id=user.id)
        for code in recovery_codes
    )
    db.commit()
    db.refresh(user)
    response = token_response(user)
    return RegistrationResponse(**response.model_dump(), recovery_codes=recovery_codes)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.name == payload.name))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect name or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_response(user)


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(payload: PasswordResetRequest, db: Session = Depends(get_db)) -> None:
    user = db.scalar(select(User).where(User.name == payload.name.strip()))
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid name or recovery code")

    result = db.execute(
        delete(RecoveryCode).where(
            RecoveryCode.user_id == user.id,
            RecoveryCode.code_hash == hash_recovery_code(payload.recovery_code),
        )
    )
    if result.rowcount != 1:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or recovery code")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Response:
    from app.models import (
        Activity,
        Alert,
        AutomationRule,
        Budget,
        BudgetItem,
        Course,
        Document,
        Event,
        FoodTimetable,
        Goal,
        HealthLog,
        Note,
        RecoveryCode,
        Reminder,
        Task,
        Transaction,
    )

    for model in (
        Activity,
        Alert,
        AutomationRule,
        Budget,
        BudgetItem,
        Course,
        Document,
        Event,
        FoodTimetable,
        Goal,
        HealthLog,
        Note,
        RecoveryCode,
        Reminder,
        Task,
        Transaction,
    ):
        db.query(model).filter(model.user_id == user.id).delete(synchronize_session=False)
    db.delete(user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
