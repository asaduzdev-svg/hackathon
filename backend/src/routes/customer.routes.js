import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ApiError, asyncHandler } from '../middleware/error.js'
import { authenticate } from '../middleware/auth.js'
import { nextCode, customerSerializer } from '../utils/helpers.js'
import { formatPhone } from '../utils/phone.js'

const router = Router()
router.use(authenticate)

async function withStats(customer) {
  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { payments: true },
  })
  const totalSpent = orders.reduce((s, o) => s + o.paid, 0)
  const active = orders.filter((o) => !['cancelled', 'completed'].includes(o.status)).length
  const lastVisit = orders.length ? orders[orders.length - 1].createdAt : null
  return customerSerializer(customer, { orders: orders.length, totalSpent, active, lastVisit })
}

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Mijozlar
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     tags: [Customers]
 *     summary: Mijozlar ro'yxati
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: { orders: { include: { payments: true } } },
    })
    const rows = await Promise.all(
      customers.map((c) => {
        const totalSpent = c.orders.reduce((s, o) => s + o.paid, 0)
        const active = c.orders.filter((o) => !['cancelled', 'completed'].includes(o.status)).length
        const lastVisit = c.orders.length ? c.orders[c.orders.length - 1].createdAt : null
        return customerSerializer(c, { orders: c.orders.length, totalSpent, active, lastVisit })
      }),
    )
    res.json({ success: true, data: rows })
  }),
)

/**
 * @swagger
 * /api/customers:
 *   post:
 *     tags: [Customers]
 *     summary: Mijoz qo'shish
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone]
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               telegram: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Yaratildi
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, phone, telegram = '', notes = '' } = req.body
    if (!name || !phone) throw new ApiError(400, 'name va phone majburiy')
    const exists = await prisma.customer.findUnique({ where: { phone: formatPhone(phone) } })
    if (exists) throw new ApiError(409, 'Bu telefon raqam allaqachon mavjud')
    const customer = await prisma.customer.create({
      data: {
        code: await nextCode('CUS-', 'customer', 3),
        name,
        phone: formatPhone(phone),
        telegram,
        notes,
      },
    })
    res.status(201).json({ success: true, data: await withStats(customer) })
  }),
)

/**
 * @swagger
 * /api/customers/by-phone:
 *   get:
 *     tags: [Customers]
 *     summary: Telefon bo'yicha mijoz qidirish
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: phone
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/by-phone',
  asyncHandler(async (req, res) => {
    const digits = String(req.query.phone || '').replace(/\D/g, '')
    if (!digits) return res.json({ success: true, data: null })
    const customers = await prisma.customer.findMany({ include: { orders: true } })
    const found = customers.find((c) => c.phone.replace(/\D/g, '').endsWith(digits.slice(-9)))
    res.json({ success: true, data: found ? await withStats(found) : null })
  }),
)

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Mijoz detali
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
    const customer = await prisma.customer.findUnique({ where: { code: req.params.id } })
    if (!customer) throw new ApiError(404, 'Mijoz topilmadi')
    res.json({ success: true, data: await withStats(customer) })
  }),
)

/**
 * @swagger
 * /api/customers/{id}:
 *   patch:
 *     tags: [Customers]
 *     summary: Mijozni tahrirlash
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
 *               name: { type: string }
 *               phone: { type: string }
 *               telegram: { type: string }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findUnique({ where: { code: req.params.id } })
    if (!customer) throw new ApiError(404, 'Mijoz topilmadi')
    const { name, phone, telegram, notes } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (phone !== undefined) data.phone = formatPhone(phone)
    if (telegram !== undefined) data.telegram = telegram
    if (notes !== undefined) data.notes = notes
    const updated = await prisma.customer.update({ where: { id: customer.id }, data })
    res.json({ success: true, data: await withStats(updated) })
  }),
)

export default router
