import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const ACCESS = process.env.JWT_ACCESS_SECRET
const REFRESH = process.env.JWT_REFRESH_SECRET

export const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m'
export const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d'

export const accessCookie = (token) => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined,
  maxAge: 15 * 60 * 1000,
  path: '/',
})

export const refreshCookie = (token) => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth/refresh',
})

export function signAccess(payload) {
  return jwt.sign(payload, ACCESS, { expiresIn: ACCESS_EXPIRES })
}

export function signRefresh(payload) {
  return jwt.sign(payload, REFRESH, { expiresIn: REFRESH_EXPIRES })
}

export function verifyAccess(token) {
  return jwt.verify(token, ACCESS)
}

export function verifyRefresh(token) {
  return jwt.verify(token, REFRESH)
}

export async function createRefreshToken(user) {
  const token = signRefresh({ sub: user.id })
  await prisma.refreshToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
  return token
}
