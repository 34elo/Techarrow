# Архитектура

Ориентация на [Feature-Sliced Design](https://feature-sliced.design/): зависимости сверху вниз — от `app` к `shared`. Любой нижний слой не знает о вышестоящих.

## Слои

| Слой | Каталог | Содержимое |
|------|---------|------------|
| App | `src/app` | Роутинг Next.js, `layout`, `providers`, `globals.css`, общие `error.tsx`/`not-found.tsx`/`access_denied/page.tsx` |
| Widgets | `src/widgets` | Крупные блоки страниц: лента квестов, страница квеста, формы создания, страницы соло-/командного прохождения, рейтинг, профиль, команда, достижения |
| Features | `src/features` | `auth`, `quests`, `quest-form`, `quest-run`, `team-quest-run`, `quest-favorites`, `checkpoint-builder`, `teams`, `leaderboard`, `profile`, `achievements` |
| Entities | `src/entities` | Доменные типы и хелперы: `user`, `quest`, `quest-run`, `team-quest-run`, `checkpoint`, `team`, `leaderboard`, `achievement` |
| Shared | `src/shared` | Axios-клиент, конфиг env, UI-kit на shadcn/ui + Radix, Zustand-стор авторизации, TanStack Query helpers, i18n, MapLibre-обёртка, геолокация, `refresh-token-storage` |

Отдельных папок `processes` / каноничного слоя `pages` нет: страницы лежат в `src/app`.

## Маршруты

Группы App Router используются как контейнеры с гардами:

| Группа | Гард | Перечень роутов |
|--------|------|-----------------|
| `(auth)` | `GuestGuard` (если уже залогинен — на `/`) | `/login`, `/register` |
| `(main)` | `AuthGuard` (требует роль `user`; иначе `/access_denied`) | `/`, `/quests/[id]`, `/quests/[id]/run`, `/quests/[id]/team-run`, `/quests/my`, `/quests/new`, `/quests/favorites`, `/leaderboard`, `/team`, `/profile`, `/profile/achievements`, `/profile/history` |
| Корневые | без гарда | `/access_denied`, `/error.tsx`, `/not-found.tsx` |

`/access_denied` — единая страница 403 для модераторов, попавших не в ту панель, и для тех, у кого протух токен на «не-юзера».

## Импорты

Алиас `@/*` → `src/*` (`tsconfig.json`).

## Данные

- **Сервер:** TanStack Query, хуки рядом с фичами; запросы через `shared/api/http-client`. Ключи кэша описаны в `shared/lib/react-query/query-keys.ts`. Для бесконечных списков есть `fetch-all-next-pages` и `infinite-list-footer`.
- **Авторизация:** `shared/store/auth-store.ts` (Zustand + persist), refresh-токен — отдельным ключом в `shared/lib/refresh-token-storage.ts`, настройка интерцепторов — в `src/app/providers.tsx`.
- **Ролевой доступ:** только роль `"user"` допускается в этой панели. Защита трёхслойная — мутация `useLogin`, defensive-guard в `setAuth`/`setUser` стора, проверка при гидратации persist и `AuthGuard`. Подробнее ниже.

## Авторизация и роли

1. На `useLogin` клиент проверяет `data.user.role === "user"`. Если роль другая — best-effort `POST /api/auth/logout` и `throw ModeratorNotAllowedError`. Страница логина ловит этот класс и редиректит на `/access_denied`.
2. `auth-store.setAuth/setUser/merge` дополнительно отбрасывают любого не-юзера: даже если стор позовут в обход хука или в `localStorage` останется stale-сессия с другой ролью, состояние сбросится.
3. `AuthGuard` (см. `features/auth/ui/auth-guard.tsx`) при гидратации сверяет роль и при несовпадении вызывает `clearAuth()` и `router.replace("/access_denied")`.
4. Хранилища намеренно разнесены с админкой: ключи `localStorage` — `"auth"` для persist-стора и `"web_refresh_token"` для refresh-токена. У админ-панели — `"admin-auth"` и `"admin_refresh_token"`.

## Карты и геолокация

- Базовый компонент — `shared/ui/map/maplibre-map.tsx`. Используется растровый стиль OpenStreetMap (3 SD-CDN endpoints). Поддерживает три варианта маркеров (`default`/`active`/`passed`), label с номером чекпоинта, popup, режим picker для перетаскивания одного маркера, отображение пользовательской позиции с кругом точности.
- Геолокация — `shared/lib/geolocation/use-geolocation.ts`. Тонкая обёртка над `navigator.geolocation` с режимами одноразового запроса/`watchPosition`, авто-запросом, маппингом ошибок на i18n-ключи. SSR-safe.

## Локализация

`shared/i18n/translations.ts` хранит словари для `ru` (default), `en`, `fr`, `hi`. Провайдер — `shared/i18n/i18n-provider.tsx` (`t(key, params?)` с подстановкой параметров и плюрализацией для русского, см. `plural.ts`). Переключатель — `language-switcher.tsx`.

Детали HTTP-клиента и список путей API — [environment-and-api.md](./environment-and-api.md).
