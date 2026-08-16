import { paymentsApi } from './modules/paymentsApi.js'

export const paymentService = {
  list: (params) => paymentsApi.list(params).then((r) => r.data || []),
  summary: () => paymentsApi.summary().then((r) => r.data),
  create: ({ orderId, amount, method }) => paymentsApi.create({ orderId, amount, method }).then((r) => r),
}
