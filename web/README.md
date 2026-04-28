# Пользовательская панель (Web)

Веб-приложение City Quest для участников: каталог квестов, прохождение чекпоинтов с геолокацией, командная игра, рейтинг, достижения и создание собственных квестов с отправкой на модерацию. Реализовано на **Next.js 16** (App Router), **React 19**, **TanStack Query**, **Tailwind CSS**, **shadcn/ui** и **MapLibre GL** поверх **OpenStreetMap**.

**Важно:** этот репозиторий содержит **только frontend** пользовательской панели. Для работы нужен запущенный **backend API** (см. ниже). Модерация контента живёт в отдельной [админ-панели](../admin).

---

## Содержание

- [Стек](#стек)
- [Что нужно для запуска](#что-нужно-для-запуска)
- [Backend](#backend)
- [Локальный запуск (без Docker)](#локальный-запуск-без-docker)
- [Запуск в Docker](#запуск-в-docker)
- [Переменные окружения](#переменные-окружения)
- [Демо-аккаунт](#демо-аккаунт)
- [Публичный деплой](#публичный-деплой)
- [Документация в репозитории](#документация-в-репозитории)
- [Скрипты](#скрипты)

---

## Стек

| Область         | Технологии |
|-----------------|------------|
| UI и маршруты   | Next.js 16 (App Router), React 19 |
| Данные и кэш    | TanStack Query, Zustand |
| Сеть            | Axios, собственный HTTP-клиент с refresh-токенами |
| Стили           | Tailwind CSS 4, компоненты на базе Radix (shadcn/ui) |
| Карты           | MapLibre GL + растровые тайлы OpenStreetMap |
| Геолокация      | Browser Geolocation API через хук `use-geolocation` |
| Формы           | react-hook-form + zod |
| Уведомления     | sonner (toast) |
| Локализация     | собственный i18n-провайдер (ru/en/fr/hi) |
| Язык            | TypeScript |

Подробнее о слоях и вызовах API: [docs/architecture.md](./docs/architecture.md), [docs/environment-and-api.md](./docs/environment-and-api.md).

---

## Что нужно для запуска

- **Node.js** 20+
- **pnpm** 10 (удобно через Corepack: `corepack enable` и `corepack prepare pnpm@10 --activate`)
- Рабочий **backend** по адресу, который вы укажете в `NEXT_PUBLIC_API_URL` (по умолчанию ожидается `http://localhost:8000`)
- Доступ к интернету для загрузки тайлов OpenStreetMap (`*.tile.openstreetmap.org`)

---

## Backend

Web-панель обращается к REST API: авторизация, каталог и создание квестов, прохождение, команды, рейтинг, достижения. Сервер нужно поднять **отдельно** — из репозитория вашего backend-проекта или общей инструкции команды.

- Убедитесь, что API доступен по сети с той машины, где запущен frontend (для Docker на хосте часто нужен не `localhost` внутри контейнера, а IP хоста или `host.docker.internal`).
- Файловые поля квестов и достижений отдаются как `/api/file/{fileId}`, обложки квестов без своего файла подставляются с `picsum.photos` (см. `entities/quest/lib/cover-image.ts`).
- Аккаунт с ролью `moderator` в этой панели **не работает** — после успешного логина клиент отзывает токен и редиректит на `/access_denied`. Модераторы заходят в админ-панель.

Если frontend и backend на одной машине вне Docker: достаточно `NEXT_PUBLIC_API_URL=http://localhost:8000` (или ваш порт).

---

## Локальный запуск (без Docker)

```bash
cp .env.example .env
# при необходимости измените NEXT_PUBLIC_API_URL — адрес вашего API

pnpm install
pnpm dev
```

Интерфейс: [http://localhost:3000](http://localhost:3000).

Продакшен-сборка на машине без контейнера:

```bash
pnpm build
pnpm start
```

По умолчанию Next.js слушает порт **3000** (`pnpm start` без дополнительных флагов).

---

## Запуск в Docker

Переменная `NEXT_PUBLIC_*` встраивается в клиентский бандл на этапе **сборки** образа — задавайте URL API при `docker build` / `docker compose build`, а не только при `run`, если меняете API.

### Production-образ

Сборка и запуск вручную (порт контейнера **3000**, наружу также **3000**):

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
  -t city-quest-web .

docker run --rm -p 3000:3000 city-quest-web
```

Через Compose из корня репозитория (поднимет одновременно `web` и `admin`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 docker compose build
docker compose up
```

Откройте [http://localhost:3000](http://localhost:3000) для пользовательской панели и [http://localhost:3001](http://localhost:3001) для админ-панели.

### Режим разработки в контейнере

Поднимает `next dev` с монтированием исходников и отдельным volume для `node_modules`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 docker compose -f docker-compose.dev.yml up --build
```

После старта интерфейс на [http://localhost:3000](http://localhost:3000). Для файловых систем вроде Docker Desktop включён polling изменений (`WATCHPACK_POLLING` / `CHOKIDAR_USEPOLLING`).

---

## Переменные окружения

| Переменная              | Описание |
|-------------------------|----------|
| `NEXT_PUBLIC_API_URL`   | Базовый URL API. Если не задан — `http://localhost:8000`. Завершающий `/` отбрасывается. Значение подставляется на этапе сборки (`NEXT_PUBLIC_*`). |

Шаблон: [.env.example](./.env.example).

---

## Демо-аккаунт

Демо-аккаунт обычного пользователя должен быть создан на стороне **backend** с ролью `user`. Регистрация открыта — можно создать новый аккаунт прямо из формы `/register` (email, никнейм, дата рождения, пароль ≥ 8 символов).

Если вход не проходит, проверьте: доступность API по `NEXT_PUBLIC_API_URL`, корректность учётных данных, отсутствие блокировок CORS/firewall между браузером и API.

---

## Публичный деплой

Если приложение развёрнуто публично, добавьте сюда актуальную ссылку:

**URL:** _(укажите после публикации, например `https://…`)_

Убедитесь, что при сборке production-образа или CI в `NEXT_PUBLIC_API_URL` попал адрес того же API, который доступен браузеру пользователя (обычно HTTPS-домен backend, а не внутренний адрес контейнера).

---

## Документация в репозитории

| Файл | Содержание |
|------|------------|
| [docs/architecture.md](./docs/architecture.md) | Архитектура frontend, FSD-слои, маршруты |
| [docs/environment-and-api.md](./docs/environment-and-api.md) | Переменные, HTTP-клиент, пути API |

Контракт API также можно сверить с [openapi.json](../openapi.json) в корне репозитория.

---

## Скрипты

| Команда       | Назначение              |
|---------------|-------------------------|
| `pnpm dev`    | Режим разработки        |
| `pnpm build`  | Продакшен-сборка        |
| `pnpm start`  | Запуск собранного приложения |
| `pnpm lint`   | Проверка ESLint         |
