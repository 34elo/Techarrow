# Окружение и API

## Переменные

Источник: `src/shared/config/env.ts`, шаблон: `.env.example`.

| Переменная | Обязательность | Поведение |
|------------|----------------|-----------|
| `NEXT_PUBLIC_API_URL` | Нет | Базовый URL API. Если не задано — `http://localhost:8000`. Завершающий `/` отбрасывается. |

Клиентский код получает это значение на этапе сборки Next.js (`NEXT_PUBLIC_*`). Для Docker production-образа задавайте его при **`docker compose build`** (см. корневой README).

## HTTP-клиент

Файл: `src/shared/api/http-client.ts`.

- Базовый адрес: `env.apiBaseUrl`.
- Если в Zustand есть access-токен — заголовок `Authorization: Bearer …`.
- Ответ **401**: одна попытка обновить пару токенов через `POST /api/auth/refresh` с телом `{ refresh_token }`; при успехе повтор запроса; при ошибке — очистка сессии, сброс кэша запросов, переход на `/login`.
- Запросы к `/api/auth/login`, `/api/auth/logout` и сам `/api/auth/refresh` не проходят через повтор после refresh так же, как остальные (см. интерцептор).

## Пути, которые вызывает этот клиент

### Авторизация

`src/features/auth/api/auth-service.ts`

| Метод | Путь |
|-------|------|
| POST | `/api/auth/login` |
| POST | `/api/auth/refresh` |
| POST | `/api/auth/logout` |
| GET | `/api/auth/me` |

### Квесты и модерация

`src/features/quests/api/quests-service.ts`

| Метод | Путь |
|-------|------|
| GET | `/api/moderation/quests` |
| GET | `/api/quests` |
| GET | `/api/quests/{id}` |
| POST | `/api/moderation/quests/{id}/publish` |
| POST | `/api/moderation/quests/{id}/reject` |
| DELETE | `/api/moderation/quests/{id}` |

### Жалобы

`src/features/reports/api/reports-service.ts`

| Метод | Путь |
|-------|------|
| GET | `/api/moderation/complaints` |
| DELETE | `/api/moderation/complaints/{id}` |

Обложки квестов без своего файла подставляются через `https://picsum.photos/…` (см. `getQuestCoverImageUrl` в `entities/quest`).

## Ошибки

Класс `ApiError`: текст из поля `detail` (строка или массив с `msg`), иначе `message` ответа.
