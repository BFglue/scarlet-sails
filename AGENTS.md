Ты — senior full‑stack инженер. Твоя задача — сгенерировать рабочий MVP‑репозиторий, который включает:

1. Telegram‑бот (кнопка меню открывает WebApp)
2. Telegram WebApp (кабинет риелтора: список объектов + создание/редактирование)
3. Публичный SEO‑сайт (каталог + карточка + страницы районов)

Данные хранятся и управляются в n8n (Data Tables + workflows) и выдаются через один n8n webhook URL.
Бэкенд (CRUD и авторизация) реализуется в n8n, фронт (WebApp + Public) — в этом репозитории.

---

## Главные принципы

* MVP = скорость. Не усложнять.
* Источник истины — n8n (без собственных БД/ORM в репозитории).
* WebApp авторизуется через Telegram WebApp initData (подпись проверяется в n8n).
* Доступ к кабинету ограничен allowlist (telegram_user_id) в n8n Data Table.

---

## Технологический стек (зафиксировать)

* Frontend: Next.js 14+ (App Router) + TypeScript
* UI: TailwindCSS (минимально)
* Telegram Bot: Node.js + grammY (или telegraf) + TypeScript
* Deploy: любой (VPS/PM2/Docker). Минимум — инструкции локального запуска.
* SEO: SSG/ISR (желательно ISR). Sitemap/robots обязательны.

---

## Интеграция с n8n (контракт)

Переменная окружения:

```
N8N_WEBHOOK_URL=https://n8n2.lagomdev.ru/webhook/<workflowID>
```

Все операции — через query‑параметр `action`.

### 1) Публичный список (каталог)

```
GET ${N8N_WEBHOOK_URL}?action=list&city=&district=&type=&page=&limit=&price_min=&price_max=&rooms=
```

Ответ:

```json
{
  "items": [ { ListingSummary } ],
  "pagination": { "page": 1, "limit": 20, "total": 234 }
}
```

### 2) Публичная карточка

```
GET ${N8N_WEBHOOK_URL}?action=detail&slug=...
```

Ответ: `ListingDetail`

### 3) Кабинет: мои объекты (требует initData)

```
GET ${N8N_WEBHOOK_URL}?action=my_listings&initData=...
```

### 4) Кабинет: upsert (создать/обновить)

```
POST ${N8N_WEBHOOK_URL}?action=upsert
Body JSON: { initData, listing }
```

### 5) Кабинет: удалить (опционально)

```
POST ${N8N_WEBHOOK_URL}?action=delete
Body JSON: { initData, id }
```

---

## Авторизация

Во всех кабинетных методах передаётся `initData` из Telegram WebApp.
n8n обязан:

* проверить подпись initData по BOT_TOKEN
* получить telegram_user_id
* проверить allowlist (Data Table)
* вернуть ok/ошибку

Фронт НЕ хранит секреты и НЕ проверяет подпись сам.

---

## Модель данных (Listing)

Единый тип Listing:

* id: string
* slug: string
* title: string
* price: number
* currency: "RUB"
* city: string
* district: string
* address: string
* rooms: number | null
* area: number | null
* floor: number | null
* total_floors: number | null
* description: string
* images: string[] (urls)
* agent_name: string
* agent_phone: string
* created_at: string (ISO)
* updated_at: string (ISO)
* owner_telegram_user_id: string

---

## Обязательные части, которые нужно сгенерировать

### A) Public SEO site

Маршруты:

* `/` — главная (поиск + последние объекты + ссылки на районы)
* `/:city/listings` — каталог (фильтры + пагинация)
* `/:city/:district` — SEO‑страница района (листинг + SEO‑текст‑заглушка)
* `/:city/:district/:slug` — карточка
* `/contacts`

SEO:

* title/description/OG
* canonical
* sitemap.xml (динамически или базово)
* robots.txt

### B) WebApp (кабинет)

Маршруты:

* `/app` — список «мои объекты»
* `/app/new` — создать
* `/app/edit/:id` — редактировать

Функции:

* чтение Telegram initData
* запросы в n8n (my_listings, upsert, delete)
* экран ошибок (нет в allowlist / подпись невалидна)

### C) Telegram Bot

* команда /start
* кнопка «Открыть кабинет» (WebApp кнопка)
* (опционально) кнопка «Создать объект» → `/app/new`

---

## Код‑качество

* Чёткая структура папок
* Типы данных в одном месте
* API‑клиент (fetch wrapper) с обработкой ошибок
* Никаких «магических» строк: всё через env

---

## ENV переменные

* N8N_WEBHOOK_URL
* WEBAPP_URL (например [https://your-domain.ru/app](https://your-domain.ru/app))
* PUBLIC_SITE_URL (например [https://your-domain.ru](https://your-domain.ru))
* TELEGRAM_BOT_TOKEN
* TELEGRAM_BOT_USERNAME (опционально)
* NODE_ENV

---

## Что НЕ делать

* Не строить собственную CRM/рассылки/доски объявлений
* Не делать сложную модерацию
* Не делать идеальный дизайн
* Не внедрять платежи

---

## Итоговый результат

Репозиторий должен запускаться локально и иметь понятные инструкции.
После запуска должны работать:

* публичный сайт (пусть с моковым городом/районом в UI)
* WebApp, открываемый из Telegram‑бота
* запросы уходят в n8n по N8N_WEBHOOK_URL

---

## Definition of Done

* Бот открывает WebApp
* WebApp показывает «мои объекты» и позволяет создать/обновить объект
* Публичный сайт показывает каталог/карточку/районы
* Все данные идут из n8n
* Ошибки allowlist/авторизации отображаются понятно
