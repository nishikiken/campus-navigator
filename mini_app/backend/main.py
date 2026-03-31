"""
FastAPI backend для Campus Navigator Mini App.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional

from database import Database

app = FastAPI(title="Campus Navigator API")

# Инициализация базы данных
db = Database()

# CORS для Telegram Mini App
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROUTES_DIR = os.path.join(BASE_DIR, "..", "routes")

ENTRANCES = {
    "1": {"name": "Вход 1", "description": "Западный"},
    "2": {"name": "Вход 2", "description": "Главный"},
    "3": {"name": "Вход 3", "description": "Восточный"},
}

BUILDINGS = {str(i): f"Корпус {i}" for i in range(1, 13)}


# === Модели данных ===
class UserCreate(BaseModel):
    telegram_id: int
    name: str
    avatar_url: Optional[str] = None


class TokensAdd(BaseModel):
    telegram_id: int
    amount: int


class RatingAdd(BaseModel):
    telegram_id: int
    amount: int


# === API для пользователей ===
@app.get("/api/user/{telegram_id}")
def get_user(telegram_id: int):
    """Получить данные пользователя."""
    user = db.get_user(telegram_id)
    if not user:
        raise HTTPException(404, "Пользователь не найден")
    return user


@app.post("/api/user")
def create_user(user_data: UserCreate):
    """Создать или обновить пользователя."""
    user = db.create_or_update_user(
        telegram_id=user_data.telegram_id,
        name=user_data.name,
        avatar_url=user_data.avatar_url
    )
    return user


@app.post("/api/user/tokens")
def add_tokens(data: TokensAdd):
    """Добавить токены пользователю."""
    user = db.get_user(data.telegram_id)
    if not user:
        raise HTTPException(404, "Пользователь не найден")
    
    updated_user = db.add_tokens(data.telegram_id, data.amount)
    return updated_user


@app.post("/api/user/rating")
def add_rating(data: RatingAdd):
    """Добавить рейтинг пользователю."""
    user = db.get_user(data.telegram_id)
    if not user:
        raise HTTPException(404, "Пользователь не найден")
    
    updated_user = db.add_rating(data.telegram_id, data.amount)
    return updated_user


@app.get("/api/leaderboard")
def get_leaderboard(limit: int = 50):
    """Получить таблицу лидеров."""
    leaders = db.get_leaderboard(limit)
    return leaders


@app.delete("/api/user/{telegram_id}")
def delete_user(telegram_id: int):
    """Удалить пользователя."""
    deleted = db.delete_user(telegram_id)
    if deleted:
        return {"success": True, "message": "Пользователь удален"}
    else:
        raise HTTPException(404, "Пользователь не найден")


# === API для маршрутов ===
@app.get("/api/entrances")
def get_entrances():
    return ENTRANCES


@app.get("/api/buildings")
def get_buildings():
    return BUILDINGS


@app.get("/api/route/{entrance}/{building}")
def get_route(entrance: str, building: str):
    if entrance not in ENTRANCES:
        raise HTTPException(404, "Вход не найден")
    if building not in BUILDINGS:
        raise HTTPException(404, "Корпус не найден")
    
    image_path = os.path.join(ROUTES_DIR, f"{entrance}-{building}.png")
    if not os.path.exists(image_path):
        raise HTTPException(404, "Маршрут не найден")
    
    return FileResponse(image_path, media_type="image/png")


# Health check endpoint
@app.get("/")
def health_check():
    """Health check для Back4App."""
    return {"status": "ok", "message": "Campus Navigator API is running"}
