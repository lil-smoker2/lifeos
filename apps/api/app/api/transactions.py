from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Transaction, User
from app.schemas.modules import TxnCreate, TxnOut
from app.services.automation import fire_trigger
from app.services.seed import ensure_user_seed
from app.services.summary import finance_summary as finance_totals

router = APIRouter(prefix="/transactions", tags=["finance"])


def txn_out(row: Transaction) -> TxnOut:
    return TxnOut(
        id=row.id,
        label=row.label,
        amount=row.amount_minor / 100,
        currency=row.currency,
        type=row.type,
        date=row.occurred_on.isoformat(),
    )


@router.get("/summary")
def finance_summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ensure_user_seed(db, user)
    rows = db.scalars(select(Transaction).where(Transaction.user_id == user.id)).all()
    return finance_totals(rows)


@router.get("", response_model=list[TxnOut])
def list_transactions(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[TxnOut]:
    ensure_user_seed(db, user)
    rows = db.scalars(
        select(Transaction)
        .where(Transaction.user_id == user.id)
        .order_by(Transaction.occurred_on.desc())
    ).all()
    return [txn_out(row) for row in rows]


@router.post("", response_model=TxnOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TxnCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TxnOut:
    row = Transaction(
        user_id=user.id,
        label=payload.label.strip(),
        amount_minor=round(payload.amount * 100),
        currency=payload.currency,
        type=payload.type,
        occurred_on=payload.date or date.today(),
    )
    db.add(row)
    db.flush()
    if row.type == "expense":
        fire_trigger(db, user, "expense_added", f"{row.label} {row.amount_minor / 100:.2f}")
    db.commit()
    db.refresh(row)
    return txn_out(row)


@router.delete("/{txn_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    txn_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    row = db.scalar(select(Transaction).where(Transaction.id == txn_id, Transaction.user_id == user.id))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    db.delete(row)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
