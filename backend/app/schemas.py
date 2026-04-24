from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


class AdmissionCreate(BaseModel):
    student_name: str = Field(min_length=2, max_length=120)
    date_of_birth: date
    gender: str = Field(min_length=2, max_length=32)
    class_applying: str = Field(min_length=1, max_length=64)
    previous_school: str | None = Field(default=None, max_length=180)

    father_name: str | None = Field(default=None, max_length=120)
    mother_name: str | None = Field(default=None, max_length=120)
    parent_email: EmailStr
    parent_phone: str = Field(min_length=7, max_length=40)
    alternate_phone: str | None = Field(default=None, max_length=40)
    parent_occupation: str | None = Field(default=None, max_length=120)

    address: str = Field(min_length=5, max_length=2000)
    city: str = Field(min_length=2, max_length=80)
    pincode: str = Field(min_length=4, max_length=20)
    medical_conditions: str | None = Field(default=None, max_length=2000)
    hear_about_us: str | None = Field(default=None, max_length=120)

    @field_validator("gender")
    @classmethod
    def normalize_gender(cls, v: str) -> str:
        return v.strip()


class AdmissionOut(BaseModel):
    id: int
    application_number: str
    student_name: str
    date_of_birth: date
    gender: str
    class_applying: str
    previous_school: str | None
    father_name: str | None
    mother_name: str | None
    parent_email: str
    parent_phone: str
    alternate_phone: str | None
    parent_occupation: str | None
    address: str
    city: str
    pincode: str
    medical_conditions: str | None
    hear_about_us: str | None
    status: str
    ai_welcome_message: str | None
    created_at: datetime | None
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class AdmissionStatusUpdate(BaseModel):
    status: Literal["pending", "approved", "rejected", "waitlist"]


class SeatsOut(BaseModel):
    id: int
    class_name: str
    total_seats: int
    seats_booked: int
    seats_available: int
    last_updated: datetime | None

    model_config = {"from_attributes": True}


class SeatUpdate(BaseModel):
    total_seats: int = Field(ge=0)


class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    message: str = Field(min_length=5, max_length=2000)


class WeatherOut(BaseModel):
    temperature_c: float
    description: str
    fetched_at: datetime

