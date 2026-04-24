from __future__ import annotations

from datetime import datetime

from sqlalchemy import Date, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class Admission(Base):
    __tablename__ = "admissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    application_number: Mapped[str] = mapped_column(String(32), unique=True, index=True)

    student_name: Mapped[str] = mapped_column(String(120))
    date_of_birth: Mapped[datetime] = mapped_column(Date)
    gender: Mapped[str] = mapped_column(String(32))
    class_applying: Mapped[str] = mapped_column(String(64))
    previous_school: Mapped[str | None] = mapped_column(String(180), nullable=True)

    father_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    mother_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    parent_email: Mapped[str] = mapped_column(String(180))
    parent_phone: Mapped[str] = mapped_column(String(40))
    alternate_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    parent_occupation: Mapped[str | None] = mapped_column(String(120), nullable=True)

    address: Mapped[str] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(80))
    pincode: Mapped[str] = mapped_column(String(20))
    medical_conditions: Mapped[str | None] = mapped_column(Text, nullable=True)
    hear_about_us: Mapped[str | None] = mapped_column(String(120), nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    ai_welcome_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )


class Seat(Base):
    __tablename__ = "seats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    class_name: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    total_seats: Mapped[int] = mapped_column(Integer, default=0)
    seats_booked: Mapped[int] = mapped_column(Integer, default=0)
    seats_available: Mapped[int] = mapped_column(Integer, default=0)
    last_updated: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(180))
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

