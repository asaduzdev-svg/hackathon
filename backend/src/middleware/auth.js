import { prisma } from '../lib/prisma.js'
import { verifyAccess } from '../utils/jwt.js'
import { ApiError } from './error.js'

export async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.access_token
    if (!token) {
      throw new ApiError(401, 'Avtorizatsiya talab qilinadi')
    }
    let payload
    try {
      payload = verifyAccess(token)
    } catch {
      throw new ApiError(401, 'Sessiya muddati tugagan')
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.active) {
      throw new ApiError(401, 'Foydalanuvchi topilmadi')
    }
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

export const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Avtorizatsiya talab qilinadi'))
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Ruxsat yo\'q'))
  }
  next()
}
