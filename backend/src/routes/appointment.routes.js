import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ApiError, asyncHandler } from '../middleware/error.js'
import { authenticate } from '../middleware/auth.js'
import { nextCode, appointmentSerializer } from '../utils/helpers.js'
import { notifyAppointmentCreated } from '../services/telegram.js'

const router = Router()
router.use(authenticate)

const INCLUDE = { customer: true, worker: true }

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Qabullar
 */

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Qabullar ro'yxati
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const appointments = await prisma.appointment.findMany({
      include: INCLUDE,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    })
    res.json({ success: true, data: appointments.map(appointmentSerializer) })
  }),
)

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Qabul yaratish
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [service, date]
 *             properties:
 *               customerId: { type: string }
 *               customerName: { type: string }
 *               phone: { type: string }
 *               service: { type: string }
 *               workerId: { type: string }
 *               date: { type: string }
 *               time: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Yaratildi
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { customerId, customerName, phone, service, workerId = null, date, time = '10:00', notes = '' } = req.body
    if (!service) throw new ApiError(400, 'service majburiy')
    if (!date) throw new ApiError(400, 'date majburiy')

    let customer
    if (customerId) {
      customer = await prisma.customer.findUnique({ where: { code: customerId } })
    } else if (customerName) {
      customer = await prisma.customer.create({
        data: {
          code: await nextCode('CUS-', 'customer', 3),
          name: customerName,
          phone: phone || '',
        },
      })
    }
    if (!customer) throw new ApiError(400, 'customerId yoki customerName talab qilinadi')

    let worker = null
    if (workerId) {
      worker = await prisma.worker.findUnique({ where: { code: workerId } })
      if (!worker) throw new ApiError(404, 'Xodim topilmadi')
    }

    const appointment = await prisma.appointment.create({
      data: {
        code: await nextCode('APT-', 'appointment', 0),
        customerId: customer.id,
        workerId: worker?.id || null,
        service,
        date: new Date(date),
        time,
        notes,
      },
      include: INCLUDE,
    })
    notifyAppointmentCreated(appointment).catch(() => {})
    res.status(201).json({ success: true, data: appointmentSerializer(appointment) })
  }),
)

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     tags: [Appointments]
 *     summary: Qabul holatini o'zgartirish
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
    const appointment = await prisma.appointment.findUnique({ where: { code: req.params.id } })
    if (!appointment) throw new ApiError(404, 'Qabul topilmadi')
    const { status } = req.body
    if (!status) throw new ApiError(400, 'status majburiy')
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status },
      include: INCLUDE,
    })
    if (status === 'no_show') {
      await prisma.activity.create({
        data: {
          type: 'no_show',
          key: 'notifications.noShow',
          vars: { customer: appointment.customer?.name || '' },
        },
      })
    }
    res.json({ success: true, data: appointmentSerializer(updated) })
  }),
)

export default router
