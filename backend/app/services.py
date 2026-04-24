from __future__ import annotations

from datetime import datetime, timedelta, timezone

import requests
from openai import AzureOpenAI

from .settings import settings


def build_azure_client() -> AzureOpenAI:
    return AzureOpenAI(
        api_key=settings.azure_openai_api_key,
        api_version=settings.azure_openai_api_version,
        azure_endpoint=settings.azure_openai_endpoint,
    )


def generate_welcome_message(payload: dict) -> str:
    client = build_azure_client()
    # No chatbot UI; just a single-shot completion style response.
    prompt = (
        "You are Greenwood International School admissions team.\n"
        "Write a warm, professional, personalized welcome message (80-140 words) for the student.\n"
        "Include the student's name, class applying, and one supportive line for parents.\n"
        "Do not mention you are an AI.\n\n"
        f"Student Name: {payload.get('student_name')}\n"
        f"Class Applying: {payload.get('class_applying')}\n"
        f"City: {payload.get('city')}\n"
        f"Interests/Activities (if any): {payload.get('hear_about_us')}\n"
    )

    res = client.chat.completions.create(
        model=settings.azure_openai_deployment,
        messages=[
            {"role": "system", "content": "You write short admissions welcome messages."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=220,
    )
    return (res.choices[0].message.content or "").strip()


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

