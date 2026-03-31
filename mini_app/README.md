# Campus Navigator Mini App

Telegram Mini App для навигации по кампусу.

## Структура

```
mini_app/
├── backend/
│   ├── main.py           # FastAPI сервер
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── routes/               # Картинки маршрутов (1-1.png, 1-2.png, ...)
```

## Запуск локально

1. Скопируй картинки маршрутов:
```bash
cp -r ../routes ./routes
# или на Windows:
xcopy ..\routes routes\ /E /I
```

2. Установи зависимости:
```bash
cd backend
pip install -r requirements.txt
```

3. Запусти сервер:
```bash
uvicorn main:app --reload --port 8000
```

4. Открой http://localhost:8000

## Деплой

### Вариант 1: Railway / Render
1. Залей код на GitHub
2. Подключи репозиторий к Railway/Render
3. Укажи команду запуска: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### Вариант 2: VPS
```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 443 --ssl-keyfile key.pem --ssl-certfile cert.pem
```

## Регистрация в Telegram

1. Открой @BotFather
2. Выбери своего бота
3. Bot Settings → Menu Button → Configure menu button
4. Введи URL твоего Mini App (нужен HTTPS!)
5. Или: Bot Settings → Menu Button → Web App Info

## Интеграция с ботом

Добавь кнопку в бота для открытия Mini App:

```python
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

keyboard = [[
    InlineKeyboardButton(
        "🗺️ Открыть навигатор",
        web_app=WebAppInfo(url="https://your-domain.com")
    )
]]
```
