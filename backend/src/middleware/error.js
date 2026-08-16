export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

export const notFound = (req, res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, message: err.message, details: err.details })
  }
  if (err?.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Bu ma\'lumot allaqachon mavjud' })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Topilmadi' })
    }
  }
  console.error('[ERROR]', err)
  return res.status(500).json({ success: false, message: 'Server xatosi' })
}
