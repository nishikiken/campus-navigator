"""
База данных для хранения информации о пользователях.
"""

import sqlite3
from datetime import datetime
from typing import Optional, List, Dict


class Database:
    def __init__(self, db_path: str = "users.db"):
        self.db_path = db_path
        self.init_db()
    
    def get_connection(self):
        """Создает подключение к базе данных."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Возвращать результаты как словари
        return conn
    
    def init_db(self):
        """Инициализирует базу данных и создает таблицы."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Таблица пользователей
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                telegram_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                tokens INTEGER DEFAULT 0,
                rating INTEGER DEFAULT 0,
                avatar_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
    
    def get_user(self, telegram_id: int) -> Optional[Dict]:
        """Получает данные пользователя по telegram_id."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT telegram_id, name, tokens, rating, avatar_url, created_at, last_active
            FROM users
            WHERE telegram_id = ?
        """, (telegram_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
    
    def create_or_update_user(self, telegram_id: int, name: str, avatar_url: Optional[str] = None) -> Dict:
        """Создает нового пользователя или обновляет существующего."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Проверяем существует ли пользователь
        existing = self.get_user(telegram_id)
        
        if existing:
            # Обновляем имя и аватар
            cursor.execute("""
                UPDATE users
                SET name = ?, avatar_url = ?, last_active = CURRENT_TIMESTAMP
                WHERE telegram_id = ?
            """, (name, avatar_url, telegram_id))
        else:
            # Создаем нового пользователя
            cursor.execute("""
                INSERT INTO users (telegram_id, name, avatar_url)
                VALUES (?, ?, ?)
            """, (telegram_id, name, avatar_url))
        
        conn.commit()
        conn.close()
        
        return self.get_user(telegram_id)
    
    def add_tokens(self, telegram_id: int, amount: int) -> Dict:
        """Добавляет токены пользователю."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE users
            SET tokens = tokens + ?, last_active = CURRENT_TIMESTAMP
            WHERE telegram_id = ?
        """, (amount, telegram_id))
        
        conn.commit()
        conn.close()
        
        return self.get_user(telegram_id)
    
    def add_rating(self, telegram_id: int, amount: int) -> Dict:
        """Добавляет рейтинг пользователю."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE users
            SET rating = rating + ?, last_active = CURRENT_TIMESTAMP
            WHERE telegram_id = ?
        """, (amount, telegram_id))
        
        conn.commit()
        conn.close()
        
        return self.get_user(telegram_id)
    
    def get_leaderboard(self, limit: int = 50) -> List[Dict]:
        """Получает топ пользователей по рейтингу."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT telegram_id, name, tokens, rating, avatar_url
            FROM users
            ORDER BY rating DESC, tokens DESC
            LIMIT ?
        """, (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]

    def delete_user(self, telegram_id: int) -> bool:
        """Удаляет пользователя из базы данных."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM users
            WHERE telegram_id = ?
        """, (telegram_id,))
        
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        return deleted
