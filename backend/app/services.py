from __future__ import annotations

from datetime import datetime, timedelta, timezone

import requests


def generate_welcome_message(payload: dict) -> str:
    name = (payload.get("student_name") or "Student").strip()
    cls = (payload.get("class_applying") or "the program").strip()
    city = (payload.get("city") or "Bengaluru").strip()
    note = (payload.get("hear_about_us") or "").strip()

    extra = f" We’re excited to hear you’re interested in {note.lower()}." if note else ""
    return (
        f"Dear {name},\n\n"
        f"Welcome to Greenwood International School! Thank you for applying for {cls}. "
        f"Our team in {city} has received your application and will review it shortly.{extra}\n\n"
        "To parents/guardians: thank you for trusting Greenwood—our admissions team will contact you soon with next steps.\n\n"
        "Warm regards,\n"
        "Admissions Team\n"
        "Greenwood International School"
    )


WEATHER_TTL = timedelta(minutes=30)
_weather_cache: dict | None = None


def _wmo_code_to_text(code: int) -> str:
    mapping = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
    }
    return mapping.get(code, "Weather update")


def get_bengaluru_weather() -> dict:
    global _weather_cache
    now = datetime.now(timezone.utc)
    if _weather_cache and _weather_cache["expires_at"] > now:
        return _weather_cache["data"]

    # Bengaluru coords
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": 12.9716,
        "longitude": 77.5946,
        "current": "temperature_2m,weather_code",
        "timezone": "auto",
    }
    r = requests.get(url, params=params, timeout=10)
    r.raise_for_status()
    data = r.json()
    current = data.get("current") or {}

    temp = float(current.get("temperature_2m"))
    code = int(current.get("weather_code"))
    out = {
        "temperature_c": temp,
        "description": _wmo_code_to_text(code),
        "fetched_at": now,
    }
    _weather_cache = {"expires_at": now + WEATHER_TTL, "data": out}
    return out

