# Архитектура

Ориентация на [Feature-Sliced Design](https://feature-sliced.design/): зависимости сверху вниз — от `app` к `shared`.

## Слои

| Слой | Каталог | Содержимое |
|------|---------|------------|
| App | `src/app` | Роутинг Next.js, `layout`, `providers`, `globals.css` |
| Widgets | `src/widgets` | Крупные блоки: панель, детальный вид квеста |
| Features | `src/features` | `auth`, `nav-tabs`, `quests`, `reports`, диалог причины отказа в `reject/` |
| Entities | `src/entities` | Типы и мелкие хелперы: `user`, `quest`, `report` |
| Shared | `src/shared` | Axios-клиент, конфиг env, UI-kit, Zustand, TanStack Query, i18n |

Отдельных папок `processes` / каноничного слоя `pages` нет: страницы лежат в `src/app`.

## Импорты

Алиас `@/*` → `src/*` (`tsconfig.json`).

## Данные

- Сервер: хуки с TanStack Query рядом с фичами, запросы через `shared/api/http-client`.
- Авторизация: `shared/store/auth-store.ts`, refresh в `shared/lib/refresh-token-storage.ts`, настройка интерцептора в `src/app/providers.tsx`.

Детали HTTP — [environment-and-api.md](./environment-and-api.md).
