from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from .settings import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        if not settings.mongodb_uri:
            raise RuntimeError("MONGODB_URI is missing.")
        _client = AsyncIOMotorClient(settings.mongodb_uri)
    return _client


def get_database() -> AsyncIOMotorDatabase:
    # Use database name from URI; fallback to "greenwood".
    client = get_client()
    try:
        db = client.get_default_database()
    except Exception:
        db = client["greenwood"]
    return db

