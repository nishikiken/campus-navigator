"""
Supabase API клиент для работы с Campus Navigator.
"""

import requests
from typing import Optional, Dict, List


class SupabaseClient:
    def __init__(
        self, 
        url: str = "https://hyxyablgkjtoxcxnurkk.supabase.co",
        key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eHlhYmxna2p0b3hjeG51cmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODE5NjksImV4cCI6MjA4NDc1Nzk2OX0._3HQYSymZ2ArXIN143gAiwulCL1yt7i5fiHaTd4bp5U"
    ):
        self.url = url
        self.key = key
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    
    def get_user(self, telegram_id: int) -> Optional[Dict]:
        """Получить данные пользователя."""
        try:
            response = requests.get(
                f"{self.url}/rest/v1/users?telegram_id=eq.{telegram_id}",
                headers=self.headers
            )
            if response.status_code == 200:
                data = response.json()
                return data[0] if data else None
            return None
        except Exception as e:

            return None
    
    def create_or_update_user(self, telegram_id: int, name: str, avatar_url: Optional[str] = None) -> Optional[Dict]:
        """Создать или обновить пользователя."""
        try:
            # Проверяем существует ли пользователь
            existing = self.get_user(telegram_id)
            
            data = {
                "telegram_id": telegram_id,
                "name": name,
                "avatar_url": avatar_url
            }
            
            if existing:
                # Обновляем
                response = requests.patch(
                    f"{self.url}/rest/v1/users?telegram_id=eq.{telegram_id}",
                    headers=self.headers,
                    json=data
                )
            else:
                # Создаем
                response = requests.post(
                    f"{self.url}/rest/v1/users",
                    headers=self.headers,
                    json=data
                )
            
            if response.status_code in [200, 201]:
                return response.json()[0] if response.json() else self.get_user(telegram_id)
            return None
        except Exception as e:

            return None
    
    def add_tokens(self, telegram_id: int, amount: int) -> Optional[Dict]:
        """Добавить токены пользователю."""
        try:
            user = self.get_user(telegram_id)
            if not user:
                return None
            
            new_tokens = user['tokens'] + amount
            
            response = requests.patch(
                f"{self.url}/rest/v1/users?telegram_id=eq.{telegram_id}",
                headers=self.headers,
                json={"tokens": new_tokens}
            )
            
            if response.status_code == 200:
                return self.get_user(telegram_id)
            return None
        except Exception as e:

            return None
    
    def add_rating(self, telegram_id: int, amount: int) -> Optional[Dict]:
        """Добавить рейтинг пользователю."""
        try:
            user = self.get_user(telegram_id)
            if not user:
                return None
            
            new_rating = user['rating'] + amount
            
            response = requests.patch(
                f"{self.url}/rest/v1/users?telegram_id=eq.{telegram_id}",
                headers=self.headers,
                json={"rating": new_rating}
            )
            
            if response.status_code == 200:
                return self.get_user(telegram_id)
            return None
        except Exception as e:

            return None
    
    def get_leaderboard(self, limit: int = 50) -> List[Dict]:
        """Получить таблицу лидеров."""
        try:
            response = requests.get(
                f"{self.url}/rest/v1/users?order=rating.desc,tokens.desc&limit={limit}",
                headers=self.headers
            )
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:

            return []
    
    def delete_user(self, telegram_id: int) -> bool:
        """Удалить пользователя."""
        try:
            response = requests.delete(
                f"{self.url}/rest/v1/users?telegram_id=eq.{telegram_id}",
                headers=self.headers
            )
            return response.status_code == 204
        except Exception as e:

            return False


# Пример использования
if __name__ == "__main__":
    api = SupabaseClient()
    
    # Создать пользователя
    user = api.create_or_update_user(123456789, "Тестовый пользователь")

    # Добавить токены
    updated = api.add_tokens(123456789, 100)

    # Добавить рейтинг
    updated = api.add_rating(123456789, 50)

    # Получить таблицу лидеров
    leaders = api.get_leaderboard(10)

    for i, leader in enumerate(leaders, 1):
