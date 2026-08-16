import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ApiError, asyncHandler } from '../middleware/error.js'
import { authenticate } from '../middleware/auth.js'
import { nextCode } from '../utils/helpers.js'
import { notifyPaymentReceived } from '../services/telegram.js'

const router = Router()
router.use(authenticate)

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: To'lovlar
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: To'lovlar ro'yxati (orderId bo'yicha filtrlash mumkin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { orderId } = req.query
    let payments
    if (orderId) {
      const order = await prisma.order.findUnique({ where: { code: orderId } })
      if (!order) return res.json({ success: true, data: [] })
      payments = await prisma.payment.findMany({
        where: { orderId: order.id },
        include: { order: { include: { customer: true } } },
        orderBy: { date: 'desc' },
      })
    } else {
      payments = await prisma.payment.findMany({
        include: { order: { include: { customer: true } } },
        orderBy: { date: 'desc' },
      })
    }
    const rows = payments.map((p) => ({
      id: p.code,
      orderId: p.order.code,
      orderRef: p.order.code,
      customerName: p.order.customer?.name || '',
      amount: p.amount,
      method: p.method,
      date: p.date,
      status: p.status,
    }))
    res.json({ success: true, data: rows })
  }),
)

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: To'lov qo'shish
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, amount, method]
 *             properties:
 *               orderId: { type: string }
 *               amount: { type: number }
 *               method: { type: string }
 *     responses:
 *       201:
 *         description: Yaratildi
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { orderId, amount, method = 'cash' } = req.body
    if (!orderId) throw new ApiError(400, 'orderId majburiy')
    const order = await prisma.order.findUnique({ where: { code: orderId } })
    if (!order) throw new ApiError(404, 'Buyurtma topilmadi')
    const value = Number(amount) || 0
    if (value <= 0) throw new ApiError(400, 'Summa musbat bo\'lishi kerak')
    const remaining = order.price - order.paid
    if (value > remaining) throw new ApiError(400, 'Summa qolgan qarzdan oshmasligi kerak')

    const payment = await prisma.payment.create({
      data: {
        code: await nextCode('PAY-', 'payment', 0),
        orderId: order.id,
        amount: value,
        method,
      },
    })
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paid: order.paid + value,
        timeline: { create: { key: 'orders.timeline.payment', vars: { amount: value } } },
      },
      include: { customer: true, worker: true, timeline: true, payments: true },
    })
    await prisma.activity.create({
      data: {
        type: 'payment',
        key: 'notifications.payment',
        vars: { id: order.code, amount: value },
      },
    })
    await prisma.notification.create({
      data: {
        type: 'payment',
        bodyKey: 'notifications.payment',
        vars: { id: order.code, amount: value },
      },
    })

    notifyPaymentReceived(updatedOrder, { amount: value, method, date: payment.date }).catch(() => {})

    const { orderSerializer } = await import('../utils/helpers.js')
    res.status(201).json({
      success: true,
      payment: { id: payment.code, orderId: order.code, amount: value, method, date: payment.date, status: payment.status },
      order: orderSerializer(updatedOrder),
    })
  }),
)

/**
 * @swagger
 * /api/payments/summary:
 *   get:
 *     tags: [Payments]
 *     summary: To'lovlar xulosasi
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const [payments, orders] = await Promise.all([
      prisma.payment.findMany(),
      prisma.order.findMany(),
    ])
    const today = new Date()
    const start = new Date(today)
    start.setHours(0, 0, 0, 0)
    const todayRevenue = payments
      .filter((p) => p.date >= start)
      .reduce((s, p) => s + p.amount, 0)
    const collected = payments.reduce((s, p) => s + p.amount, 0)
    const activeOrders = orders.filter((o) => !['cancelled', 'completed'].includes(o.status))
    const unpaid = activeOrders.reduce((s, o) => s + (o.price - o.paid), 0)
    const pending = activeOrders.filter((o) => o.price - o.paid > 0).length
    res.json({ success: true, data: { todayRevenue, collected, unpaid, pending } })
  }),
)

export default router
