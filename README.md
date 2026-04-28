# City Quest Platform — Frontend

Платформа городских квестов с геолокацией: пользователи проходят и создают маршруты с чекпоинтами, играют в одиночку и командами, соревнуются в рейтинге; модераторы проверяют контент и обрабатывают жалобы. Этот репозиторий содержит **только frontend-часть** — два независимых Next.js-приложения с общим backend API.

---

## Состав репозитория

| Папка | Что это | Порт по умолчанию | Документация |
|-------|---------|-------------------|--------------|
| [`web/`](./web) | Пользовательская панель: каталог, прохождение, создание квестов, команды, рейтинг, профиль | `3000` | [web/README.md](./web/README.md) · [docs/architecture.md](./web/docs/architecture.md) · [docs/environment-and-api.md](./web/docs/environment-and-api.md) |
| [`admin/`](./admin) | Панель модерации: очередь заявок, одобрение/отклонение, жалобы | `3001` | [admin/README.md](./admin/README.md) · [docs/architecture.md](./admin/docs/architecture.md) · [docs/environment-and-api.md](./admin/docs/environment-and-api.md) |
| `docker-compose.yml` | Production-оркестрация двух приложений | — | — |
| `docker-compose.dev.yml` | Dev-режим с hot-reload и volume-монтированием исходников | — | — |
| `openapi.json` | Контракт REST API | — | — |

Каждое приложение полностью самостоятельно (своя сборка, свой `package.json`), но обращается к одному и тому же backend.

---

## Главное про продукт

- **Доменная модель:** пользователи (`user`/`moderator`), команды, квесты со статусной моделью `draft → moderation → published / rejected → archived`, чекпоинты с задачами (кодовое слово или multiple choice) и геокоординатами, сессии прохождения с прогрессом, рейтинг и достижения.
- **Геолокация:** карты на MapLibre GL поверх растровых тайлов OpenStreetMap; запрос координат пользователя через Browser Geolocation API.
- **Команды:** создание команды с инвайт-кодом, присоединение по коду, кик участников, отдельный командный рейтинг.
- **Локализация:** четыре языка — `ru` (по умолчанию), `en`, `fr`, `hi`.
- **Безопасность ролей:** web и admin — отдельные SPA с независимыми ключами `localStorage`. Модератор не может пользоваться пользовательской панелью, обычный пользователь не может попасть в админку. Подробнее — [ниже](#изоляция-ролей-между-панелями).

---

## Стек

| Область         | web                              | admin                             |
|-----------------|----------------------------------|-----------------------------------|
| UI / роутинг    | Next.js 16 (App Router), React 19 | Next.js 16 (App Router), React 19 |
| Состояние       | TanStack Query, Zustand          | TanStack Query, Zustand           |
| Стили           | Tailwind 4, shadcn/ui (Radix)    | Tailwind 4, shadcn/ui (Radix)     |
| Сеть            | Axios, refresh-токены            | Axios, refresh-токены             |
| Карты           | MapLibre GL + OSM                | —                                 |
| Формы           | react-hook-form + zod            | react-hook-form + zod             |
| Уведомления     | sonner                           | sonner                            |
| Язык            | TypeScript                       | TypeScript                        |

Архитектура обеих панелей построена по [Feature-Sliced Design](https://feature-sliced.design/) (`app → widgets → features → entities → shared`).

---

## Быстрый старт

Перед запуском frontend поднимите backend и убедитесь, что он доступен по адресу, который вы укажете в `NEXT_PUBLIC_API_URL` (по умолчанию — `http://localhost:8000`). Контракт API сверьте с `openapi.json`.

### Через Docker Compose (рекомендуется для жюри)

#### Production-режим

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 docker compose build
docker compose up -d
```

- Пользовательская панель: <http://localhost:3000>
- Админ-панель: <http://localhost:3001>

Остановить и снять контейнеры:

```bash
docker compose down
```

#### Dev-режим (hot reload)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 docker compose -f docker-compose.dev.yml up --build
```

Те же порты. Исходники смонтированы внутрь контейнеров; для систем без inotify включён polling (`WATCHPACK_POLLING`, `CHOKIDAR_USEPOLLING`).

```bash
docker compose -f docker-compose.dev.yml down
```

> Переменные `NEXT_PUBLIC_*` запекаются в клиентский бандл на этапе сборки. Если меняете `NEXT_PUBLIC_API_URL`, **пересобирайте образы**, а не только перезапускайте.

### Без Docker (локально)

В каждой папке отдельно:

```bash
cd web      # или admin
cp .env.example .env
pnpm install
pnpm dev
```

Нужны Node.js 20+ и pnpm 10 (`corepack enable && corepack prepare pnpm@10 --activate`).

---

## Изоляция ролей между панелями

Backend выписывает токены для **любой** валидной учётной записи — поэтому ролевой контроль прокидан на клиенте обеих панелей, на нескольких уровнях.

| Сценарий | Что происходит |
|----------|----------------|
| Модератор пытается войти в `/web` | `useLogin` ловит роль `moderator`, отзывает только что выданный refresh-токен (`POST /api/auth/logout`), бросает `ModeratorNotAllowedError` — страница редиректит на `/access_denied`. |
| Обычный пользователь пытается войти в `/admin` | `useLogin` бросает `NotModeratorError`, токен отзывается, редирект на `/access_denied`. |
| Stale-сессия с «чужой» ролью в `localStorage` | При гидратации persist-стор отбрасывает не подходящего пользователя; `AuthGuard` дополнительно вызывает `clearAuth()` и кидает на `/access_denied`. |
| Перенос токена между панелями | Невозможен: ключи `localStorage` разные — `web_refresh_token`/`auth` против `admin_refresh_token`/`admin-auth`. |

Дополнительные слои защиты: defensive-проверки в `auth-store.setAuth/setUser` обеих панелей, единая страница 403 — `/access_denied` с возвратом ко входу.

> **Важно:** клиентские проверки — это удобство для пользователя (понятная ошибка вместо «доступ запрещён»). Авторитетный контроль ролей выполняется на **backend**: каждый защищённый эндпоинт обязан проверять роль из токена.

---

## Куда смотреть в коде

- **HTTP-клиент и refresh:** `web/src/shared/api/http-client.ts`, `admin/src/shared/api/http-client.ts`.
- **Стор авторизации и persist:** `web/src/shared/store/auth-store.ts`, `admin/src/shared/store/auth-store.ts`.
- **Гарды роутов:** `web/src/features/auth/ui/auth-guard.tsx`, `admin/src/features/auth/ui/auth-guard.tsx`, `web/src/features/auth/ui/guest-guard.tsx`.
- **Карта и геолокация:** `web/src/shared/ui/map/maplibre-map.tsx`, `web/src/shared/lib/geolocation/use-geolocation.ts`.
- **Сервисы API:** `*/features/*/api/*-service.ts` в каждой панели — там полные списки путей (см. также `docs/environment-and-api.md` в каждой панели).
- **Локализация:** `*/src/shared/i18n/translations.ts`.

---

## Документация по разделам

- Пользовательская панель: [`web/README.md`](./web/README.md) → [архитектура](./web/docs/architecture.md), [окружение и API](./web/docs/environment-and-api.md).
- Админ-панель: [`admin/README.md`](./admin/README.md) → [архитектура](./admin/docs/architecture.md), [окружение и API](./admin/docs/environment-and-api.md).
- Контракт API: [`openapi.json`](./openapi.json).
