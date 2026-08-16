import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import routes from './routes/index.js'
import { notFound, errorHandler } from './middleware/error.js'
import { swaggerSpec } from './config/swagger.js'

const app = express()

// CORS — production'da aniq frontend domeniga ruxsat beramiz.
// Development va serverless preview muhitlarida hamma originlarga ruxsat beramiz.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const allowedOrigins = FRONTEND_URL.split(',').map((s) => s.trim()).filter(Boolean)

app.use(
  cors({
    origin(origin, cb) {
      // Same-origin (server o'ziga) yoki no-origin (Postman, server-side fetch) uchun ruxsat.
      if (!origin) return cb(null, true)
      if (allowedOrigins.length === 0) return cb(null, true)
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return cb(null, true)
      }
      return cb(null, false)
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.json({ success: true, message: 'AutoCore CRM API ishlayapti', docs: '/api-docs' })
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app
