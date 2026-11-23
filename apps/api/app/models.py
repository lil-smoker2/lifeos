from datetime import UTC, date, datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def new_id() -> str:
    return uuid4().hex


def utcnow() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    role: Mapped[str] = mapped_column(String(120), default="Student")
    hashed_password: Mapped[str] = mapped_column(String(255), default="")
    seeded: Mapped[bool] = mapped_column(Boolean, default=False)
    seed_version: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class RecoveryCode(Base):
    __tablename__ = "recovery_codes"

    code_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(64), default="Personal")
    priority: Mapped[str] = mapped_column(String(16), default="Medium")
    due_time: Mapped[str] = mapped_column(String(5), default="09:00")
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    place: Mapped[str] = mapped_column(String(255), default="")
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    tone: Mapped[str] = mapped_column(String(16), default="blue")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    label: Mapped[str] = mapped_column(String(255))
    amount_minor: Mapped[int] = mapped_column(Integer, default=0)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    type: Mapped[str] = mapped_column(String(16), default="expense")
    occurred_on: Mapped[date] = mapped_column(Date, default=date.today)


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    lessons_total: Mapped[int] = mapped_column(Integer, default=0)
    lessons_done: Mapped[int] = mapped_column(Integer, default=0)
    tone: Mapped[str] = mapped_column(String(16), default="blue")


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    current: Mapped[float] = mapped_column(Float, default=0)
    target: Mapped[float] = mapped_column(Float, default=1)
    unit: Mapped[str] = mapped_column(String(32), default="")
    tone: Mapped[str] = mapped_column(String(16), default="indigo")


class HealthLog(Base):
    __tablename__ = "health_logs"
    __table_args__ = (UniqueConstraint("user_id", "log_date", name="uq_health_user_date"),)

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    log_date: Mapped[date] = mapped_column(Date, default=date.today)
    steps: Mapped[int] = mapped_column(Integer, default=0)
    sleep_minutes: Mapped[int] = mapped_column(Integer, default=0)
    water_ml: Mapped[int] = mapped_column(Integer, default=0)
    diet_ok: Mapped[bool] = mapped_column(Boolean, default=False)


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    emoji: Mapped[str] = mapped_column(String(8), default="📝")
    class_name: Mapped[str] = mapped_column(String(64), default="")
    type: Mapped[str] = mapped_column(String(64), default="Lecture")
    reviewed: Mapped[bool] = mapped_column(Boolean, default=False)
    body: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    kind: Mapped[str] = mapped_column(String(16), default="FILE")
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    tag: Mapped[str] = mapped_column(String(64), default="Personal")
    stored_name: Mapped[str] = mapped_column(String(255), default="")
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    trigger: Mapped[str] = mapped_column(String(255))
    trigger_kind: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    action: Mapped[str] = mapped_column(String(255))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    runs: Mapped[int] = mapped_column(Integer, default=0)


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    detail: Mapped[str] = mapped_column(String(255), default="")
    kind: Mapped[str] = mapped_column(String(16), default="system")
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Reminder(Base):
    __tablename__ = "reminders"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    due_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    badge: Mapped[str] = mapped_column(String(16), default="gold")
    done: Mapped[bool] = mapped_column(Boolean, default=False)


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    wallet_amount_minor: Mapped[int] = mapped_column(Integer, default=0)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    food_pct: Mapped[int] = mapped_column(Integer, default=30)
    rent_pct: Mapped[int] = mapped_column(Integer, default=40)
    savings_pct: Mapped[int] = mapped_column(Integer, default=30)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    @property
    def wallet(self) -> float:
        return round(self.wallet_amount_minor / 100, 2)


class BudgetItem(Base):
    __tablename__ = "budget_items"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    price_minor: Mapped[int] = mapped_column(Integer, default=0)
    affordable: Mapped[bool] = mapped_column(Boolean, default=False)

    @property
    def price(self) -> float:
        return round(self.price_minor / 100, 2)


class FoodTimetable(Base):
    __tablename__ = "food_timetable"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    day_of_week: Mapped[int] = mapped_column(Integer, default=0)
    meal: Mapped[str] = mapped_column(String(255))
    cost_minor: Mapped[int] = mapped_column(Integer, default=0)

    _DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    @property
    def day(self) -> str:
        return self._DAY_NAMES[self.day_of_week % len(self._DAY_NAMES)]

    @property
    def cost(self) -> float:
        return round(self.cost_minor / 100, 2)
