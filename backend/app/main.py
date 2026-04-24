from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .db import Base, engine, get_db
from .models import Admission, Contact, Seat
from .schemas import (
    AdmissionCreate,
    AdmissionOut,
    AdmissionStatusUpdate,
    ContactCreate,
    SeatUpdate,
    SeatsOut,
    WeatherOut,
)
from .services import generate_welcome_message, get_bengaluru_weather
from .settings import settings

app = FastAPI(title="Greenwood International School API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url or "http://localhost:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _seed_seats(db: Session) -> None:
    defaults = [
        ("Nursery-2", 60),
        ("Class 3-5", 60),
        ("Class 6-8", 60),
        ("Class 9-10", 50),
        ("Class 11-12 Science", 40),
        ("Class 11-12 Commerce", 40),
    ]
    for class_name, total in defaults:
        existing = db.execute(select(Seat).where(Seat.class_name == class_name)).scalar_one_or_none()
        if existing:
            continue
        db.add(
            Seat(
                class_name=class_name,
                total_seats=total,
                seats_booked=0,
                seats_available=total,
            )
        )
    db.commit()


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        _seed_seats(db)
    finally:
        db.close()


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"ok": True, "time": datetime.utcnow().isoformat()}


def _generate_application_number(db: Session) -> str:
    # GIS-2025-XXXX based on max id; padded to 4 digits
    last = db.execute(select(Admission).order_by(desc(Admission.id)).limit(1)).scalar_one_or_none()
    next_num = (last.id + 1) if last else 1
    return f"GIS-2025-{next_num:04d}"


@app.post("/api/admissions")
def create_admission(payload: AdmissionCreate, db: Session = Depends(get_db)) -> dict[str, Any]:
    seat = (
        db.execute(select(Seat).where(Seat.class_name == payload.class_applying).with_for_update())
        .scalar_one_or_none()
    )
    if not seat:
        raise HTTPException(status_code=404, detail="Seats data not found for this class.")
    if seat.seats_available <= 0:
        raise HTTPException(status_code=409, detail="No seats available for this class right now.")

    application_number = _generate_application_number(db)
    welcome = generate_welcome_message(
        {
            "student_name": payload.student_name,
            "class_applying": payload.class_applying,
            "city": payload.city,
            "hear_about_us": payload.hear_about_us,
        }
    )

    record = Admission(
        application_number=application_number,
        student_name=payload.student_name,
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        class_applying=payload.class_applying,
        previous_school=payload.previous_school,
        father_name=payload.father_name,
        mother_name=payload.mother_name,
        parent_email=str(payload.parent_email),
        parent_phone=payload.parent_phone,
        alternate_phone=payload.alternate_phone,
        parent_occupation=payload.parent_occupation,
        address=payload.address,
        city=payload.city,
        pincode=payload.pincode,
        medical_conditions=payload.medical_conditions,
        hear_about_us=payload.hear_about_us,
        status="pending",
        ai_welcome_message=welcome,
    )
    db.add(record)

    seat.seats_booked += 1
    seat.seats_available = max(0, seat.total_seats - seat.seats_booked)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Duplicate application. Please retry.")

    db.refresh(record)
    return {"application_number": application_number, "ai_welcome_message": welcome, "id": record.id}


@app.get("/api/admissions", response_model=list[AdmissionOut])
def list_admissions(db: Session = Depends(get_db)) -> list[Admission]:
    return list(db.execute(select(Admission).order_by(desc(Admission.created_at))).scalars().all())


@app.get("/api/admissions/{admission_id}", response_model=AdmissionOut)
def get_admission(admission_id: int, db: Session = Depends(get_db)) -> Admission:
    record = db.get(Admission, admission_id)
    if not record:
        raise HTTPException(status_code=404, detail="Admission not found.")
    return record


@app.put("/api/admissions/{admission_id}/status", response_model=AdmissionOut)
def update_admission_status(
    admission_id: int, payload: AdmissionStatusUpdate, db: Session = Depends(get_db)
) -> Admission:
    record = db.get(Admission, admission_id)
    if not record:
        raise HTTPException(status_code=404, detail="Admission not found.")
    record.status = payload.status
    db.commit()
    db.refresh(record)
    return record


@app.delete("/api/admissions/{admission_id}")
def delete_admission(admission_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    record = db.get(Admission, admission_id)
    if not record:
        raise HTTPException(status_code=404, detail="Admission not found.")
    db.delete(record)
    db.commit()
    return {"ok": True}


@app.get("/api/seats", response_model=list[SeatsOut])
def list_seats(db: Session = Depends(get_db)) -> list[Seat]:
    return list(db.execute(select(Seat).order_by(Seat.class_name.asc())).scalars().all())


@app.put("/api/seats/{class_name}", response_model=SeatsOut)
def update_seat(class_name: str, payload: SeatUpdate, db: Session = Depends(get_db)) -> Seat:
    seat = db.execute(select(Seat).where(Seat.class_name == class_name).with_for_update()).scalar_one_or_none()
    if not seat:
        raise HTTPException(status_code=404, detail="Class not found.")
    seat.total_seats = payload.total_seats
    seat.seats_available = max(0, seat.total_seats - seat.seats_booked)
    db.commit()
    db.refresh(seat)
    return seat


@app.post("/api/contacts")
def create_contact(payload: ContactCreate, db: Session = Depends(get_db)) -> dict[str, Any]:
    record = Contact(name=payload.name, email=str(payload.email), message=payload.message)
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"ok": True, "id": record.id}

@app.get("/api/contacts")
def list_contacts(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    rows = list(db.execute(select(Contact).order_by(desc(Contact.created_at))).scalars().all())
    return [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "message": c.message,
            "created_at": c.created_at,
        }
        for c in rows
    ]


@app.get("/api/weather", response_model=WeatherOut)
def weather() -> dict[str, Any]:
    return get_bengaluru_weather()

