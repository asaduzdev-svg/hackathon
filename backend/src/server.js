import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'
import { prisma } from './lib/prisma.js'
import { initTelegramBot, telegram } from './services/telegram.js'

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await prisma.$connect()
    console.log('PostgreSQL connected')
    app.listen(PORT, () => {
      console.log(`AutoCore CRM API running on http://localhost:${PORT}`)
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`)
    })
    initTelegramBot()
  } catch (err) {
    console.error('Failed to connect to database:', err)
    process.exit(1)
  }
}

function shutdown() {
  if (telegram.bot) telegram.bot.stop('shutdown')
  prisma.$disconnect().finally(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

start()
