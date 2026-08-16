import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../middleware/error.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

function rangeStart(key) {
  const now = new Date()
  const start = new Date(now)
  if (key === 'today') {
    start.setHours(0, 0, 0, 0)
  } else if (key === '7d') {
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)
  } else {
    start.setDate(start.getDate() - 30)
    start.setHours(0, 0, 0, 0)
  }
  return start
}

const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fmtShort = (d) => d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Hisobotlar va statistika
 */

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     tags: [Reports]
 *     summary: Hisobot xulosasi
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: key
 *         schema: { type: string, enum: [today, 7d, 30d] }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const key = req.query.key || 'today'
    const start = rangeStart(key)
    const [orders, payments, appointments] = await Promise.all([
      prisma.order.findMany({ where: { createdAt: { gte: start } } }),
      prisma.payment.findMany({ where: { date: { gte: start } } }),
      prisma.appointment.findMany({ where: { date: { gte: start } } }),
    ])
    const revenue = payments.reduce((s, p) => s + p.amount, 0)
    const completed = orders.filter((o) => o.status === 'completed').length
    const cancelled = orders.filter((o) => o.status === 'cancelled').length
    const noShow = appointments.filter((a) => a.status === 'no_show').length
    const avgOrder = orders.length ? Math.round(revenue / orders.length) : 0
    res.json({
      success: true,
      data: { revenue, orders: orders.length, completed, cancelled, noShow, avgOrder },
    })
  }),
)

/**
 * @swagger
 * /api/reports/revenue:
 *   get:
 *     tags: [Reports]
 *     summary: Daromad grafigi
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: key
 *         schema: { type: string, enum: [today, 7d, 30d] }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/revenue',
  asyncHandler(async (req, res) => {
    const key = req.query.key || 'today'
    const start = rangeStart(key)
    const payments = await prisma.payment.findMany({ where: { date: { gte: start } } })
    const buckets = []
    const now = new Date()
    if (key === 'today') {
      for (let h = 8; h <= 21; h += 1) {
        const sum = payments.filter((p) => p.date.getHours() === h).reduce((s, p) => s + p.amount, 0)
        buckets.push({ label: `${String(h).padStart(2, '0')}:00`, value: sum })
      }
    } else {
      const days = key === '7d' ? 7 : 30
      const byDay = {}
      payments.forEach((p) => {
        const dk = dayKey(p.date)
        byDay[dk] = (byDay[dk] || 0) + p.amount
      })
      for (let i = days - 1; i >= 0; i -= 1) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        buckets.push({ label: fmtShort(d), value: byDay[dayKey(d)] || 0 })
      }
    }
    res.json({ success: true, data: buckets })
  }),
)

/**
 * @swagger
 * /api/reports/workers:
 *   get:
 *     tags: [Reports]
 *     summary: Xodimlar samaradorligi
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: key
 *         schema: { type: string, enum: [today, 7d, 30d] }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/workers',
  asyncHandler(async (req, res) => {
    const key = req.query.key || 'today'
    const start = rangeStart(key)
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start }, NOT: { status: { in: ['cancelled', 'completed'] } } },
      include: { worker: true },
    })
    const map = new Map()
    for (const o of orders) {
      const id = o.workerId || 'none'
      if (!map.has(id)) {
        map.set(id, { workerId: id, workerName: o.worker?.name || '—', count: 0, revenue: 0 })
      }
      const row = map.get(id)
      row.count += 1
      row.revenue += o.paid
    }
    const rows = [...map.values()]
      .map((r) => ({ ...r, avg: r.count ? Math.round(r.revenue / r.count) : 0 }))
      .sort((a, b) => b.revenue - a.revenue)
    res.json({ success: true, data: rows })
  }),
)

/**
 * @swagger
 * /api/reports/services:
 *   get:
 *     tags: [Reports]
 *     summary: Ommabop avtomobil turlari
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: key
 *         schema: { type: string, enum: [today, 7d, 30d] }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/services',
  asyncHandler(async (req, res) => {
    const key = req.query.key || 'today'
    const start = rangeStart(key)
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start }, NOT: { status: { in: ['cancelled', 'completed'] } } },
    })
    const map = new Map()
    for (const o of orders) {
      map.set(o.carType, (map.get(o.carType) || 0) + 1)
    }
    const rows = [...map.entries()]
      .map(([carType, count]) => ({ carType, count }))
      .sort((a, b) => b.count - a.count)
    res.json({ success: true, data: rows })
  }),
)

/**
 * @swagger
 * /api/reports/inventory:
 *   get:
 *     tags: [Reports]
 *     summary: Ombor hisoboti
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/inventory',
  asyncHandler(async (req, res) => {
    const items = await prisma.inventoryItem.findMany()
    const stockValue = items.reduce((s, i) => s + i.quantity * i.purchasePrice, 0)
    const lowCount = items.filter((i) => i.quantity > 0 && i.quantity < i.minimum).length
    const outCount = items.filter((i) => i.quantity <= 0).length
    const topItems = [...items]
      .sort((a, b) => b.sellingPrice - a.sellingPrice)
      .slice(0, 5)
      .map((i) => ({
        id: i.code,
        name: i.name,
        category: i.category,
        quantity: i.quantity,
        minimum: i.minimum,
        purchasePrice: i.purchasePrice,
        sellingPrice: i.sellingPrice,
        status: i.quantity <= 0 ? 'out_of_stock' : i.quantity < i.minimum ? 'low_stock' : 'in_stock',
      }))
    res.json({ success: true, data: { stockValue, lowCount, outCount, topItems } })
  }),
)

/**
 * @swagger
 * /api/reports/debt:
 *   get:
 *     tags: [Reports]
 *     summary: Jami qarzdorlik
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/debt',
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { NOT: { status: { in: ['cancelled', 'completed'] } } },
    })
    const debt = orders.reduce((s, o) => s + (o.price - o.paid), 0)
    res.json({ success: true, data: debt })
  }),
)

export default router
