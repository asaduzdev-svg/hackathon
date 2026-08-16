import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ApiError, asyncHandler } from '../middleware/error.js'
import { authenticate } from '../middleware/auth.js'
import { nextCode, orderSerializer, customerSerializer } from '../utils/helpers.js'
import { formatPhone } from '../utils/phone.js'
import { notifyOrderCreated, notifyOrderStatusChanged, notifyOrderCancelled } from '../services/telegram.js'

const router = Router()
router.use(authenticate)

const ORDER_INCLUDE = {
  customer: true,
  worker: true,
  timeline: { orderBy: { at: 'asc' } },
  payments: { orderBy: { date: 'asc' } },
}

async function addActivity(type, key, vars) {
  await prisma.activity.create({ data: { type, key, vars } })
}

async function pushNotification(type, bodyKey, vars) {
  await prisma.notification.create({ data: { type, bodyKey, vars } })
}

const STATUS_TIMELINE_KEY = {
  new: 'orders.timeline.created',
  diagnosing: 'orders.timeline.diagnosis',
  repairing: 'orders.timeline.repair',
  ready: 'orders.timeline.ready',
  completed: 'orders.timeline.completed',
  cancelled: 'orders.timeline.cancelled',
}

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Ta'mirlash buyurtmalari
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Buyurtmalar ro'yxati
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: workerId
 *         schema: { type: string }
 *       - in: query
 *         name: priority
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, status, workerId, priority } = req.query
    const where = {}
    if (status) where.status = status
    if (workerId) where.workerId = workerId
    if (priority) where.priority = priority
    if (search) {
      const q = String(search).toLowerCase()
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { make: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
        { plate: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } },
        { customer: { phone: { contains: q, mode: 'insensitive' } } },
      ]
    }
    const orders = await prisma.order.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: orders.map(orderSerializer) })
  }),
)

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Buyurtma yaratish
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [issue]
 *             properties:
 *               customerId: { type: string }
 *               customerName: { type: string }
 *               phone: { type: string }
 *               carType: { type: string }
 *               make: { type: string }
 *               model: { type: string }
 *               year: { type: integer }
 *               plate: { type: string }
 *               issue: { type: string }
 *               condition: { type: string }
 *               workerId: { type: string }
 *               status: { type: string }
 *               priority: { type: string }
 *               price: { type: integer }
 *               expectedDate: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Yaratildi
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    // Faqat consumer (CUSTOMER) yangi buyurtma berishi mumkin.
    // Admin va ustalar buyurtma yarata olmaydi.
    if (req.user.role !== 'CUSTOMER') {
      throw new ApiError(403, 'Faqat mijozlar (consumer) buyurtma bera oladi')
    }
    const {
      customerId,
      customerName,
      phone,
      carType = 'sedan',
      make = '',
      model = '',
      year = null,
      plate = '',
      issue,
      condition = 'Yaxshi',
      workerId = null,
      status = 'new',
      priority = 'normal',
      price = 0,
      expectedDate = null,
      notes = '',
    } = req.body
    if (!issue) throw new ApiError(400, 'issue majburiy')

    let customer
    if (customerId) {
      customer = await prisma.customer.findUnique({ where: { code: customerId } })
    } else if (customerName) {
      let found = null
      if (phone) {
        found = await prisma.customer.findUnique({ where: { phone: formatPhone(phone) } })
      }
      customer =
        found ||
        (await prisma.customer.create({
          data: {
            code: await nextCode('CUS-', 'customer', 3),
            name: customerName,
            phone: formatPhone(phone || ''),
          },
        }))
    }
    if (!customer) throw new ApiError(400, 'customerId yoki customerName talab qilinadi')

    let assignedWorkerId = null
    if (workerId) {
      const worker = await prisma.worker.findUnique({ where: { code: workerId } })
      assignedWorkerId = worker?.id || null
    }

    const order = await prisma.order.create({
      data: {
        code: await nextCode('ORD-', 'order', 0),
        customerId: customer.id,
        workerId: assignedWorkerId,
        carType,
        make,
        model,
        year: year ? Number(year) : null,
        plate,
        issue,
        condition,
        status,
        priority,
        price: Number(price) || 0,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        notes,
        timeline: { create: { key: STATUS_TIMELINE_KEY[status] || 'orders.timeline.created' } },
      },
      include: ORDER_INCLUDE,
    })

    await addActivity('order_created', 'notifications.orderCreated', { id: order.code, customer: customer.name })
    await pushNotification('order_created', 'notifications.orderCreated', { id: order.code, customer: customer.name })
    notifyOrderCreated(order).catch(() => {})
    res.status(201).json({ success: true, data: orderSerializer(order) })
  }),
)

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Buyurtma detali
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { code: req.params.id },
      include: ORDER_INCLUDE,
    })
    if (!order) throw new ApiError(404, 'Buyurtma topilmadi')
    res.json({ success: true, data: orderSerializer(order) })
  }),
)

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Buyurtma holatini o'zgartirish
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({ where: { code: req.params.id } })
    if (!order) throw new ApiError(404, 'Buyurtma topilmadi')
    const { status } = req.body
    if (!status) throw new ApiError(400, 'status majburiy')
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status,
        timeline: { create: { key: STATUS_TIMELINE_KEY[status] || 'orders.timeline.created' } },
      },
      include: ORDER_INCLUDE,
    })
    await addActivity('order_status', 'notifications.orderStatus', { id: order.code, status })
    await pushNotification('order_status', 'notifications.orderStatus', { id: order.code, status })
    notifyOrderStatusChanged(updated, order.status).catch(() => {})
    res.json({ success: true, data: orderSerializer(updated) })
  }),
)

/**
 * @swagger
 * /api/orders/{id}/worker:
 *   patch:
 *     tags: [Orders]
 *     summary: Buyurtmaga xodim tayinlash
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workerId]
 *             properties:
 *               workerId: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch(
  '/:id/worker',
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({ where: { code: req.params.id } })
    if (!order) throw new ApiError(404, 'Buyurtma topilmadi')
    const { workerId } = req.body
    if (!workerId) throw new ApiError(400, 'workerId majburiy')
    const worker = await prisma.worker.findUnique({ where: { code: workerId } })
    if (!worker) throw new ApiError(404, 'Xodim topilmadi')
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        workerId: worker.id,
        timeline: {
          create: { key: 'orders.timeline.assigned', vars: { worker: worker.name } },
        },
      },
      include: ORDER_INCLUDE,
    })
    res.json({ success: true, data: orderSerializer(updated) })
  }),
)

/**
 * @swagger
 * /api/orders/{id}/notes:
 *   post:
 *     tags: [Orders]
 *     summary: Buyurtmaga izoh qo'shish
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.post(
  '/:id/notes',
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({ where: { code: req.params.id } })
    if (!order) throw new ApiError(404, 'Buyurtma topilmadi')
    const { text } = req.body
    if (!text) throw new ApiError(400, 'text majburiy')
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        timeline: { create: { key: 'orders.timeline.note', vars: { text } } },
      },
      include: ORDER_INCLUDE,
    })
    res.json({ success: true, data: orderSerializer(updated) })
  }),
)

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Buyurtmani bekor qilish
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({ where: { code: req.params.id } })
    if (!order) throw new ApiError(404, 'Buyurtma topilmadi')
    const { reason = '' } = req.body
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'cancelled',
        cancelledReason: reason,
        timeline: { create: { key: 'orders.timeline.cancelled' } },
      },
      include: ORDER_INCLUDE,
    })
    await addActivity('order_cancelled', 'notifications.orderStatus', { id: order.code, status: 'cancelled' })
    await pushNotification('order_cancelled', 'notifications.orderStatus', { id: order.code, status: 'cancelled' })
    notifyOrderCancelled(updated).catch(() => {})
    res.json({ success: true, data: orderSerializer(updated) })
  }),
)

export default router
