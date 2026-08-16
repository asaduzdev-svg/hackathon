import { getState, updateState, wait } from './store.js'
import { nextId, uid } from '../utils/id.js'
import { activityService } from './activityService.js'
import { notificationService } from './notificationService.js'

export const appointmentService = {
  async list() {
    await wait()
    return getState().appointments
  },

  async getById(id) {
    await wait()
    return getState().appointments.find((a) => a.id === id) || null
  },

  async create(input) {
    await wait()
    const state = getState()
    const appointment = {
      id: nextId('APT-', state.appointments),
      customerId: input.customerId || '',
      customerName: input.customerName,
      phone: input.phone || '',
      service: input.service,
      workerId: input.workerId,
      workerName: state.workers.find((w) => w.id === input.workerId)?.name || '',
      date: input.date,
      time: input.time,
      status: 'confirmed',
      notes: input.notes || '',
    }
    updateState((s) => ({ ...s, appointments: [...s.appointments, appointment] }))
    return appointment
  },

  async updateStatus(id, status) {
    await wait()
    const state = getState()
    const appointment = state.appointments.find((a) => a.id === id)
    if (!appointment) return null
    const updated = { ...appointment, status }
    updateState((s) => ({
      ...s,
      appointments: s.appointments.map((a) => (a.id === id ? updated : a)),
    }))

    if (status === 'no_show') {
      await activityService.add({
        id: uid(),
        type: 'no_show',
        key: 'notifications.noShow',
        vars: { customer: appointment.customerName },
        at: new Date().toISOString(),
      })
      await notificationService.sendNoShowNotification(appointment)
    } else if (status === 'confirmed') {
      await activityService.add({
        id: uid(),
        type: 'appointment',
        key: 'notifications.appointmentReminder',
        vars: { time: appointment.time, customer: appointment.customerName },
        at: new Date().toISOString(),
      })
    }
    return updated
  },
}
