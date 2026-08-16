import { prisma } from '../lib/prisma.js'

export async function nextCode(prefix, seqName, pad = 0) {
  const row = await prisma.sequence.upsert({
    where: { name: seqName },
    update: {},
    create: { name: seqName, value: 1 },
  })
  const value = row.value
  await prisma.sequence.update({ where: { name: seqName }, data: { value: value + 1 } })
  const num = pad > 0 ? String(value).padStart(pad, '0') : value
  return `${prefix}${num}`
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
  }
}

export function orderSerializer(order) {
  return {
    id: order.code,
    customerId: order.customer?.code || '',
    customerName: order.customer?.name || '',
    phone: order.customer?.phone || '',
    carType: order.carType,
    make: order.make,
    model: order.model,
    year: order.year,
    plate: order.plate,
    issue: order.issue,
    condition: order.condition,
    workerId: order.worker?.code || null,
    workerName: order.worker?.name || '',
    status: order.status,
    priority: order.priority,
    price: order.price,
    paid: order.paid,
    createdAt: order.createdAt,
    expectedDate: order.expectedDate,
    notes: order.notes || '',
    cancelledReason: order.cancelledReason || '',
    timeline: (order.timeline || []).map((t) => ({
      id: t.id,
      key: t.key,
      vars: t.vars || {},
      at: t.at,
    })),
    payments: (order.payments || []).map((p) => ({
      id: p.code,
      orderId: order.code,
      amount: p.amount,
      method: p.method,
      date: p.date,
      status: p.status,
    })),
  }
}

export function customerSerializer(customer, extra = {}) {
  return {
    id: customer.code,
    name: customer.name,
    phone: customer.phone,
    telegram: customer.telegram || '',
    createdAt: customer.createdAt,
    notes: customer.notes || '',
    ...extra,
  }
}

export function workerSerializer(worker, extra = {}) {
  return {
    id: worker.code,
    name: worker.name,
    phone: worker.phone,
    specialization: worker.specialization,
    joinedAt: worker.joinedAt,
    rating: worker.rating,
    ...extra,
  }
}

export function appointmentSerializer(appointment, extra = {}) {
  return {
    id: appointment.code,
    customerId: appointment.customer?.code || '',
    customerName: appointment.customer?.name || '',
    phone: appointment.customer?.phone || '',
    service: appointment.service,
    workerId: appointment.worker?.code || null,
    workerName: appointment.worker?.name || '',
    date: appointment.date,
    time: appointment.time,
    status: appointment.status,
    notes: appointment.notes || '',
    ...extra,
  }
}

export function inventorySerializer(item, extra = {}) {
  return {
    id: item.code,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    minimum: item.minimum,
    purchasePrice: item.purchasePrice,
    sellingPrice: item.sellingPrice,
    history: (item.history || []).map((h) => ({
      id: h.id,
      type: h.type,
      quantity: h.quantity,
      note: h.note,
      at: h.at,
    })),
    ...extra,
  }
}
