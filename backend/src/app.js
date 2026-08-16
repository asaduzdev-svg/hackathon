import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import routes from './routes/index.js'
import { notFound, errorHandler } from './middleware/error.js'
import { swaggerSpec } from './config/swagger.js'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }))
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
