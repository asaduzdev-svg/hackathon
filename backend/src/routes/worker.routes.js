import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ApiError, asyncHandler } from '../middleware/error.js'
import { authenticate } from '../middleware/auth.js'
import { nextCode, workerSerializer } from '../utils/helpers.js'

const router = Router()
router.use(authenticate)

async function withStats(worker) {
  const orders = await prisma.order.findMany({ where: { workerId: worker.id } })
  const activeOrders = orders.filter((o) => !['cancelled', 'completed'].includes(o.status)).length
  const completedOrders = orders.filter((o) => o.status === 'completed').length
  return workerSerializer(worker, { activeOrders, completedOrders })
}

/**
 * @swagger
 * tags:
 *   name: Workers
 *   description: Xodimlar (mexaniklar)
 */

/**
 * @swagger
 * /api/workers:
 *   get:
 *     tags: [Workers]
 *     summary: Xodimlar ro'yxati
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const workers = await prisma.worker.findMany({ orderBy: { joinedAt: 'desc' } })
    const rows = await Promise.all(
      workers.map(async (w) => {
        const orders = await prisma.order.findMany({ where: { workerId: w.id } })
        const activeOrders = orders.filter((o) => !['cancelled', 'completed'].includes(o.status)).length
        const completedOrders = orders.filter((o) => o.status === 'completed').length
        return workerSerializer(w, { activeOrders, completedOrders })
      }),
    )
    res.json({ success: true, data: rows })
  }),
)

/**
 * @swagger
 * /api/workers:
 *   post:
 *     tags: [Workers]
 *     summary: Xodim qo'shish
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               specialization: { type: string }
 *     responses:
 *       201:
 *         description: Yaratildi
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, phone = '', specialization = 'mechanic' } = req.body
    if (!name) throw new ApiError(400, 'name majburiy')
    const worker = await prisma.worker.create({
      data: { code: await nextCode('WRK-', 'worker', 2), name, phone, specialization },
    })
    res.status(201).json({ success: true, data: await withStats(worker) })
  }),
)

/**
 * @swagger
 * /api/workers/{id}:
 *   get:
 *     tags: [Workers]
 *     summary: Xodim detali
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
    const worker = await prisma.worker.findUnique({ where: { code: req.params.id } })
    if (!worker) throw new ApiError(404, 'Xodim topilmadi')
    res.json({ success: true, data: await withStats(worker) })
  }),
)

/**
 * @swagger
 * /api/workers/{id}:
 *   patch:
 *     tags: [Workers]
 *     summary: Xodimni tahrirlash
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
 *               specialization: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const worker = await prisma.worker.findUnique({ where: { code: req.params.id } })
    if (!worker) throw new ApiError(404, 'Xodim topilmadi')
    const { name, phone, specialization } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (phone !== undefined) data.phone = phone
    if (specialization !== undefined) data.specialization = specialization
    const updated = await prisma.worker.update({ where: { id: worker.id }, data })
    res.json({ success: true, data: await withStats(updated) })
  }),
)

export default router
