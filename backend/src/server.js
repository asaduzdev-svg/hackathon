import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'
import { prisma } from './lib/prisma.js'

// Vercel serverless muhitida BOT_TOKEN bo'lsa ham long-running botni
// ishga tushirmaymiz, chunki serverless funksiya qisqa muddatli.
// Faqat local yoki aniq belgilangan muhitda botni yoqamiz.
const isVercel = !!process.env.VERCEL
const isServerless = isVercel || process.env.SERVERLESS === 'true'

async function startLocal() {
  if (isServerless) return // serverless: app export qilinadi, listen qilmaymiz

  try {
    await prisma.$connect()
    console.log('PostgreSQL connected')
  } catch (err) {
    console.error('Failed to connect to database:', err)
    process.exit(1)
  }

  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`AutoCore CRM API running on http://localhost:${PORT}`)
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`)
  })

  // Telegram bot — faqat serverless bo'lmagan muhitda
  try {
    const { initTelegramBot, telegram } = await import('./services/telegram.js')
    initTelegramBot()

    const shutdown = () => {
      if (telegram.bot) telegram.bot.stop('shutdown')
      prisma.$disconnect().finally(() => process.exit(0))
    }
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (err) {
    console.error('Telegram bot init error:', err.message)
  }
}

startLocal()

// Vercel serverless funksiyalar uchun app ni default export qilamiz
export default app
