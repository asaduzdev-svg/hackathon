import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ApiError, asyncHandler } from '../middleware/error.js'
import { authenticate } from '../middleware/auth.js'
import { nextCode, inventorySerializer } from '../utils/helpers.js'

const router = Router()
router.use(authenticate)

const INCLUDE = { history: { orderBy: { at: 'desc' } } }

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Ombor (ehtiyot qismlar)
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     tags: [Inventory]
 *     summary: Ombor ro'yxati
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await prisma.inventoryItem.findMany({
      include: INCLUDE,
      orderBy: { name: 'asc' },
    })
    res.json({ success: true, data: items.map(inventorySerializer) })
  }),
)

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     tags: [Inventory]
 *     summary: Mahsulot qo'shish
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
 *               category: { type: string }
 *               quantity: { type: number }
 *               minimum: { type: number }
 *               purchasePrice: { type: number }
 *               sellingPrice: { type: number }
 *     responses:
 *       201:
 *         description: Yaratildi
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, category = 'engine', quantity = 0, minimum = 0, purchasePrice = 0, sellingPrice = 0 } = req.body
    if (!name) throw new ApiError(400, 'name majburiy')
    const item = await prisma.inventoryItem.create({
      data: {
        code: await nextCode('INV-', 'inventory', 2),
        name,
        category,
        quantity: Number(quantity) || 0,
        minimum: Number(minimum) || 0,
        purchasePrice: Number(purchasePrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        history: {
          create: [{ type: 'stock', quantity: Number(quantity) || 0, note: 'Boshlang\'ich zaxira' }],
        },
      },
      include: INCLUDE,
    })
    res.status(201).json({ success: true, data: inventorySerializer(item) })
  }),
)

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     tags: [Inventory]
 *     summary: Mahsulot detali
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
    const item = await prisma.inventoryItem.findUnique({
      where: { code: req.params.id },
      include: INCLUDE,
    })
    if (!item) throw new ApiError(404, 'Mahsulot topilmadi')
    res.json({ success: true, data: inventorySerializer(item) })
  }),
)

/**
 * @swagger
 * /api/inventory/{id}:
 *   patch:
 *     tags: [Inventory]
 *     summary: Mahsulotni tahrirlash
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
 *               category: { type: string }
 *               minimum: { type: number }
 *               purchasePrice: { type: number }
 *               sellingPrice: { type: number }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await prisma.inventoryItem.findUnique({ where: { code: req.params.id } })
    if (!item) throw new ApiError(404, 'Mahsulot topilmadi')
    const { name, category, minimum, purchasePrice, sellingPrice } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (category !== undefined) data.category = category
    if (minimum !== undefined) data.minimum = Number(minimum)
    if (purchasePrice !== undefined) data.purchasePrice = Number(purchasePrice)
    if (sellingPrice !== undefined) data.sellingPrice = Number(sellingPrice)
    const updated = await prisma.inventoryItem.update({
      where: { id: item.id },
      data,
      include: INCLUDE,
    })
    res.json({ success: true, data: inventorySerializer(updated) })
  }),
)

/**
 * @swagger
 * /api/inventory/{id}/stock:
 *   post:
 *     tags: [Inventory]
 *     summary: Zaxira qo'shish
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
 *             required: [quantity]
 *             properties:
 *               quantity: { type: number }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.post(
  '/:id/stock',
  asyncHandler(async (req, res) => {
    const item = await prisma.inventoryItem.findUnique({ where: { code: req.params.id } })
    if (!item) throw new ApiError(404, 'Mahsulot topilmadi')
    const { quantity = 0, note = '' } = req.body
    const qty = Number(quantity) || 0
    if (qty <= 0) throw new ApiError(400, 'Miqdor musbat bo\'lishi kerak')
    const updated = await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        quantity: item.quantity + qty,
        history: { create: [{ type: 'stock', quantity: qty, note }] },
      },
      include: INCLUDE,
    })
    res.json({ success: true, data: inventorySerializer(updated) })
  }),
)

export default router
