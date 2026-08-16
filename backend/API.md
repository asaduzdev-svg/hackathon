# AutoCore CRM — Backend API

Avto servis CRM uchun REST API. Texnologiya: **Node.js + Express + Prisma ORM + PostgreSQL**.

## Umumiy ma'lumot

- Base URL: `http://localhost:5000/api`
- Swagger UI: `http://localhost:5000/api-docs`
- Auth: **JWT Access + Refresh token**, ikkalasi **httpOnly cookie**'da saqlanadi
- Parollar **bcrypt** bilan **12 sikl**da hashlanadi
- Barcha CRUD endpointlar `authenticate` orqali himoyalangan

### Cookie'lar

| Cookie | Path | Muddati |
|---|---|---|
| `access_token` | `/` | 15 daqiqa |
| `refresh_token` | `/api/auth/refresh` | 7 kun |

### Demo hisoblar (seed)

| Rol | Email | Parol |
|---|---|---|
| OWNER | `owner@autocore.app` | `demo123` |
| WORKER | `bekzod@autocore.app` | `demo123` |
| CUSTOMER | `azizbek@autocore.app` | `demo123` |

### Javob formati

```json
{ "success": true, "data": ... }
{ "success": false, "message": "Xato sababi" }
```

---

## Auth (`/api/auth`)

| Method | Endpoint | Tavsif |
|---|---|---|
| POST | `/auth/register` | Ro'yxatdan o'tish. Body: `name, email, password, phone?, role?` |
| POST | `/auth/login` | Kirish. Body: `email, password` |
| POST | `/auth/refresh` | Access token'ni yangilash (refresh cookie orqali) |
| POST | `/auth/logout` | Chiqish (cookie'lar tozalanadi) |
| GET | `/auth/me` | Joriy foydalanuvchi |

Register/login javobida `user` obyekti va `access_token`+`refresh_token` cookie'lari beriladi.

## Customers (`/api/customers`)

| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/customers` | Mijozlar ro'yxati (statistika bilan: orders, totalSpent) |
| GET | `/customers/by-phone?phone=` | Telefon bo'yicha qidirish |
| POST | `/customers` | Yaratish. Body: `name, phone, telegram?, notes?` |
| GET | `/customers/:id` | Detal (code: `CUS-001`) |
| PATCH | `/customers/:id` | Tahrirlash |

## Workers (`/api/workers`)

| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/workers` | Xodimlar ro'yxati (activeOrders, completedOrders) |
| POST | `/workers` | Yaratish. Body: `name, phone?, specialization?` |
| GET | `/workers/:id` | Detal (code: `WRK-01`) |
| PATCH | `/workers/:id` | Tahrirlash |

## Orders (`/api/orders`) — ta'mirlash buyurtmalari

| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/orders` | Ro'yxat. Filter: `search, status, workerId, priority` |
| POST | `/orders` | Yaratish. Body: `issue` majburiy, `customerId` yoki `customerName+phone`, `carType, make, model, year, plate, workerId, status, priority, price, expectedDate, notes` |
| GET | `/orders/:id` | Detal (timeline, payments bilan) |
| PATCH | `/orders/:id/status` | Holat. Body: `status` (`new|diagnosing|repairing|ready|completed|cancelled`) |
| PATCH | `/orders/:id/worker` | Xodim tayinlash. Body: `workerId` |
| POST | `/orders/:id/notes` | Izoh qo'shish. Body: `text` |
| PATCH | `/orders/:id/cancel` | Bekor qilish. Body: `reason?` |

Order holatlarining ma'nosi:
```
new → diagnosing → repairing → ready → completed
              ↘                 ↘
                cancelled        cancelled
```

## Payments (`/api/payments`)

| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/payments` | Ro'yxat. Filter: `orderId` |
| GET | `/payments/summary` | Xulosa: `todayRevenue, collected, unpaid, pending` |
| POST | `/payments` | Qo'shish. Body: `orderId, amount, method(cash|card|transfer)` |

## Appointments (`/api/appointments`)

| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/appointments` | Qabullar ro'yxati |
| POST | `/appointments` | Yaratish. Body: `service, date` majburiy, `customerId`/`customerName`, `workerId, time, notes` |
| PATCH | `/appointments/:id/status` | Holat. Body: `status` (`confirmed|waiting|completed|cancelled|no_show`) |

## Inventory (`/api/inventory`)

| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/inventory` | Ombor ro'yxati (history bilan) |
| POST | `/inventory` | Qo'shish. Body: `name` majburiy, `category, quantity, minimum, purchasePrice, sellingPrice` |
| GET | `/inventory/:id` | Detal |
| PATCH | `/inventory/:id` | Tahrirlash |
| POST | `/inventory/:id/stock` | Zaxira qo'shish. Body: `quantity, note?` |

Kategoriyalar: `engine, oil, filter, brake, battery, suspension, cooling, body, component, accessory`

## Reports (`/api/reports`)

`key` parametri: `today | 7d | 30d`

| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/reports/summary?key=` | `revenue, orders, completed, cancelled, noShow, avgOrder` |
| GET | `/reports/revenue?key=` | Daromad grafigi (buckets) |
| GET | `/reports/workers?key=` | Xodimlar samaradorligi |
| GET | `/reports/services?key=` | Ommabop avtomobil turlari |
| GET | `/reports/inventory` | Ombor hisoboti: `stockValue, lowCount, outCount, topItems` |
| GET | `/reports/debt` | Jami qarzdorlik |

## System

| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/dashboard` | Dashboard KPI'lari |
| GET | `/activity` | Faoliyat tarixi |
| GET | `/notifications` | Bildirishnomalar |
| POST | `/notifications/read-all` | Hammasini o'qilgan qilish |
| GET | `/settings` | Sozlamalar |
| PATCH | `/settings` | Sozlamalarni yangilash |
| GET | `/health` | Server holati |
