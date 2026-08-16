import { Router } from 'express'
import authRoutes from './auth.routes.js'
import customerRoutes from './customer.routes.js'
import workerRoutes from './worker.routes.js'
import orderRoutes from './order.routes.js'
import paymentRoutes from './payment.routes.js'
import appointmentRoutes from './appointment.routes.js'
import inventoryRoutes from './inventory.routes.js'
import reportRoutes from './report.routes.js'
import systemRoutes from './system.routes.js'
import aiRoutes from './ai.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/customers', customerRoutes)
router.use('/workers', workerRoutes)
router.use('/orders', orderRoutes)
router.use('/payments', paymentRoutes)
router.use('/appointments', appointmentRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/reports', reportRoutes)
router.use('/ai', aiRoutes)
router.use(systemRoutes)

export default router
