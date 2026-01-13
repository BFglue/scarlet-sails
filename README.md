# RealEstate SEO + Telegram WebApp (MVP)

## Зачем это

Мы делаем MVP системы для агентства недвижимости:

* **Публичный SEO‑сайт** с каталогом объектов, страницами районов и карточками
* **Кабинет риелтора** (Telegram WebApp): добавление/редактирование объявлений
* **Telegram‑бот** как «аккаунт и канал связи» для риелторов (в будущем — подключение нейроассистентов)

Ключевая идея: **данные хранятся и управляются в n8n** (Data Tables + workflows), а сайт и web‑интерфейс — кодом (быстро и контролируемо).

---

## Архитектура (MVP)

* Telegram Bot → открывает WebApp
* WebApp → работает только через n8n API (один webhook)
* Public site → читает данные через тот же n8n API
* n8n → хранит данные (Data Tables), авторизует по Telegram initData, выполняет CRUD

```
[Риелтор] ── Telegram ──► [Bot] ──► [WebApp]
                               │
                               ▼
                           [n8n API]
                               │
                               ▼
                         [Data Tables]

[Public SEO Site] ────────────────┘
```

---

## Scope: что именно делаем

### 1) Публичный сайт (SEO)

Страницы:

* `/` — главная (поиск/фильтры + последние объявления)
* `/:city/listings` — каталог (фильтры + пагинация)
* `/:city/:district` — SEO‑страница района
* `/:city/:district/:slug` — карточка объекта
* `/contacts`

SEO:

* meta title/description
* canonical + OG
* sitemap.xml + robots.txt

### 2) Кабинет риелтора (Telegram WebApp)

* `/app` — мои объекты
* `/app/new` — форма создания
* `/app/edit/:id` — редактирование

Авторизация:

* WebApp отправляет `initData` в n8n
* n8n проверяет подпись и allowlist

### 3) Telegram Bot

* `/start`
* кнопка меню «Открыть кабинет» (WebApp)

---

## n8n API (контракт)

Переменная окружения:

```
N8N_WEBHOOK_URL=https://n8n2.lagomdev.ru/webhook/<workflowID>
```

Все операции — через query‑параметр `action`.

### Public

* list:

```
GET ?action=list&city=&district=&type=&page=&limit=&price_min=&price_max=&rooms=
```

* detail:

```
GET ?action=detail&slug=...
```

### Cabinet (требует initData)

* my_listings:

```
GET ?action=my_listings&initData=...
```

* upsert:

```
POST ?action=upsert
Body: { initData, listing }
```

* delete (опционально):

```
POST ?action=delete
Body: { initData, id }
```

---

## Модель данных (Listing)

Единый тип:

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

## Хранилище в n8n (Data Tables)

Минимально нужно 2 таблицы:

### allowed_users

* telegram_user_id (string)
* role (agent/admin)

### listings

* поля Listing (см. выше)

---

## Безопасность (MVP)

* Все кабинетные запросы требуют `initData`.
* n8n проверяет подпись initData по BOT_TOKEN.
* n8n проверяет allowlist user_id.
* Если user_id не разрешён → 403.

---

## Локальный запуск

### Требования

* Node.js 20+
* npm/pnpm

### Установка

```bash
npm install
```

### ENV

Создать `.env.local` на основе `.env.example`:

```env
N8N_WEBHOOK_URL=https://n8n2.lagomdev.ru/webhook/<workflowID>
PUBLIC_SITE_URL=http://localhost:3000
WEBAPP_URL=http://localhost:3000/app
TELEGRAM_BOT_TOKEN=xxx
```

### Запуск сайта + WebApp

```bash
npm run dev
```

Бот будет добавлен на следующих этапах.

---

## MVP‑ограничения (важно)

* Пока не делаем: автопостинг на доски, CRM, модерацию, сложные роли.
* UI простой: главное — структура, маршрутизация, интеграция и работоспособность.

---

## План на 7–10 дней (ориентир)

1. n8n: таблицы + workflow API (list/detail/my_listings/upsert)
2. Codex: каркас Next.js (public + app)
3. Codex: бот (кнопка «Открыть кабинет»)
4. Публикация + запуск индексации + метрики (Search Console / Яндекс.Вебмастер)

---

## Definition of Done

* Бот открывает WebApp
* WebApp показывает «мои объекты» и позволяет создать/обновить объект
* Публичный сайт показывает каталог/карточку/районы
* Все данные идут из n8n
* Ошибки allowlist/авторизации отображаются понятно
