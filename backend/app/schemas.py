from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import AliasChoices, BaseModel, EmailStr, Field, field_validator


class AdmissionCreate(BaseModel):
    student_name: str = Field(min_length=2, max_length=120, validation_alias=AliasChoices("student_name", "studentName"))
    date_of_birth: date = Field(validation_alias=AliasChoices("date_of_birth", "dateOfBirth"))
    gender: str = Field(min_length=2, max_length=32)
    class_applying: str = Field(min_length=1, max_length=64, validation_alias=AliasChoices("class_applying", "classApplying"))
    previous_school: str | None = Field(default=None, max_length=180, validation_alias=AliasChoices("previous_school", "previousSchool"))

    father_name: str | None = Field(default=None, max_length=120, validation_alias=AliasChoices("father_name", "fatherName"))
    mother_name: str | None = Field(default=None, max_length=120, validation_alias=AliasChoices("mother_name", "motherName"))
    parent_email: EmailStr = Field(validation_alias=AliasChoices("parent_email", "parentEmail"))
    parent_phone: str = Field(min_length=7, max_length=40, validation_alias=AliasChoices("parent_phone", "parentPhone"))
    alternate_phone: str | None = Field(default=None, max_length=40, validation_alias=AliasChoices("alternate_phone", "alternatePhone"))
    parent_occupation: str | None = Field(default=None, max_length=120, validation_alias=AliasChoices("parent_occupation", "parentOccupation"))

    address: str = Field(min_length=5, max_length=2000)
    city: str = Field(min_length=2, max_length=80)
    pincode: str = Field(min_length=4, max_length=20)
    medical_conditions: str | None = Field(default=None, max_length=2000, validation_alias=AliasChoices("medical_conditions", "medicalConditions"))
    hear_about_us: str | None = Field(default=None, max_length=120, validation_alias=AliasChoices("hear_about_us", "hearAboutUs"))

    @field_validator("gender")
    @classmethod
    def normalize_gender(cls, v: str) -> str:
        return v.strip()


class AdmissionOut(BaseModel):
    id: str
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

    model_config = {"populate_by_name": True}


class AdmissionStatusUpdate(BaseModel):
    status: Literal["pending", "approved", "rejected", "waitlist"]


class SeatsOut(BaseModel):
    id: str
    class_name: str
    total_seats: int
    seats_booked: int
    seats_available: int
    last_updated: datetime | None

    model_config = {"populate_by_name": True}


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

