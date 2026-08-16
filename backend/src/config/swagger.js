import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AutoCore CRM API',
      version: '1.0.0',
      description:
        'Avto servis CRM uchun REST API. Auth JWT access + refresh token orqali, tokenlar httpOnly cookie\'da saqlanadi.',
    },
    servers: [{ url: 'http://localhost:5000', description: 'Local server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
}

export const swaggerSpec = swaggerJsdoc(options)
