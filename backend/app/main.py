from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from .db import AsyncSessionLocal, get_db, init_db
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


def _cors_origins() -> list[str]:
    origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
    if settings.frontend_url:
        origins.append(settings.frontend_url.strip().rstrip("/"))
    return list(dict.fromkeys(origins))


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULTS = [
    ("Nursery", 60),
    ("LKG", 60),
    ("UKG", 60),
    ("Class 1", 60),
    ("Class 2", 60),
    ("Class 3", 60),
    ("Class 4", 60),
    ("Class 5", 60),
    ("Class 6", 60),
    ("Class 7", 60),
    ("Class 8", 60),
    ("Class 9", 50),
    ("Class 10", 50),
    ("PUC", 80),
    ("Engineering", 80),
]


@app.on_event("startup")
async def on_startup() -> None:
    await init_db()
    async with AsyncSessionLocal() as db:
        cnt = await db.execute(select(func.count()).select_from(Seat))
        if (cnt.scalar() or 0) == 0:
            for class_name, total in DEFAULTS:
                db.add(
                    Seat(
                        class_name=class_name,
                        total_seats=total,
                        seats_booked=0,
                        seats_available=total,
                    )
                )
            await db.commit()


def _admission_out(a: Admission) -> dict:
    return {
        "id": str(a.id),
        "application_number": a.application_number,
        "student_name": a.student_name,
        "date_of_birth": a.date_of_birth,
        "gender": a.gender,
        "class_applying": a.class_applying,
        "previous_school": a.previous_school,
        "father_name": a.father_name,
        "mother_name": a.mother_name,
        "parent_email": a.parent_email,
        "parent_phone": a.parent_phone,
        "alternate_phone": a.alternate_phone,
        "parent_occupation": a.parent_occupation,
        "address": a.address,
        "city": a.city,
        "pincode": a.pincode,
        "medical_conditions": a.medical_conditions,
        "hear_about_us": a.hear_about_us,
        "status": a.status,
        "ai_welcome_message": a.ai_welcome_message,
        "created_at": a.created_at,
        "updated_at": a.updated_at,
    }


def _seat_out(s: Seat) -> dict:
    return {
        "id": str(s.id),
        "class_name": s.class_name,
        "total_seats": s.total_seats,
        "seats_booked": s.seats_booked,
        "seats_available": s.seats_available,
        "last_updated": s.last_updated,
    }


@app.get("/api/health")
def health() -> dict:
    return {"status": "healthy"}


@app.post("/api/admissions")
async def create_admission(payload: AdmissionCreate, db: AsyncSession = Depends(get_db)) -> dict:
    welcome = await generate_welcome_message(
        {
            "student_name": payload.student_name,
            "class_applying": payload.class_applying,
            "city": payload.city,
            "hear_about_us": payload.hear_about_us,
        }
    )
    data = payload.model_dump()
    year = datetime.now().year
    admission: Admission | None = None
    async with db.begin():
        locked = await db.execute(
            select(Seat).where(Seat.class_name == payload.class_applying).with_for_update()
        )
        seat = locked.scalar_one_or_none()
        if not seat:
            raise HTTPException(status_code=404, detail="Seats data not found for this class.")
        if seat.seats_available <= 0:
            raise HTTPException(status_code=409, detail="No seats available for this class right now.")

        seat.seats_booked += 1
        seat.seats_available = max(0, seat.total_seats - seat.seats_booked)

        provisional = f"PEND-{uuid.uuid4().hex[:20]}"
        admission = Admission(
            application_number=provisional,
            **data,
            status="pending",
            ai_welcome_message=welcome,
        )
        db.add(admission)
        await db.flush()
        admission.application_number = f"GIS-{year}-{admission.id:05d}"

    if admission is None:
        raise HTTPException(status_code=500, detail="Could not create admission.")
    await db.refresh(admission)
    return {
        "application_number": admission.application_number,
        "ai_welcome_message": welcome,
        "id": str(admission.id),
    }


@app.get("/api/admissions", response_model=list[AdmissionOut])
async def list_admissions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Admission).order_by(Admission.created_at.desc()))
    return [_admission_out(a) for a in result.scalars().all()]


@app.get("/api/admissions/lookup/{application_number}", response_model=AdmissionOut)
async def get_admission_by_number(application_number: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Admission).where(Admission.application_number == application_number.strip()))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Admission not found.")
    return _admission_out(a)


@app.get("/api/admissions/{admission_id}", response_model=AdmissionOut)
async def get_admission(admission_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Admission).where(Admission.id == admission_id))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Admission not found.")
    return _admission_out(a)


@app.put("/api/admissions/{admission_id}/status", response_model=AdmissionOut)
async def update_admission_status(
    admission_id: int, payload: AdmissionStatusUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Admission).where(Admission.id == admission_id))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Admission not found.")
    a.status = payload.status
    await db.commit()
    await db.refresh(a)
    return _admission_out(a)


@app.delete("/api/admissions/{admission_id}")
async def delete_admission(admission_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Admission).where(Admission.id == admission_id))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Admission not found.")
    class_name = a.class_applying
    locked = await db.execute(select(Seat).where(Seat.class_name == class_name).with_for_update())
    seat = locked.scalar_one_or_none()
    if seat and seat.seats_booked > 0:
        seat.seats_booked -= 1
        seat.seats_available = max(0, seat.total_seats - seat.seats_booked)
    await db.execute(delete(Admission).where(Admission.id == admission_id))
    await db.commit()
    return {"ok": True}


@app.get("/api/seats", response_model=list[SeatsOut])
async def list_seats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Seat).order_by(Seat.class_name))
    return [_seat_out(s) for s in result.scalars().all()]


@app.put("/api/seats/{class_name}", response_model=SeatsOut)
async def update_seat(class_name: str, payload: SeatUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Seat).where(Seat.class_name == class_name))
    s = result.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Class not found.")
    s.total_seats = payload.total_seats
    s.seats_available = max(0, payload.total_seats - s.seats_booked)
    await db.commit()
    await db.refresh(s)
    return _seat_out(s)


@app.post("/api/contacts")
async def create_contact(payload: ContactCreate, db: AsyncSession = Depends(get_db)):
    contact = Contact(**payload.model_dump())
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return {"ok": True, "id": str(contact.id)}


@app.get("/api/contacts")
async def list_contacts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Contact).order_by(Contact.created_at.desc()))
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "email": c.email,
            "message": c.message,
            "created_at": c.created_at,
        }
        for c in result.scalars().all()
    ]


@app.get("/api/weather", response_model=WeatherOut)
def weather():
    return get_bengaluru_weather()
