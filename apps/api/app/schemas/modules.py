import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

TxnType = Literal["income", "expense", "savings"]


class TxnCreate(BaseModel):
    label: str = Field(min_length=1, max_length=255)
    amount: float = Field(gt=0)
    type: TxnType = "expense"
    currency: str = Field(default="USD", pattern="^[A-Z]{3}$")
    date: datetime.date | None = None


class TxnOut(BaseModel):
    id: str
    label: str
    amount: float
    currency: str
    type: str
    date: str


class CourseOut(BaseModel):
    id: str
    name: str
    done: int
    total: int
    tone: str


class CourseUpdate(BaseModel):
    done: int = Field(ge=0)


class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    target: float = Field(gt=0)
    unit: str = Field(default="", max_length=32)
    tone: Literal["indigo", "green", "orange"] = "indigo"


class GoalUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    current: float | None = Field(default=None, ge=0)
    target: float | None = Field(default=None, gt=0)
    unit: str | None = Field(default=None, max_length=32)
    tone: Literal["indigo", "green", "orange"] | None = None


class GoalOut(BaseModel):
    id: str
    title: str
    current: float
    target: float
    unit: str
    tone: str


class HealthOut(BaseModel):
    steps: int
    sleep: float
    water: float
    diet: bool


class HealthUpdate(BaseModel):
    steps: int = Field(ge=0, le=200000)
    sleep: float = Field(ge=0, le=24)
    water: float = Field(ge=0, le=12)
    diet: bool = False
