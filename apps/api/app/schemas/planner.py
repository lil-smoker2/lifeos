from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Priority = Literal["High", "Medium", "Low"]


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    category: str = Field(default="Personal", max_length=64)
    priority: Priority = "Medium"
    due: str = Field(default="09:00", max_length=5)
    done: bool = False


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    category: str | None = Field(default=None, max_length=64)
    priority: Priority | None = None
    due: str | None = Field(default=None, max_length=5)
    done: bool | None = None


class TaskOut(BaseModel):
    id: str
    title: str
    category: str
    priority: str
    due: str = Field(validation_alias="due_time")
    done: bool

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    place: str = Field(default="", max_length=255)
    starts_at: datetime
    ends_at: datetime | None = None
    tone: Literal["blue", "violet", "orange", "green"] = "blue"


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    place: str | None = Field(default=None, max_length=255)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    tone: Literal["blue", "violet", "orange", "green"] | None = None


class EventOut(BaseModel):
    id: str
    title: str
    place: str
    starts_at: datetime
    ends_at: datetime | None
    tone: str

    model_config = ConfigDict(from_attributes=True)
