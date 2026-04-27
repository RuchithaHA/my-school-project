from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import ReturnDocument

from .db import get_database
from .memory_store import memory_store
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


def _oid(v: str) -> ObjectId:
    try:
        return ObjectId(v)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id.")


@app.on_event("startup")
async def on_startup() -> None:
    defaults = [
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
    # If Mongo isn't configured yet (missing MONGODB_URI), run in memory mode.
    try:
        db = get_database()
    except Exception:
        memory_store.seed_seats(defaults)
        return

    seats = db["seats"]
    for class_name, total in defaults:
        await seats.update_one(
            {"class_name": class_name},
            {
                "$setOnInsert": {
                    "class_name": class_name,
                    "total_seats": total,
                    "seats_booked": 0,
                    "seats_available": total,
                    "last_updated": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"status": "healthy"}


async def _next_application_number() -> str:
    try:
        db = get_database()
    except Exception:
        return memory_store.next_app_number()

    counters = db["counters"]
    doc = await counters.find_one_and_update(
        {"_id": "admissions_seq_2025"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    seq = int((doc or {}).get("seq") or 1)
    return f"GIS-2025-{seq:04d}"


def _admission_out(doc: dict) -> dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "application_number": doc.get("application_number"),
        "student_name": doc.get("student_name"),
        "date_of_birth": doc.get("date_of_birth"),
        "gender": doc.get("gender"),
        "class_applying": doc.get("class_applying"),
        "previous_school": doc.get("previous_school"),
        "father_name": doc.get("father_name"),
        "mother_name": doc.get("mother_name"),
        "parent_email": doc.get("parent_email"),
        "parent_phone": doc.get("parent_phone"),
        "alternate_phone": doc.get("alternate_phone"),
        "parent_occupation": doc.get("parent_occupation"),
        "address": doc.get("address"),
        "city": doc.get("city"),
        "pincode": doc.get("pincode"),
        "medical_conditions": doc.get("medical_conditions"),
        "hear_about_us": doc.get("hear_about_us"),
        "status": doc.get("status", "pending"),
        "ai_welcome_message": doc.get("ai_welcome_message"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


def _seat_out(doc: dict) -> dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "class_name": doc.get("class_name"),
        "total_seats": int(doc.get("total_seats") or 0),
        "seats_booked": int(doc.get("seats_booked") or 0),
        "seats_available": int(doc.get("seats_available") or 0),
        "last_updated": doc.get("last_updated"),
    }


@app.post("/api/admissions")
async def create_admission(payload: AdmissionCreate) -> dict[str, Any]:
    try:
        db = get_database()
    except Exception:
        try:
            ok = memory_store.reserve_seat(payload.class_applying)
        except KeyError:
            raise HTTPException(status_code=404, detail="Seats data not found for this class.")
        if not ok:
            raise HTTPException(status_code=409, detail="No seats available for this class right now.")

        application_number = await _next_application_number()
        welcome = generate_welcome_message(
            {
                "student_name": payload.student_name,
                "class_applying": payload.class_applying,
                "city": payload.city,
                "hear_about_us": payload.hear_about_us,
            }
        )
        doc = payload.model_dump()
        doc.update({"application_number": application_number, "status": "pending", "ai_welcome_message": welcome})
        rec = memory_store.create_admission(doc)
        return {"application_number": application_number, "ai_welcome_message": welcome, "id": rec["id"]}

    seats = db["seats"]
    admissions = db["admissions"]

    # Atomically reserve a seat if available.
    seat = await seats.find_one_and_update(
        {"class_name": payload.class_applying, "seats_available": {"$gt": 0}},
        [
            {
                "$set": {
                    "seats_booked": {"$add": ["$seats_booked", 1]},
                    "seats_available": {"$subtract": ["$seats_available", 1]},
                    "last_updated": datetime.now(timezone.utc),
                }
            }
        ],
        return_document=ReturnDocument.AFTER,
    )
    if not seat:
        exists = await seats.find_one({"class_name": payload.class_applying})
        if not exists:
            raise HTTPException(status_code=404, detail="Seats data not found for this class.")
        raise HTTPException(status_code=409, detail="No seats available for this class right now.")

    application_number = await _next_application_number()
    welcome = generate_welcome_message(
        {
            "student_name": payload.student_name,
            "class_applying": payload.class_applying,
            "city": payload.city,
            "hear_about_us": payload.hear_about_us,
        }
    )

    now = datetime.now(timezone.utc)
    doc = payload.model_dump()
    doc.update(
        {
            "application_number": application_number,
            "status": "pending",
            "ai_welcome_message": welcome,
            "created_at": now,
            "updated_at": now,
        }
    )

    res = await admissions.insert_one(doc)
    return {"application_number": application_number, "ai_welcome_message": welcome, "id": str(res.inserted_id)}


@app.get("/api/admissions", response_model=list[AdmissionOut])
async def list_admissions() -> list[dict[str, Any]]:
    try:
        db = get_database()
    except Exception:
        return [a for a in memory_store.list_admissions()]

    cursor = db["admissions"].find({}).sort("created_at", -1)
    docs = await cursor.to_list(length=5000)
    return [_admission_out(d) for d in docs]


@app.get("/api/admissions/{admission_id}", response_model=AdmissionOut)
async def get_admission(admission_id: str) -> dict[str, Any]:
    try:
        db = get_database()
    except Exception:
        rec = memory_store.get_admission(admission_id)
        if not rec:
            raise HTTPException(status_code=404, detail="Admission not found.")
        return rec

    doc = await db["admissions"].find_one({"_id": _oid(admission_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Admission not found.")
    return _admission_out(doc)


@app.put("/api/admissions/{admission_id}/status", response_model=AdmissionOut)
async def update_admission_status(admission_id: str, payload: AdmissionStatusUpdate) -> dict[str, Any]:
    try:
        db = get_database()
    except Exception:
        rec = memory_store.update_admission_status(admission_id, payload.status)
        if not rec:
            raise HTTPException(status_code=404, detail="Admission not found.")
        return rec

    now = datetime.now(timezone.utc)
    doc = await db["admissions"].find_one_and_update(
        {"_id": _oid(admission_id)},
        {"$set": {"status": payload.status, "updated_at": now}},
        return_document=ReturnDocument.AFTER,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Admission not found.")
    return _admission_out(doc)


@app.delete("/api/admissions/{admission_id}")
async def delete_admission(admission_id: str) -> dict[str, Any]:
    try:
        db = get_database()
    except Exception:
        ok = memory_store.delete_admission(admission_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Admission not found.")
        return {"ok": True}

    res = await db["admissions"].delete_one({"_id": _oid(admission_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admission not found.")
    return {"ok": True}


@app.get("/api/seats", response_model=list[SeatsOut])
async def list_seats() -> list[dict[str, Any]]:
    try:
        db = get_database()
    except Exception:
        return [s for s in memory_store.list_seats()]

    docs = await db["seats"].find({}).sort("class_name", 1).to_list(length=500)
    return [_seat_out(d) for d in docs]


@app.put("/api/seats/{class_name}", response_model=SeatsOut)
async def update_seat(class_name: str, payload: SeatUpdate) -> dict[str, Any]:
    try:
        db = get_database()
    except Exception:
        try:
            return memory_store.update_seat_total(class_name, int(payload.total_seats))
        except KeyError:
            raise HTTPException(status_code=404, detail="Class not found.")

    now = datetime.now(timezone.utc)
    doc = await db["seats"].find_one_and_update(
        {"class_name": class_name},
        [
            {
                "$set": {
                    "total_seats": int(payload.total_seats),
                    "seats_available": {
                        "$max": [0, {"$subtract": [int(payload.total_seats), "$seats_booked"]}]
                    },
                    "last_updated": now,
                }
            }
        ],
        return_document=ReturnDocument.AFTER,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Class not found.")
    return _seat_out(doc)


@app.post("/api/contacts")
async def create_contact(payload: ContactCreate) -> dict[str, Any]:
    try:
        get_database()
    except Exception:
        rec = memory_store.create_contact(payload.model_dump())
        return {"ok": True, "id": rec["id"]}

    db = get_database()
    now = datetime.now(timezone.utc)
    doc = payload.model_dump()
    doc["created_at"] = now
    res = await db["contacts"].insert_one(doc)
    return {"ok": True, "id": str(res.inserted_id)}


@app.get("/api/contacts")
async def list_contacts() -> list[dict[str, Any]]:
    try:
        db = get_database()
    except Exception:
        return memory_store.list_contacts()

    docs = await db["contacts"].find({}).sort("created_at", -1).to_list(length=2000)
    return [
        {"id": str(c["_id"]), "name": c.get("name"), "email": c.get("email"), "message": c.get("message"), "created_at": c.get("created_at")}
        for c in docs
    ]


@app.get("/api/weather", response_model=WeatherOut)
def weather() -> dict[str, Any]:
    return get_bengaluru_weather()

