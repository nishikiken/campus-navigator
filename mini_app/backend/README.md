# Campus Navigator Backend

Backend API для Campus Navigator Mini App на FastAPI.

## Технологии
- FastAPI
- SQLite
- Uvicorn

## API Endpoints

### Пользователи
- `GET /api/user/{telegram_id}` - получить данные пользователя
- `POST /api/user` - создать/обновить пользователя
- `POST /api/user/tokens` - добавить токены
- `POST /api/user/rating` - добавить рейтинг
- `GET /api/leaderboard` - получить таблицу лидеров

### Маршруты
- `GET /api/entrances` - список входов
- `GET /api/buildings` - список корпусов
- `GET /api/route/{entrance}/{building}` - получить маршрут

## Локальный запуск

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

## Деплой на Back4App

1. Создать новый репозиторий на GitHub
2. Загрузить файлы бэкенда
3. В Back4App выбрать "Import GitHub Repo"
4. Выбрать репозиторий
5. Back4App автоматически задеплоит используя Dockerfile
