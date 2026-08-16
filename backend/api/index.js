// Vercel serverless entry point. Bu fayl Vercel tomonidan
// har bir so'rov uchun ishga tushiriladi, shuning uchun u Express app ni
// export qiladi. Telegram bot va prisma.$connect() bu yerda chaqirilmaydi
// (ular `server.js` da local muhit uchun bajariladi).
import app from '../src/app.js'

export default app
