from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


def _now() -> datetime:
    return datetime.now(timezone.utc)


class MemoryStore:
    def __init__(self) -> None:
        self._admissions: dict[str, dict[str, Any]] = {}
        self._contacts: dict[str, dict[str, Any]] = {}
        self._seats: dict[str, dict[str, Any]] = {}
        self._seq_2025 = 0

    def seed_seats(self, defaults: list[tuple[str, int]]) -> None:
        for class_name, total in defaults:
            if class_name in self._seats:
                continue
            self._seats[class_name] = {
                "id": str(uuid4()),
                "class_name": class_name,
                "total_seats": int(total),
                "seats_booked": 0,
                "seats_available": int(total),
                "last_updated": _now(),
            }

    def next_app_number(self) -> str:
        self._seq_2025 += 1
        return f"GIS-2025-{self._seq_2025:04d}"

    def list_seats(self) -> list[dict[str, Any]]:
        return sorted(self._seats.values(), key=lambda s: s["class_name"])

    def reserve_seat(self, class_name: str) -> bool:
        seat = self._seats.get(class_name)
        if not seat:
            raise KeyError("class not found")
        if seat["seats_available"] <= 0:
            return False
        seat["seats_booked"] += 1
        seat["seats_available"] = max(0, seat["total_seats"] - seat["seats_booked"])
        seat["last_updated"] = _now()
        return True

    def update_seat_total(self, class_name: str, total_seats: int) -> dict[str, Any]:
        seat = self._seats.get(class_name)
        if not seat:
            raise KeyError("class not found")
        seat["total_seats"] = int(total_seats)
        seat["seats_available"] = max(0, seat["total_seats"] - seat["seats_booked"])
        seat["last_updated"] = _now()
        return seat

    def create_admission(self, doc: dict[str, Any]) -> dict[str, Any]:
        _id = str(uuid4())
        now = _now()
        out = {"id": _id, **doc, "created_at": now, "updated_at": now}
        self._admissions[_id] = out
        return out

    def list_admissions(self) -> list[dict[str, Any]]:
        return sorted(self._admissions.values(), key=lambda a: a["created_at"], reverse=True)

    def get_admission(self, admission_id: str) -> dict[str, Any] | None:
        return self._admissions.get(admission_id)

    def update_admission_status(self, admission_id: str, status: str) -> dict[str, Any] | None:
        rec = self._admissions.get(admission_id)
        if not rec:
            return None
        rec["status"] = status
        rec["updated_at"] = _now()
        return rec

    def delete_admission(self, admission_id: str) -> bool:
        return self._admissions.pop(admission_id, None) is not None

    def create_contact(self, doc: dict[str, Any]) -> dict[str, Any]:
        _id = str(uuid4())
        now = _now()
        out = {"id": _id, **doc, "created_at": now}
        self._contacts[_id] = out
        return out

    def list_contacts(self) -> list[dict[str, Any]]:
        return sorted(self._contacts.values(), key=lambda c: c["created_at"], reverse=True)


memory_store = MemoryStore()

