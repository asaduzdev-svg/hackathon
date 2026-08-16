import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ApiError, asyncHandler } from '../middleware/error.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

async function businessContext() {
  const [orders, customers, workers, inventory, s] = await Promise.all([
    prisma.order.findMany({ take: 30, orderBy: { createdAt: 'desc' } }),
    prisma.customer.findMany({ take: 20 }),
    prisma.worker.findMany(),
    prisma.inventoryItem.findMany({ take: 50 }),
    prisma.settings.findUnique({ where: { id: 1 } }),
  ])
  return {
    businessName: s?.businessName || 'ServiceCore',
    stats: {
      orders: orders.length,
      activeOrders: orders.filter((o) => ['new', 'diagnosing', 'repairing', 'ready'].includes(o.status)).length,
      completed: orders.filter((o) => o.status === 'completed').length,
      revenue: orders.reduce((sum, o) => sum + (o.paid || 0), 0),
      workers: workers.length,
      customers: customers.length,
      inventoryItems: inventory.length,
    },
    recentOrders: orders.slice(0, 10).map((o) => ({
      code: o.code,
      make: o.make,
      model: o.model,
      issue: o.issue,
      status: o.status,
      price: o.price,
      paid: o.paid,
    })),
    inventory: inventory.map((i) => ({ name: i.name, quantity: i.quantity, price: i.sellingPrice })),
  }
}

function makeSystemPrompt(ctx) {
  return `Siz ServiceCore avtoservis CRM'idagi aqlli yordamchisiz ("${ctx.businessName}").
Foydalanuvchiga biznesni boshqarishda yordam bering: buyurtmalar, mijozlar, ustalar, mashinalar, to'lovlar, ombor.

Joriy biznes ma'lumotlari:
- Buyurtmalar: ${ctx.stats.orders} (faol: ${ctx.stats.activeOrders}, yakunlangan: ${ctx.stats.completed})
- Daromad (to'langan): ${ctx.stats.revenue} so'm
- Ustalar: ${ctx.stats.workers} ta, Mijozlar: ${ctx.stats.customers} ta, Ombor: ${ctx.stats.inventoryItems} ta mahsulot

Mashina ta'mirlash bo'yicha bilimlaringizdan ham foydalaning:
- Agar mijoz avtomobil muammosini yozsa (masalan: "tebranish", "shovqin", "gilzasi qiziyapti") — qanday detallar/tanho ehtiyot qismlar kerak bo'lishi mumkinligini, taxminiy tahlil bosqichlarini va ehtiyot choralarni qisqa ro'yxat shaklida ayting.
- Diagnostika, ta'mirlash va texnik xizmat bo'yicha maslahatlar bering.

Qoidalar:
- Javoblarni qisqa, aniq va tushunarli qilib bering.
- Summalarni so'mda yozing.
- Uzun ro'yxatlar kerak bo'lsa kamida/nomerlar bilan bering.
- Agar ma'lumot yetarli bo'lmasa, aniq savol bering.
- Har doim o'zbek tilida javob bering (foydalanuvchi boshqa tilda so'rasa ham shu tilda qisqa javob bering).`
}

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     tags: [AI]
 *     summary: AI yordamchidan so'rov qilish (Groq)
 */
router.post(
  '/chat',
  authenticate,
  asyncHandler(async (req, res) => {
    const { message } = req.body
    if (!message || !String(message).trim()) {
      throw new ApiError(400, 'message majburiy')
    }
    if (!API_KEY) {
      throw new ApiError(503, 'AI sozlanmagan (GROQ_API_KEY topilmadi)')
    }

    const ctx = await businessContext()
    const history = Array.isArray(req.body.history) ? req.body.history.slice(-8) : []

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 700,
        messages: [
          { role: 'system', content: makeSystemPrompt(ctx) },
          ...history,
          { role: 'user', content: String(message).trim() },
        ],
      }),
    })

    if (!groqRes.ok) {
      const text = await groqRes.text().catch(() => '')
      console.error('[ai] Groq error:', groqRes.status, text.slice(0, 300))
      throw new ApiError(502, 'AI xizmatidan javob olishda xatolik')
    }

    const data = await groqRes.json()
    const answer = data?.choices?.[0]?.message?.content?.trim()
    if (!answer) throw new ApiError(502, 'AI bo\'sh javob qaytardi')

    res.json({ success: true, answer })
  }),
)

/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     tags: [AI]
 *     summary: AI holati
 */
router.get(
  '/status',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ success: true, configured: !!API_KEY, model: MODEL })
  }),
)

export default router
