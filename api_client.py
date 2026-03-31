"""
API клиент для работы с бэкендом Campus Navigator.
"""

import requests
from typing import Optional, Dict, List


class CampusAPI:
    def __init__(self, base_url: str = "https://hyxyablgkjtoxcxnurkk.supabase.co"):
        self.base_url = base_url
        self.key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eHlhYmxna2p0b3hjeG51cmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODE5NjksImV4cCI6MjA4NDc1Nzk2OX0._3HQYSymZ2ArXIN143gAiwulCL1yt7i5fiHaTd4bp5U"
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    
    def get_user(self, telegram_id: int) -> Optional[Dict]:
        """Получить данные пользователя."""
        try:
            response = requests.get(f"{self.base_url}/api/user/{telegram_id}")
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                return None
            else:

                return None
        except Exception as e:

            return None
    
    def create_user(self, telegram_id: int, name: str, avatar_url: Optional[str] = None) -> Optional[Dict]:
        """Создать или обновить пользователя."""
        try:
            data = {
                "telegram_id": telegram_id,
                "name": name,
                "avatar_url": avatar_url
            }
            response = requests.post(f"{self.base_url}/api/user", json=data)
            if response.status_code == 200:
                return response.json()
            else:

                return None
        except Exception as e:

            return None
    
    def add_tokens(self, telegram_id: int, amount: int) -> Optional[Dict]:
        """Добавить токены пользователю."""
        try:
            data = {
                "telegram_id": telegram_id,
                "amount": amount
            }
            response = requests.post(f"{self.base_url}/api/user/tokens", json=data)
            if response.status_code == 200:
                return response.json()
            else:

                return None
        except Exception as e:

            return None
    
    def add_rating(self, telegram_id: int, amount: int) -> Optional[Dict]:
        """Добавить рейтинг пользователю."""
        try:
            data = {
                "telegram_id": telegram_id,
                "amount": amount
            }
            response = requests.post(f"{self.base_url}/api/user/rating", json=data)
            if response.status_code == 200:
                return response.json()
            else:

                return None
        except Exception as e:

            return None
    
    def get_leaderboard(self, limit: int = 50) -> List[Dict]:
        """Получить таблицу лидеров."""
        try:
            response = requests.get(f"{self.base_url}/api/leaderboard?limit={limit}")
            if response.status_code == 200:
                return response.json()
            else:

                return []
        except Exception as e:

            return []


# Пример использования
if __name__ == "__main__":
    api = CampusAPI()
    
    # Получить пользователя
    user = api.get_user(123456789)
    if user:



    else:

    # Создать пользователя
    new_user = api.create_user(123456789, "Тестовый пользователь")

    # Добавить токены
    updated = api.add_tokens(123456789, 100)

    # Добавить рейтинг
    updated = api.add_rating(123456789, 50)

    # Получить таблицу лидеров
    leaders = api.get_leaderboard(10)

    for i, leader in enumerate(leaders, 1):
