from datetime import UTC, datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Budget, BudgetItem, FoodTimetable, User
from app.services.seed import ensure_user_seed

router = APIRouter(prefix="/budget", tags=["budget"])

MIN_FOOD_PCT = 15

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

MEAL_TEMPLATES = [
    "Maize porridge & tea",
    "Rice & beans",
    "Ugali & sukuma wiki",
    "Chapati & lentils",
    "Potatoes & eggs",
    "Pasta & tomato sauce",
    "Millet porridge & milk",
]


def _major(minor: int) -> float:
    return round(minor / 100, 2)


def _minor(amount: float) -> int:
    return int(round(amount * 100))


class BudgetOut(BaseModel):
    id: str
    wallet: float
    currency: str
    food_pct: int
    rent_pct: int
    savings_pct: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WalletSet(BaseModel):
    amount: float = Field(ge=0)


class CurrencySet(BaseModel):
    currency: str = Field(pattern="^[A-Z]{3}$")


class DistributionSet(BaseModel):
    food_pct: int = Field(ge=0, le=100)
    rent_pct: int = Field(ge=0, le=100)
    savings_pct: int = Field(ge=0, le=100)


class BudgetItemOut(BaseModel):
    id: str
    name: str
    price: float
    affordable: bool

    model_config = ConfigDict(from_attributes=True)


class BudgetItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    price: float = Field(ge=0)


class FoodTimetableOut(BaseModel):
    id: str
    day_of_week: int
    day: str
    meal: str
    cost: float

    model_config = ConfigDict(from_attributes=True)


class BudgetSnapshot(BaseModel):
    wallet: float
    currency: str
    distribution: dict[str, int]
    essentials: float
    discretionary: float
    items: list[BudgetItemOut]
    timetable: list[FoodTimetableOut]


def get_or_create_budget(db: Session, user: User) -> Budget:
    row = db.scalar(select(Budget).where(Budget.user_id == user.id))
    if row is None:
        row = Budget(user_id=user.id)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def normalize_distribution(food: int, rent: int, savings: int) -> dict[str, int]:
    food = max(food, MIN_FOOD_PCT)
    total = food + rent + savings
    if total > 100:
        # Keep food at its (floored) value; scale rent & savings down to fit.
        remaining = 100 - food
        scale = remaining / max(rent + savings, 1)
        rent = max(0, int(rent * scale))
        savings = max(0, 100 - food - rent)
    return {"food": food, "rent": rent, "savings": savings}


def generate_timetable(db: Session, user: User, food_budget_minor: int) -> list[FoodTimetable]:
    db.execute(delete(FoodTimetable).where(FoodTimetable.user_id == user.id))
    per_day = food_budget_minor // len(DAYS)
    remainder = food_budget_minor % len(DAYS)
    rows: list[FoodTimetable] = []
    for index, day in enumerate(DAYS):
        cost = per_day + (1 if index < remainder else 0)
        meal = MEAL_TEMPLATES[index % len(MEAL_TEMPLATES)]
        rows.append(FoodTimetable(user_id=user.id, day_of_week=index, meal=meal, cost_minor=cost))
    db.add_all(rows)
    return rows


@router.get("", response_model=BudgetSnapshot)
def get_budget(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> BudgetSnapshot:
    ensure_user_seed(db, user)
    budget = get_or_create_budget(db, user)
    distribution = normalize_distribution(budget.food_pct, budget.rent_pct, budget.savings_pct)
    wallet = budget.wallet_amount_minor
    essentials = wallet * (distribution["food"] + distribution["rent"] + distribution["savings"]) // 100
    discretionary = wallet - essentials
    items = list(
        db.scalars(select(BudgetItem).where(BudgetItem.user_id == user.id)).all()
    )
    for item in items:
        item.affordable = item.price_minor <= discretionary
    timetable = list(
        db.scalars(
            select(FoodTimetable)
            .where(FoodTimetable.user_id == user.id)
            .order_by(FoodTimetable.day_of_week)
        ).all()
    )
    if not timetable:
        timetable = generate_timetable(db, user, int(wallet * distribution["food"] / 100))
    db.commit()
    return BudgetSnapshot(
        wallet=_major(wallet),
        currency=budget.currency,
        distribution=distribution,
        essentials=_major(essentials),
        discretionary=_major(discretionary),
        items=[BudgetItemOut.model_validate(item) for item in items],
        timetable=[FoodTimetableOut.model_validate(t) for t in timetable],
    )


@router.post("/wallet", response_model=BudgetOut)
def set_wallet(
    payload: WalletSet,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Budget:
    ensure_user_seed(db, user)
    budget = get_or_create_budget(db, user)
    budget.wallet_amount_minor = _minor(payload.amount)
    budget.updated_at = datetime.now(UTC)
    distribution = normalize_distribution(budget.food_pct, budget.rent_pct, budget.savings_pct)
    generate_timetable(db, user, int(budget.wallet_amount_minor * distribution["food"] / 100))
    db.commit()
    db.refresh(budget)
    return budget


@router.post("/currency", response_model=BudgetOut)
def set_currency(
    payload: CurrencySet,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Budget:
    ensure_user_seed(db, user)
    budget = get_or_create_budget(db, user)
    budget.currency = payload.currency
    budget.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(budget)
    return budget


@router.post("/distribution", response_model=dict[str, int])
def set_distribution(
    payload: DistributionSet,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, int]:
    ensure_user_seed(db, user)
    budget = get_or_create_budget(db, user)
    distribution = normalize_distribution(payload.food_pct, payload.rent_pct, payload.savings_pct)
    budget.food_pct = distribution["food"]
    budget.rent_pct = distribution["rent"]
    budget.savings_pct = distribution["savings"]
    budget.updated_at = datetime.now(UTC)
    generate_timetable(db, user, int(budget.wallet_amount_minor * distribution["food"] / 100))
    db.commit()
    return distribution


@router.post("/items", response_model=BudgetItemOut, status_code=status.HTTP_201_CREATED)
def add_item(
    payload: BudgetItemCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BudgetItem:
    ensure_user_seed(db, user)
    budget = get_or_create_budget(db, user)
    distribution = normalize_distribution(budget.food_pct, budget.rent_pct, budget.savings_pct)
    wallet = budget.wallet_amount_minor
    essentials = wallet * (distribution["food"] + distribution["rent"] + distribution["savings"]) // 100
    discretionary = wallet - essentials
    item = BudgetItem(
        user_id=user.id,
        name=payload.name.strip(),
        price_minor=_minor(payload.price),
        affordable=_minor(payload.price) <= discretionary,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    ensure_user_seed(db, user)
    item = db.scalar(select(BudgetItem).where(BudgetItem.id == item_id, BudgetItem.user_id == user.id))
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    db.delete(item)
    db.commit()


@router.post("/timetable/regenerate", response_model=list[FoodTimetableOut])
def regenerate_timetable(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[FoodTimetableOut]:
    ensure_user_seed(db, user)
    budget = get_or_create_budget(db, user)
    distribution = normalize_distribution(budget.food_pct, budget.rent_pct, budget.savings_pct)
    rows = generate_timetable(db, user, int(budget.wallet_amount_minor * distribution["food"] / 100))
    db.commit()
    return [FoodTimetableOut.model_validate(row) for row in rows]
