import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ApiError, asyncHandler } from '../middleware/error.js'
import { authenticate } from '../middleware/auth.js'
import { getBotStatus, sendTelegramTest } from '../services/telegram.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: System
 *   description: Dashboard, faoliyat, bildirishnomalar, sozlamalar
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags: [System]
 *     summary: Dashboard statistikasi
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/dashboard',
  authenticate,
  asyncHandler(async (req, res) => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const [orders, payments, appointments] = await Promise.all([
      prisma.order.findMany(),
      prisma.payment.findMany(),
      prisma.appointment.findMany(),
    ])
    const todayOrders = orders.filter((o) => o.createdAt >= start).length
    const inRepair = orders.filter((o) => ['new', 'diagnosing', 'repairing'].includes(o.status)).length
    const ready = orders.filter((o) => o.status === 'ready').length
    const todayRevenue = payments.filter((p) => p.date >= start).reduce((s, p) => s + p.amount, 0)
    const unpaid = orders
      .filter((o) => !['cancelled', 'completed'].includes(o.status))
      .reduce((s, o) => s + (o.price - o.paid), 0)
    const todayAppointments = appointments.filter((a) => {
      const d = new Date(a.date)
      return d.toDateString() === new Date().toDateString()
    })
    res.json({
      success: true,
      data: {
        todayOrders,
        inRepair,
        ready,
        todayRevenue,
        unpaid,
        todayAppointments: todayAppointments.length,
        activeRepairs: inRepair,
        readyForPickup: ready,
      },
    })
  }),
)

/**
 * @swagger
 * /api/activity:
 *   get:
 *     tags: [System]
 *     summary: Faoliyat tarixi
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/activity',
  authenticate,
  asyncHandler(async (req, res) => {
    const rows = await prisma.activity.findMany({ orderBy: { at: 'desc' }, take: 80 })
    res.json({
      success: true,
      data: rows.map((a) => ({ id: a.id, type: a.type, key: a.key, vars: a.vars || {}, at: a.at })),
    })
  }),
)

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [System]
 *     summary: Bildirishnomalar ro'yxati
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/notifications',
  authenticate,
  asyncHandler(async (req, res) => {
    const rows = await prisma.notification.findMany({ orderBy: { at: 'desc' }, take: 60 })
    res.json({
      success: true,
      data: rows.map((n) => ({ id: n.id, type: n.type, bodyKey: n.bodyKey, vars: n.vars || {}, at: n.at, read: n.read })),
    })
  }),
)

/**
 * @swagger
 * /api/notifications/read-all:
 *   post:
 *     tags: [System]
 *     summary: Barcha bildirishnomalarni o'qilgan deb belgilash
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.post(
  '/notifications/read-all',
  authenticate,
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({ data: { read: true } })
    res.json({ success: true })
  }),
)

/**
 * @swagger
 * /api/settings:
 *   get:
 *     tags: [System]
 *     summary: Sozlamalar
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/settings',
  authenticate,
  asyncHandler(async (req, res) => {
    let settings = await prisma.settings.findUnique({ where: { id: 1 } })
    if (!settings) {
      settings = await prisma.settings.create({ data: {} })
    }
    res.json({ success: true, data: settings })
  }),
)

/**
 * @swagger
 * /api/settings:
 *   patch:
 *     tags: [System]
 *     summary: Sozlamalarni yangilash
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.patch(
  '/settings',
  authenticate,
  asyncHandler(async (req, res) => {
    const body = req.body
    const allowed = [
      'businessName',
      'businessPhone',
      'address',
      'hours',
      'profileName',
      'profilePhone',
      'profileEmail',
      'notifyCustomer',
      'notifyAppointments',
      'notifyTelegram',
    ]
    const data = {}
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key]
    }
    let settings = await prisma.settings.findUnique({ where: { id: 1 } })
    if (!settings) {
      settings = await prisma.settings.create({ data })
    } else {
      settings = await prisma.settings.update({ where: { id: 1 }, data })
    }
    res.json({ success: true, data: settings })
  }),
)

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [System]
 *     summary: Server holati
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok' })
})

/**
 * @swagger
 * /api/telegram/status:
 *   get:
 *     tags: [System]
 *     summary: Telegram bot holati
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/telegram/status',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await getBotStatus() })
  }),
)

/**
 * @swagger
 * /api/telegram/test:
 *   post:
 *     tags: [System]
 *     summary: Telegram botga test xabar yuborish
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.post(
  '/telegram/test',
  authenticate,
  asyncHandler(async (req, res) => {
    const sent = await sendTelegramTest()
    if (!sent) throw new ApiError(400, 'Telegram bot ulangan emas yoki obunachilar yo\'q')
    res.json({ success: true, sent })
  }),
)

export default router
