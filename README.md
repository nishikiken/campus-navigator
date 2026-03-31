# 🎓 Campus Navigator Bot

Telegram бот-навигатор для ПГНИУ с системой рейтинга и токенов.

## 📱 Возможности

- 🗺️ Навигация по корпусам университета
- 🍽️ Карта мест питания на кампусе
- 🏆 Система рейтинга пользователей
- 🪙 Токены и достижения
- 🎨 Кастомизация профиля
- 📊 Таблица лидеров

## 🛠️ Технологии

- **Backend**: Python, aiogram
- **Frontend**: HTML, CSS, JavaScript
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Telegram Mini Apps

## 📦 Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/YOUR_USERNAME/campus_bot.git
cd campus_bot
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Настройте переменные окружения (создайте `.env`):
```env
BOT_TOKEN=your_telegram_bot_token
MINI_APP_URL=https://your-username.github.io/campus-navigator-bot/
```

Или скопируйте `.env.example` и заполните:
```bash
cp .env.example .env
# Отредактируйте .env своими значениями
```

4. Запустите бота:
```bash
python bot.py
```

## 📁 Структура проекта

```
campus_bot/
├── bot.py                 # Основной файл бота
├── api_client.py          # API клиент для работы с backend
├── supabase_client.py     # Клиент Supabase
├── admin_panel.py         # CLI админ-панель
├── mini_app/
│   ├── frontend/          # Telegram Mini App интерфейс
│   │   ├── index.html
│   │   ├── app.js
│   │   ├── style.css
│   │   └── map.html       # Интерактивная карта
│   └── backend/           # FastAPI backend (опционально)
└── admin_web/             # Web админ-панель
```

## 🎮 Использование

### Для пользователей
1. Найдите бота в Telegram: `@your_bot_name`
2. Нажмите `/start`
3. Используйте навигацию для поиска корпусов и мест питания
4. Зарабатывайте токены и рейтинг

### Для администраторов
Запустите админ-панель:
```bash
python admin_panel.py
```

Или используйте web-интерфейс в папке `admin_web/`

## 🗄️ База данных

Проект использует Supabase. Основные таблицы:
- `users` - пользователи
- `customization` - кастомизация профилей
- `shop_items` - предметы в магазине

## 📝 Лицензия

MIT License

## 👥 Авторы

Проект разработан для ПГНИУ (Пермский государственный национальный исследовательский университет)

## 🤝 Вклад

Pull requests приветствуются! Для крупных изменений сначала откройте issue для обсуждения.
