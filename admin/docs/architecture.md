# Архитектура

Ориентация на [Feature-Sliced Design](https://feature-sliced.design/): зависимости сверху вниз — от `app` к `shared`. Любой нижний слой не знает о вышестоящих.

## Слои

| Слой | Каталог | Содержимое |
|------|---------|------------|
| App | `src/app` | Роутинг Next.js, `layout`, `providers`, `globals.css`, общие `error.tsx`/`not-found.tsx`/`access_denied/page.tsx` |
| Widgets | `src/widgets` | `panel-layout`, `panel-header`, `quest-detail` (карточки обложки, общей информации и чекпоинтов) |
| Features | `src/features` | `auth` (логин и гард), `nav-tabs`, `quests` (очередь модерации, карточка), `reports` (жалобы), `reject` (диалог отказа с причиной) |
| Entities | `src/entities` | Доменные типы и хелперы: `user`, `quest`, `report` |
| Shared | `src/shared` | Axios-клиент, конфиг env, UI-kit на shadcn/ui + Radix, Zustand-стор авторизации, TanStack Query helpers, i18n, `refresh-token-storage` |

Отдельных папок `processes` / каноничного слоя `pages` нет: страницы лежат в `src/app`.

## Маршруты

App Router использует две группы:

| Группа | Гард | Перечень роутов |
|--------|------|-----------------|
| `(auth)` | `GuestGuard` (если уже залогинен — на `/`) | `/login` |
| `(dashboard)` | `AuthGuard` (требует роль `moderator`; иначе `/access_denied`) | `/`, `/quests`, `/quests/[id]`, `/reports` |
| Корневые | без гарда | `/access_denied`, `/error.tsx`, `/not-found.tsx` |

`/access_denied` — единая страница 403 для пользователей, попавших не в ту панель.

## Импорты

Алиас `@/*` → `src/*` (`tsconfig.json`).

## Данные

- **Сервер:** TanStack Query, хуки рядом с фичами; запросы через `shared/api/http-client`. Ключи кэша описаны в `shared/lib/react-query/query-keys.ts`. Бесконечные списки квестов и жалоб используют `fetch-all-next-pages` и компонент `infinite-list-footer`.
- **Авторизация:** `shared/store/auth-store.ts` (Zustand + persist), refresh-токен — отдельным ключом в `shared/lib/refresh-token-storage.ts`, настройка интерцепторов — в `src/app/providers.tsx`.
- **Ролевой доступ:** только роль `"moderator"` допускается в этой панели. Защита трёхслойная — мутация `useLogin`, defensive-guard в `setAuth`/`setUser` стора, проверка при гидратации persist и `AuthGuard`.

## Авторизация и роли

1. На `useLogin` клиент проверяет `data.user.role === "moderator"`. Если роль другая — best-effort `POST /api/auth/logout` и `throw NotModeratorError`. Страница логина ловит этот класс и редиректит на `/access_denied`.
2. `auth-store.setAuth/setUser/merge` дополнительно отбрасывают любого не-модератора: даже если стор позовут в обход хука или в `localStorage` останется stale-сессия с другой ролью, состояние сбросится.
3. `AuthGuard` (см. `features/auth/ui/auth-guard.tsx`) при гидратации сверяет роль и при несовпадении вызывает `clearAuth()` и `router.replace("/access_denied")`.
4. Хранилища намеренно разнесены с web-панелью: ключи `localStorage` — `"admin-auth"` для persist-стора и `"admin_refresh_token"` для refresh-токена. У web-панели — `"auth"` и `"web_refresh_token"`.

## Локализация

`shared/i18n/translations.ts` хранит словари для `ru` (default), `en`, `fr`, `hi`. Провайдер — `shared/i18n/i18n-provider.tsx` (`t(key, params?)` с подстановкой параметров и плюрализацией для русского). Переключатель — `language-switcher.tsx`.

## UI и адаптивность

- Базовая раскладка панели — `widgets/panel-layout.tsx` + `widgets/panel-header.tsx`.
- Карточка квеста на `/quests/[id]` рендерится в две колонки на `lg+` (общая информация слева, чекпоинты справа), стекается на меньших экранах. Длинные ответы и описания чекпоинтов корректно ломаются (`break-words` / `break-all` для mono-полей) — см. `widgets/quest-detail/ui/quest-detail-checkpoints-card.tsx`.

Детали HTTP-клиента и список путей API — [environment-and-api.md](./environment-and-api.md).
