# Руководство администратора Campus Navigator

## Установка зависимостей

```bash
pip install -r requirements.txt
```

## Способы управления пользователями

### 1. Админ-панель (рекомендуется)

Запустите интерактивную админ-панель:

```bash
python admin_panel.py
```

**Возможности:**
- Просмотр данных пользователя
- Создание/обновление пользователя
- Добавление токенов
- Добавление рейтинга
- Просмотр таблицы лидеров

### 2. Через Python скрипт

Используйте `api_client.py` в своих скриптах:

```python
from api_client import CampusAPI

api = CampusAPI()

# Получить пользователя
user = api.get_user(123456789)
print(user)

# Добавить рейтинг
api.add_rating(123456789, 100)

# Добавить токены
api.add_tokens(123456789, 50)
```

### 3. Через curl (командная строка)

#### Получить пользователя
```bash
curl https://campusnavigatorapi1-jx66tg3z.b4a.run/api/user/123456789
```

#### Создать пользователя
```bash
curl -X POST https://campusnavigatorapi1-jx66tg3z.b4a.run/api/user \
  -H "Content-Type: application/json" \
  -d "{\"telegram_id\": 123456789, \"name\": \"Тестовый пользователь\"}"
```

#### Добавить токены
```bash
curl -X POST https://campusnavigatorapi1-jx66tg3z.b4a.run/api/user/tokens \
  -H "Content-Type: application/json" \
  -d "{\"telegram_id\": 123456789, \"amount\": 100}"
```

#### Добавить рейтинг
```bash
curl -X POST https://campusnavigatorapi1-jx66tg3z.b4a.run/api/user/rating \
  -H "Content-Type: application/json" \
  -d "{\"telegram_id\": 123456789, \"amount\": 50}"
```

#### Получить таблицу лидеров
```bash
curl https://campusnavigatorapi1-jx66tg3z.b4a.run/api/leaderboard
```

### 4. Через Postman или Insomnia

Импортируйте следующие endpoints:

**Base URL:** `https://campusnavigatorapi1-jx66tg3z.b4a.run`

**Endpoints:**
- `GET /api/user/{telegram_id}` - получить пользователя
- `POST /api/user` - создать/обновить пользователя
- `POST /api/user/tokens` - добавить токены
- `POST /api/user/rating` - добавить рейтинг
- `GET /api/leaderboard` - получить таблицу лидеров

## Интеграция с ботом

Добавьте в свой бот (`bot.py`):

```python
from api_client import CampusAPI

api = CampusAPI()

# При старте бота создаем/обновляем пользователя
async def start(update, context):
    user = update.effective_user
    api.create_user(user.id, user.first_name, user.photo_url)
    # ...

# При выполнении задания добавляем рейтинг
async def complete_task(update, context):
    user_id = update.effective_user.id
    api.add_rating(user_id, 10)  # +10 рейтинга
    api.add_tokens(user_id, 5)   # +5 токенов
    # ...
```

## Примеры использования

### Массовое добавление рейтинга

```python
from api_client import CampusAPI

api = CampusAPI()

# Список пользователей для награждения
users = [123456789, 987654321, 555555555]

for user_id in users:
    api.add_rating(user_id, 100)
    print(f"Добавлено 100 рейтинга пользователю {user_id}")
```

### Экспорт статистики

```python
from api_client import CampusAPI
import json

api = CampusAPI()

leaders = api.get_leaderboard(100)

# Сохранить в JSON
with open('leaderboard.json', 'w', encoding='utf-8') as f:
    json.dump(leaders, f, ensure_ascii=False, indent=2)

print("Статистика сохранена в leaderboard.json")
```

## Где находится база данных?

База данных SQLite (`users.db`) находится на сервере Back4App. Для прямого доступа к ней нужно:

1. Зайти в Back4App Dashboard
2. Выбрать приложение `campus-navigator-api`
3. Перейти в раздел "Logs" или "Console"
4. Скачать файл `users.db` (если нужен бэкап)

## Бэкап базы данных

Рекомендуется периодически делать бэкап:

```python
from api_client import CampusAPI
import json
from datetime import datetime

api = CampusAPI()

# Получить всех пользователей через leaderboard
all_users = api.get_leaderboard(1000)

# Сохранить бэкап
backup_file = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
with open(backup_file, 'w', encoding='utf-8') as f:
    json.dump(all_users, f, ensure_ascii=False, indent=2)

print(f"Бэкап сохранен: {backup_file}")
```

## Мониторинг

Проверить работу API:

```bash
curl https://campusnavigatorapi1-jx66tg3z.b4a.run/
```

Должен вернуть:
```json
{"status": "ok", "message": "Campus Navigator API is running"}
```
