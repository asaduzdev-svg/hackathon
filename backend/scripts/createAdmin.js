import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
const SALT = 12

async function main() {
  const hash = await bcrypt.hash('admin123', SALT)
  const existing = await prisma.user.findUnique({ where: { email: 'admin@gmail.com' } })

  if (existing) {
    await prisma.user.update({
      where: { email: 'admin@gmail.com' },
      data: { password: hash, role: 'OWNER', active: true },
    })
    console.log('✅ admin@gmail.com yangilandi (parol: admin123)')
  } else {
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: hash,
        role: 'OWNER',
        phone: '+998 90 000 00 00',
        active: true,
      },
    })
    console.log('✅ admin@gmail.com yaratildi (parol: admin123, role: OWNER)')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
