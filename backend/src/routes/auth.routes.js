import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { ApiError, asyncHandler } from '../middleware/error.js'
import { authenticate } from '../middleware/auth.js'
import { publicUser } from '../utils/helpers.js'
import {
  signAccess,
  createRefreshToken,
  accessCookie,
  refreshCookie,
  verifyRefresh,
} from '../utils/jwt.js'

const router = Router()

const SALT_ROUNDS = 12

function setCookies(res, user) {
  const access = signAccess({ sub: user.id, role: user.role })
  res.cookie('access_token', access, accessCookie(access))
}

async function issueTokens(res, user) {
  setCookies(res, user)
  const refresh = await createRefreshToken(user)
  res.cookie('refresh_token', refresh, refreshCookie(refresh))
}

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentifikatsiya
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Ro'yxatdan o'tish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: Muvaffaqiyatli ro'yxatdan o'tildi
 */
// Email -> role mapping. SUPER_ADMIN va WORKER faqat maxsus login/parollar orqali.
const SPECIAL_ACCOUNTS = {
  'admin@gmail.com': 'OWNER',
  'ustalar@gmail.com': 'WORKER',
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, phone = '' } = req.body
    if (!name || !email || !password) {
      throw new ApiError(400, 'name, email va password majburiy')
    }
    if (String(password).length < 6) {
      throw new ApiError(400, 'Parol kamida 6 belgidan iborat bo\'lsin')
    }
    const normalizedEmail = String(email).toLowerCase()
    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (exists) {
      throw new ApiError(409, 'Bu email allaqachon ro\'yxatdan o\'tgan')
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    // Yangi foydalanuvchilar doim CUSTOMER (consumer) sifatida ro'yxatdan o'tadi.
    // SUPER_ADMIN va WORKER rollari faqat maxsus hisoblar orqali beriladi.
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hash,
        phone,
        role: 'CUSTOMER',
      },
    })
    await issueTokens(res, user)
    res.status(201).json({ success: true, user: publicUser(user) })
  }),
)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Tizimga kirish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli kirish
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
      throw new ApiError(400, 'email va password majburiy')
    }
    const normalizedEmail = String(email).toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user || !user.active) {
      throw new ApiError(401, 'Email yoki parol noto\'g\'ri')
    }
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      throw new ApiError(401, 'Email yoki parol noto\'g\'ri')
    }
    // Super admin (admin@gmail.com) va worker (ustalar@gmail.com) maxsus rollarini har doim tiklab turamiz.
    let updatedUser = user
    if (SPECIAL_ACCOUNTS[normalizedEmail] && user.role !== SPECIAL_ACCOUNTS[normalizedEmail]) {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { role: SPECIAL_ACCOUNTS[normalizedEmail] },
      })
    }
    await issueTokens(res, updatedUser)
    res.json({ success: true, user: publicUser(updatedUser) })
  }),
)

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Access token'ni yangilash (refresh token cookie orqali)
 *     responses:
 *       200:
 *         description: Token yangilandi
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refresh_token
    if (!token) throw new ApiError(401, 'Refresh token topilmadi')
    let payload
    try {
      payload = verifyRefresh(token)
    } catch {
      throw new ApiError(401, 'Refresh token muddati tugagan')
    }
    const stored = await prisma.refreshToken.findUnique({ where: { token } })
    if (!stored) throw new ApiError(401, 'Refresh token yaroqsiz')
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.active) throw new ApiError(401, 'Foydalanuvchi topilmadi')
    setCookies(res, user)
    res.json({ success: true, user: publicUser(user) })
  }),
)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Tizimdan chiqish
 *     responses:
 *       200:
 *         description: Chiqildi
 */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refresh_token
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } })
    }
    res.clearCookie('access_token', { httpOnly: true, path: '/' })
    res.clearCookie('refresh_token', { httpOnly: true, path: '/api/auth/refresh' })
    res.json({ success: true })
  }),
)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Joriy foydalanuvchi
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Foydalanuvchi ma'lumotlari
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ success: true, user: publicUser(req.user) })
  }),
)

export default router
