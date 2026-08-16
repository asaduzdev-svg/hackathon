import { Telegraf, Markup } from 'telegraf'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'

const TOKEN = process.env.BOT_TOKEN
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export const telegram = { bot: null, username: '' }

const ORDER_STATUS = {
  new: '🆕 Yangi',
  diagnosing: '🔍 Diagnostikada',
  repairing: '🔧 Ta\'mirda',
  ready: '✅ Tayyor',
  completed: '✔️ Yakunlangan',
  cancelled: '❌ Bekor qilingan',
}

const APPT_STATUS = {
  confirmed: '✅ Tasdiqlangan',
  waiting: '⏳ Kutilmoqda',
  completed: '✔️ Yakunlangan',
  cancelled: '❌ Bekor qilingan',
  no_show: '🚫 Kelmagan',
}

const SPECIALIZATION = {
  mechanic: 'Mexanik',
  electrician: 'Elektrchi',
  diagnostician: 'Diagnost',
  painter: 'Bo\'yoqchi',
  tire: 'Shina montaji',
  'body repair': 'Kuzov ta\'miri',
}

function fmt(n) {
  return `${Number(n || 0).toLocaleString('ru-RU')} so'm`
}

function dateLabel(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })
}

async function settings() {
  return prisma.settings.findUnique({ where: { id: 1 } })
}

async function telegramEnabled() {
  if (!telegram.bot) return false
  const s = await settings()
  return s ? s.notifyTelegram !== false : true
}

async function subscribedChats() {
  const rows = await prisma.telegramChat.findMany({ where: { active: true } })
  return rows.map((r) => r.chatId)
}

async function sendToSubscribers(text, extra) {
  const chats = await subscribedChats()
  if (!chats.length) return false
  let sent = false
  for (const chatId of chats) {
    try {
      await telegram.bot.telegram.sendMessage(chatId, text, extra)
      sent = true
    } catch (err) {
      console.error(`[telegram] sendMessage failed for ${chatId}:`, err.message)
    }
  }
  return sent
}

// ---------- Formatting ----------

function orderText(order) {
  const car = [order.make, order.model].filter(Boolean).join(' ') || '—'
  const lines = [
    `${ORDER_STATUS[order.status] || '📋'} Buyurtma`,
    '',
    `📋 Kodi: <b>${order.code}</b>`,
    `👤 Mijoz: <b>${order.customer?.name || ''}</b>`,
    `📞 Tel: ${order.customer?.phone || '—'}`,
    `🚗 Mashina: ${car}${order.plate ? ` (${order.plate})` : ''}`,
    `🛠 Muammo: ${order.issue || '—'}`,
  ]
  if (order.worker) lines.push(`🔧 Xodim: ${order.worker.name}`)
  if (order.price > 0) lines.push(`💰 Narx: <b>${fmt(order.price)}</b>`)
  if (order.paid > 0) lines.push(`💳 To'langan: ${fmt(order.paid)}`)
  if (order.expectedDate) lines.push(`📅 Muddat: ${dateLabel(order.expectedDate)}`)
  return lines.join('\n')
}

function appointmentText(appt) {
  const lines = [
    `${APPT_STATUS[appt.status] || '📅'} Qabul`,
    '',
    `📋 Kodi: <b>${appt.code}</b>`,
    `👤 Mijoz: <b>${appt.customer?.name || ''}</b>`,
    `📞 Tel: ${appt.customer?.phone || '—'}`,
    `🛠 Xizmat: ${appt.service || '—'}`,
    `📅 Sana: ${dateLabel(appt.date)} ${appt.time || ''}`,
  ]
  if (appt.worker) lines.push(`🔧 Xodim: ${appt.worker.name}`)
  if (appt.notes) lines.push(`📝 Izoh: ${appt.notes}`)
  return lines.join('\n')
}

function workerText(worker, stats = {}) {
  const spec = SPECIALIZATION[worker.specialization] || worker.specialization || 'Mexanik'
  const rating = worker.rating ? `⭐ Reyting: <b>${worker.rating}</b>` : '⭐ Reyting: —'
  const lines = [
    `🧑🔧 Usta: <b>${worker.name}</b>`,
    '',
    `📋 Kodi: <b>${worker.code}</b>`,
    `📞 Tel: ${worker.phone || '—'}`,
    `🛠 Mutaxassislik: <b>${spec}</b>`,
    rating,
  ]
  if (worker.joinedAt) lines.push(`📅 Ishga kirgan: ${dateLabel(worker.joinedAt)}`)
  if (stats.activeOrders !== undefined) lines.push(`🔧 Faol buyurtmalar: <b>${stats.activeOrders}</b>`)
  if (stats.completedOrders !== undefined) lines.push(`✅ Yakunlangan: <b>${stats.completedOrders}</b>`)
  return lines.join('\n')
}

// ---------- Inline keyboards ----------

function orderKeyboard(code) {
  const buttons = [[Markup.button.callback('👀 Ko\'rish', `orders:view:${code}`)]]
  buttons.push([Markup.button.callback('✅ Qabul qilish', `orders:accept:${code}`)])
  buttons.push([
    Markup.button.callback('🔄 Holat', `orders:status:${code}`),
    Markup.button.callback('🚫 Bekor', `orders:cancel:${code}`),
  ])
  buttons.push([Markup.button.url('🌐 Saytda ochish', `${FRONTEND_URL}/orders/${code}`)])
  return Markup.inlineKeyboard(buttons)
}

function orderStatusKeyboard(code, current) {
  const rows = []
  for (const [key, label] of Object.entries(ORDER_STATUS)) {
    if (key === 'cancelled' || key === current) continue
    rows.push([Markup.button.callback(label, `orders:set:${code}:${key}`)])
  }
  rows.push([Markup.button.callback('◀️ Orqaga', `orders:view:${code}`)])
  return Markup.inlineKeyboard(rows)
}

function appointmentKeyboard(code, current) {
  const rows = []
  for (const [key, label] of Object.entries(APPT_STATUS)) {
    if (key === current) continue
    rows.push([Markup.button.callback(label, `appointments:set:${code}:${key}`)])
  }
  rows.push([Markup.button.callback('◀️ Orqaga', `appointments:view:${code}`)])
  return Markup.inlineKeyboard(rows)
}

function mainMenu() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📊 Statistika', 'stats'),
      Markup.button.callback('📋 Faol buyurtmalar', 'orders:list'),
    ],
    [
      Markup.button.callback('🆕 Yangi buyurtmalar', 'orders:new'),
      Markup.button.callback('📅 Bugungi qabullar', 'appointments:today'),
    ],
    [Markup.button.callback('🧑‍🔧 Ustalar', 'workers:list')],
    [Markup.button.callback('👤 Profil', 'profile'), Markup.button.callback('🚪 Chiqish', 'logout')],
  ])
}

// ---------- Login / register (conversation state machine) ----------

const convo = new Map()

const AUTH_MENU = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🔐 Login', 'login')],
    [Markup.button.callback('📝 Register', 'register')],
  ])

const CANCEL_MENU = () => Markup.inlineKeyboard([[Markup.button.callback('◀️ Bekor qilish', 'auth:cancel')]])

function roleLabel(role) {
  return role === 'OWNER' ? 'Egasi' : role === 'WORKER' ? 'Usta' : 'Mijoz'
}

function profileText(user, chat) {
  return (
    '<b>👤 Profil</b>\n\n' +
    `👤 Ism: <b>${user.name}</b>\n` +
    `📧 Email: ${user.email}\n` +
    `📞 Tel: ${user.phone || '—'}\n` +
    `🎭 Rol: <b>${roleLabel(user.role)}</b>\n` +
    (chat ? `🤖 Telegram: @${chat.username || chat.firstName || chat.chatId}` : '')
  )
}

async function linkChatToUser(chatId, userId) {
  await prisma.telegramChat.upsert({
    where: { chatId },
    update: { userId, active: true },
    create: { chatId, userId, active: true },
  })
}

async function authChat(chatId) {
  const chat = await prisma.telegramChat.findUnique({ where: { chatId } })
  if (!chat || !chat.userId) return null
  const user = await prisma.user.findUnique({ where: { id: chat.userId } })
  return user || null
}

// ---------- Notification senders (called from API routes) ----------

export async function notifyOrderCreated(order) {
  if (!(await telegramEnabled())) return
  await sendToSubscribers(
    `<b>🆕 Yangi buyurtma qo'shildi</b>\n\n${orderText(order)}`,
    orderKeyboard(order.code),
  )
}

export async function notifyOrderStatusChanged(order, previousStatus) {
  if (!(await telegramEnabled())) return
  const changed = previousStatus && previousStatus !== order.status
  const prefix = changed
    ? `<b>${ORDER_STATUS[order.status] || '🔄 Holat o\'zgardi'}</b>`
    : `<b>🔁 Buyurtma yangilandi</b>`
  await sendToSubscribers(`${prefix}\n\n${orderText(order)}`, orderKeyboard(order.code))
}

export async function notifyOrderCancelled(order) {
  if (!(await telegramEnabled())) return
  await sendToSubscribers(`<b>❌ Buyurtma bekor qilindi</b>\n\n${orderText(order)}`, orderKeyboard(order.code))
}

export async function notifyPaymentReceived(order, payment) {
  if (!(await telegramEnabled())) return
  await sendToSubscribers(
    `<b>💳 To'lov qabul qilindi</b>\n\n` +
      `📋 Buyurtma: <b>${order.code}</b>\n` +
      `👤 Mijoz: <b>${order.customer?.name || ''}</b>\n` +
      `💰 Summa: <b>${fmt(payment.amount)}</b>\n` +
      `💳 Usul: ${payment.method === 'cash' ? 'Naqd' : payment.method === 'card' ? 'Karta' : 'Pul o\'tkazma'}\n` +
      `📅 Vaqt: ${dateLabel(payment.date)}`,
    orderKeyboard(order.code),
  )
}

export async function notifyAppointmentCreated(appointment) {
  if (!(await telegramEnabled())) return
  await sendToSubscribers(
    `<b>📅 Yangi qabul yozildi</b>\n\n${appointmentText(appointment)}`,
    appointmentKeyboard(appointment.code, appointment.status),
  )
}

export async function sendTelegramTest() {
  if (!(await telegramEnabled())) return false
  return sendToSubscribers(
    '<b>✅ Test xabar</b>\n\nTelegram bot ishlamoqda va AutoCore CRM bilan bog\'langan.',
  )
}

// ---------- Status helpers (used by bot callbacks) ----------

export async function changeOrderStatus(code, status) {
  const order = await prisma.order.findUnique({ where: { code }, include: { customer: true, worker: true } })
  if (!order) throw new Error('Buyurtma topilmadi')
  const STATUS_KEY = {
    new: 'orders.timeline.created',
    diagnosing: 'orders.timeline.diagnosis',
    repairing: 'orders.timeline.repair',
    ready: 'orders.timeline.ready',
    completed: 'orders.timeline.completed',
    cancelled: 'orders.timeline.cancelled',
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status, timeline: { create: { key: STATUS_KEY[status] || 'orders.timeline.created' } } },
    include: { customer: true, worker: true },
  })
  await prisma.activity.create({
    data: { type: 'order_status', key: 'notifications.orderStatus', vars: { id: code, status } },
  })
  await prisma.notification.create({
    data: { type: 'order_status', bodyKey: 'notifications.orderStatus', vars: { id: code, status } },
  })
  return updated
}

export async function changeAppointmentStatus(code, status) {
  const appt = await prisma.appointment.findUnique({ where: { code }, include: { customer: true, worker: true } })
  if (!appt) throw new Error('Qabul topilmadi')
  const updated = await prisma.appointment.update({
    where: { id: appt.id },
    data: { status },
    include: { customer: true, worker: true },
  })
  return updated
}

export async function assignWorkerToOrder(orderCode, workerCode) {
  const order = await prisma.order.findUnique({ where: { code: orderCode } })
  if (!order) throw new Error('Buyurtma topilmadi')
  const worker = await prisma.worker.findUnique({ where: { code: workerCode } })
  if (!worker) throw new Error('Usta topilmadi')
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      workerId: worker.id,
      timeline: { create: { key: 'orders.timeline.assigned', vars: { worker: worker.name } } },
    },
    include: { customer: true, worker: true },
  })
  await prisma.activity.create({
    data: { type: 'order_assign', key: 'notifications.orderStatus', vars: { id: orderCode, worker: worker.name } },
  })
  await prisma.notification.create({
    data: { type: 'order_assign', bodyKey: 'notifications.orderStatus', vars: { id: orderCode, worker: worker.name } },
  })
  return updated
}

export async function getWorkersWithStats() {
  const workers = await prisma.worker.findMany({ orderBy: { joinedAt: 'desc' } })
  const orders = await prisma.order.findMany({ where: { workerId: { not: null } } })
  return workers.map((w) => {
    const own = orders.filter((o) => o.workerId === w.id)
    return {
      ...w,
      activeOrders: own.filter((o) => !['cancelled', 'completed'].includes(o.status)).length,
      completedOrders: own.filter((o) => o.status === 'completed').length,
    }
  })
}

// ---------- Bot logic ----------

function registerHandlers(bot) {
  bot.start(async (ctx) => {
    const chatId = String(ctx.chat.id)
    const { username, first_name: firstName } = ctx.from
    await prisma.telegramChat.upsert({
      where: { chatId },
      update: { username, firstName, active: true },
      create: { chatId, username, firstName, active: true },
    })
    const user = await authChat(chatId)
    if (user) {
      await ctx.replyWithHTML(
        `👋 <b>Xush kelibsiz, ${user.name}!</b>\n\nAutoCore CRM telegram botiga ulangansiz.\nEndi barcha bildirishnomalar shu chatga keladi.`,
        mainMenu(),
      )
      return
    }
    await ctx.replyWithHTML(
      '<b>👋 Xush kelibsiz!</b>\n\nAutoCore CRM telegram botiga ulanish uchun avval <b>login</b> qiling yoki yangi hisob <b>register</b> qiling.\n\nBotda login qilingach — shaxsiy profilingiz, buyurtmalar, ustalar va statistika ochiladi.',
      AUTH_MENU(),
    )
  })

  bot.action('login', async (ctx) => {
    const chatId = String(ctx.chat.id)
    convo.set(chatId, { step: 'email' })
    await ctx.replyWithHTML(
      '<b>🔐 Login</b>\n\n📧 Email manzilingizni yozing.\n<i>Bekor qilish: pastdagi tugma</i>',
      CANCEL_MENU(),
    )
  })

  bot.action('register', async (ctx) => {
    const chatId = String(ctx.chat.id)
    convo.set(chatId, { step: 'name', register: true })
    await ctx.replyWithHTML(
      '<b>📝 Register</b>\n\n👤 Ismingizni yozing.\n<i>Bekor qilish: pastdagi tugma</i>',
      CANCEL_MENU(),
    )
  })

  bot.action('auth:cancel', async (ctx) => {
    const chatId = String(ctx.chat.id)
    convo.delete(chatId)
    await ctx.replyWithHTML('Bekor qilindi. Tanlang:', AUTH_MENU())
  })

  bot.action('profile', async (ctx) => {
    const chatId = String(ctx.chat.id)
    const user = await authChat(chatId)
    if (!user) {
      await ctx.replyWithHTML('Avval login qilishingiz kerak.', AUTH_MENU())
      return
    }
    const chat = await prisma.telegramChat.findUnique({ where: { chatId } })
    const rows = [
      [
        Markup.button.callback('📊 Statistika', 'stats'),
        Markup.button.callback('📋 Buyurtmalar', 'orders:list'),
      ],
      [Markup.button.callback('◀️ Menyu', 'menu'), Markup.button.callback('🚪 Chiqish', 'logout')],
    ]
    await ctx.replyWithHTML(profileText(user, chat), Markup.inlineKeyboard(rows))
  })

  bot.action('logout', async (ctx) => {
    const chatId = String(ctx.chat.id)
    await prisma.telegramChat.updateMany({ where: { chatId }, data: { userId: null } })
    await ctx.editMessageText('🚪 Hisobingizdan chiqdingiz. Qayta kirish uchun:', AUTH_MENU())
  })

  bot.command('menu', async (ctx) => {
    const chatId = String(ctx.chat.id)
    const user = await authChat(chatId)
    if (!user) {
      await ctx.reply('Avval login/register qiling:', AUTH_MENU())
      return
    }
    await ctx.reply('Bosh menyu:', mainMenu())
  })

  bot.action('menu', async (ctx) => {
    const chatId = String(ctx.chat.id)
    const user = await authChat(chatId)
    if (!user) {
      await ctx.editMessageText('Avval login/register qiling:', AUTH_MENU())
      return
    }
    await ctx.editMessageText('Bosh menyu:', mainMenu())
  })

  bot.use(async (ctx, next) => {
    if (!ctx.message?.text) return next()
    const chatId = String(ctx.chat.id)
    const state = convo.get(chatId)
    if (!state) return next()

    const text = String(ctx.message.text).trim()

    if (state.step === 'name') {
      if (text.length < 2) {
        await ctx.reply('Ism juda qisqa. Qayta yozing.')
        return
      }
      convo.set(chatId, { step: 'email', name: text, register: state.register })
      await ctx.reply('📧 Email manzilingizni yozing:')
      return
    }

    if (state.step === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        await ctx.reply('❌ Email noto\'g\'ri formatda. Qayta yozing:')
        return
      }
      if (state.register) {
        convo.set(chatId, { step: 'reg-password', name: state.name, email: text.toLowerCase(), register: true })
        await ctx.reply('🔑 Parol yarating (kamida 6 ta belgi):')
        return
      }
      convo.set(chatId, { ...state, step: 'password', email: text.toLowerCase() })
      await ctx.reply('🔑 Parolni yozing (kamida 6 ta belgi):')
      return
    }

    if (state.step === 'password') {
      const email = state.email
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user || !user.active) {
        await ctx.reply('❌ Bunday foydalanuvchi topilmadi. Emailni qayta tekshiring.')
        convo.delete(chatId)
        return
      }
      const ok = await bcrypt.compare(text, user.password)
      if (!ok) {
        await ctx.reply('❌ Parol noto\'g\'ri. Qayta urinib ko\'ring yoki boshidan boshlang.', AUTH_MENU())
        convo.delete(chatId)
        return
      }
      await linkChatToUser(chatId, user.id)
      convo.delete(chatId)
      await ctx.replyWithHTML(
        `✅ <b>Muvaffaqiyatli login!</b>\n\n👋 Xush kelibsiz, <b>${user.name}</b>!\n${profileText(user)}`,
        mainMenu(),
      )
      return
    }

    if (state.step === 'reg-password') {
      if (text.length < 6) {
        await ctx.reply('❌ Parol kamida 6 ta belgidan iborat bo\'lsin. Qayta yozing:')
        return
      }
      const exists = await prisma.user.findUnique({ where: { email: state.email } })
      if (exists) {
        await ctx.reply('❌ Bu email allaqachon ro\'yxatdan o\'tgan. Boshqa email yozing.', AUTH_MENU())
        convo.delete(chatId)
        return
      }
      const hash = await bcrypt.hash(text, 12)
      const user = await prisma.user.create({
        data: { name: state.name, email: state.email, password: hash, phone: state.phone || '', role: 'CUSTOMER' },
      })
      await linkChatToUser(chatId, user.id)
      convo.delete(chatId)
      await ctx.replyWithHTML(
        `🎉 <b>Ro'yxatdan o'tdingiz!</b>\n\n${profileText(user)}\n\nEndi barcha bildirishnomalar shu chatga keladi.`,
        mainMenu(),
      )
      return
    }
  })

  bot.on('text', async (ctx) => {
    const chatId = String(ctx.chat.id)
    const user = await authChat(chatId)
    if (!user) {
      await ctx.reply('Tushunmadim. Avval login yoki register qiling:', AUTH_MENU())
      return
    }
    await ctx.reply('Tushunmadim. Quyidagi tugmalardan foydalaning:', mainMenu())
  })

  bot.command('stats', async (ctx) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const [orders, payments, appointments] = await Promise.all([
      prisma.order.findMany(),
      prisma.payment.findMany(),
      prisma.appointment.findMany(),
    ])
    const todayOrders = orders.filter((o) => o.createdAt >= d).length
    const inRepair = orders.filter((o) => ['new', 'diagnosing', 'repairing'].includes(o.status)).length
    const ready = orders.filter((o) => o.status === 'ready').length
    const todayRevenue = payments.filter((p) => p.date >= d).reduce((s, p) => s + p.amount, 0)
    const unpaid = orders
      .filter((o) => !['cancelled', 'completed'].includes(o.status))
      .reduce((s, o) => s + (o.price - o.paid), 0)
    await ctx.replyWithHTML(
      '<b>📊 Statistika</b>\n\n' +
        `📦 Bugungi buyurtmalar: <b>${todayOrders}</b>\n` +
        `🔧 Ta'mirda: <b>${inRepair}</b>\n` +
        `✅ Tayyor: <b>${ready}</b>\n` +
        `💰 Bugungi daromad: <b>${fmt(todayRevenue)}</b>\n` +
        `⏳ Qarzdorlik: <b>${fmt(unpaid)}</b>`,
      mainMenu(),
    )
  })

  bot.command('orders', async (ctx) => {
    const orders = await prisma.order.findMany({
      where: { status: { in: ['new', 'diagnosing', 'repairing', 'ready'] } },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 15,
    })
    if (!orders.length) {
      await ctx.reply('📭 Hozircha faol buyurtmalar yo\'q.')
      return
    }
    const text = orders
      .map((o) => `${ORDER_STATUS[o.status]} <b>${o.code}</b> — ${o.customer?.name || ''} (${o.make} ${o.model})`)
      .join('\n')
    await ctx.replyWithHTML(`<b>📋 Faol buyurtmalar</b>\n\n${text}`, mainMenu())
  })

  bot.command(['ustalar', 'workers'], async (ctx) => {
    const workers = await getWorkersWithStats()
    if (!workers.length) {
      await ctx.reply('🧑‍🔧 Hozircha ustalar yo\'q.')
      return
    }
    const rows = workers.map((w) => [
      Markup.button.callback(`${w.name} ⭐${w.rating}`, `workers:view:${w.code}`),
    ])
    rows.push([Markup.button.callback('◀️ Menyu', 'menu')])
    await ctx.reply('🧑‍🔧 <b>Ustalar</b>', { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) })
  })

  bot.action('workers:list', async (ctx) => {
    const workers = await getWorkersWithStats()
    if (!workers.length) {
      await ctx.answerCbQuery('Ustalar yo\'q')
      await ctx.editMessageText('🧑‍🔧 Hozircha ustalar yo\'q.')
      return
    }
    const rows = workers.map((w) => [
      Markup.button.callback(`${w.name} ⭐${w.rating}`, `workers:view:${w.code}`),
    ])
    rows.push([Markup.button.callback('◀️ Menyu', 'menu')])
    await ctx.editMessageText('🧑‍🔧 <b>Ustalar</b>', { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) })
  })

  bot.action(/^workers:view:(.+)$/, async (ctx) => {
    const code = ctx.match[1]
    const worker = (await getWorkersWithStats()).find((w) => w.code === code)
    if (!worker) {
      await ctx.answerCbQuery('Usta topilmadi')
      return
    }
    const rows = [
      [Markup.button.callback('📋 Buyurtmalari', `workers:orders:${worker.code}`)],
      [Markup.button.callback('◀️ Orqaga', 'workers:list')],
    ]
    await ctx.editMessageText(workerText(worker, worker), { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) })
  })

  bot.action(/^workers:orders:(.+)$/, async (ctx) => {
    const code = ctx.match[1]
    const worker = await prisma.worker.findUnique({ where: { code } })
    if (!worker) {
      await ctx.answerCbQuery('Usta topilmadi')
      return
    }
    const orders = await prisma.order.findMany({
      where: { workerId: worker.id },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 15,
    })
    if (!orders.length) {
      await ctx.answerCbQuery('Buyurtmalari yo\'q')
      await ctx.editMessageText(`${worker.name} hali buyurtmalarga tayinlanmagan.`)
      return
    }
    const rows = orders.map((o) => [
      Markup.button.callback(`${ORDER_STATUS[o.status]} ${o.code} — ${o.customer?.name || ''}`, `orders:view:${o.code}`),
    ])
    rows.push([Markup.button.callback('◀️ Orqaga', `workers:view:${worker.code}`)])
    await ctx.editMessageText(`🧑‍🔧 <b>${worker.name}</b> — buyurtmalari`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(rows),
    })
  })

  bot.action('stats', async (ctx) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const [orders, payments, appointments] = await Promise.all([
      prisma.order.findMany(),
      prisma.payment.findMany(),
      prisma.appointment.findMany(),
    ])
    const todayOrders = orders.filter((o) => o.createdAt >= d).length
    const inRepair = orders.filter((o) => ['new', 'diagnosing', 'repairing'].includes(o.status)).length
    const ready = orders.filter((o) => o.status === 'ready').length
    const todayRevenue = payments.filter((p) => p.date >= d).reduce((s, p) => s + p.amount, 0)
    const unpaid = orders
      .filter((o) => !['cancelled', 'completed'].includes(o.status))
      .reduce((s, o) => s + (o.price - o.paid), 0)
    await ctx.editMessageText(
      '<b>📊 Statistika</b>\n\n' +
        `📦 Bugungi buyurtmalar: <b>${todayOrders}</b>\n` +
        `🔧 Ta'mirda: <b>${inRepair}</b>\n` +
        `✅ Tayyor: <b>${ready}</b>\n` +
        `💰 Bugungi daromad: <b>${fmt(todayRevenue)}</b>\n` +
        `⏳ Qarzdorlik: <b>${fmt(unpaid)}</b>`,
      { parse_mode: 'HTML', ...mainMenu() },
    )
  })

  bot.action('orders:list', async (ctx) => {
    const orders = await prisma.order.findMany({
      where: { status: { in: ['new', 'diagnosing', 'repairing', 'ready'] } },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 15,
    })
    if (!orders.length) {
      await ctx.answerCbQuery('Faol buyurtmalar yo\'q')
      await ctx.editMessageText('📭 Hozircha faol buyurtmalar yo\'q.')
      return
    }
    const rows = orders.map((o) => [Markup.button.callback(`${ORDER_STATUS[o.status]} ${o.code}`, `orders:view:${o.code}`)])
    rows.push([Markup.button.callback('◀️ Menyu', 'menu')])
    await ctx.editMessageText('📋 <b>Faol buyurtmalar</b>', { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) })
  })

  bot.action('orders:new', async (ctx) => {
    const orders = await prisma.order.findMany({
      where: { status: 'new' },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 15,
    })
    if (!orders.length) {
      await ctx.answerCbQuery('Yangi buyurtmalar yo\'q')
      await ctx.editMessageText('🎉 Barcha buyurtmalar qabul qilingan.')
      return
    }
    const rows = orders.map((o) => [Markup.button.callback(`🆕 ${o.code} — ${o.customer?.name || ''}`, `orders:view:${o.code}`)])
    rows.push([Markup.button.callback('◀️ Menyu', 'menu')])
    await ctx.editMessageText('🆕 <b>Yangi buyurtmalar</b>', { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) })
  })

  bot.action('appointments:today', async (ctx) => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    const appts = await prisma.appointment.findMany({
      where: { date: { gte: start, lt: end } },
      include: { customer: true, worker: true },
      orderBy: { time: 'asc' },
    })
    if (!appts.length) {
      await ctx.answerCbQuery('Bugungi qabullar yo\'q')
      await ctx.editMessageText('📅 Bugungi qabullar yo\'q.')
      return
    }
    const rows = appts.map((a) => [
      Markup.button.callback(`${a.time} ${a.service} — ${a.customer?.name || ''}`, `appointments:view:${a.code}`),
    ])
    rows.push([Markup.button.callback('◀️ Menyu', 'menu')])
    await ctx.editMessageText('📅 <b>Bugungi qabullar</b>', { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) })
  })

  bot.action(/^orders:view:(.+)$/, async (ctx) => {
    const code = ctx.match[1]
    const order = await prisma.order.findUnique({
      where: { code },
      include: { customer: true, worker: true, payments: true },
    })
    if (!order) {
      await ctx.answerCbQuery('Buyurtma topilmadi')
      return
    }
    const msg = orderText(order)
    const rows = [
      [Markup.button.callback('✅ Qabul qilish', `orders:accept:${code}`)],
      [Markup.button.callback('🔄 Holat', `orders:status:${code}`)],
    ]
    if (order.worker) {
      rows.push([Markup.button.callback(`🔧 Usta: ${order.worker.name}`, `workers:view:${order.worker.code}`)])
    } else {
      rows.push([Markup.button.callback('🔧 Usta tayinlash', `orders:assign:${code}`)])
    }
    if (!['cancelled', 'completed'].includes(order.status)) {
      rows.push([Markup.button.callback('🚫 Bekor qilish', `orders:cancel:${code}`)])
    }
    rows.push([Markup.button.url('🌐 Saytda ochish', `${FRONTEND_URL}/orders/${code}`)])
    rows.push([Markup.button.callback('◀️ Orqaga', 'orders:list')])
    await ctx.editMessageText(msg, { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) })
  })

  bot.action(/^orders:accept:(.+)$/, async (ctx) => {
    const code = ctx.match[1]
    try {
      const order = await changeOrderStatus(code, 'diagnosing')
      await ctx.editMessageText(
        `<b>✅ Qabul qilindi</b>\n\n${orderText(order)}`,
        { parse_mode: 'HTML', ...orderKeyboard(order.code) },
      )
    } catch (err) {
      await ctx.answerCbQuery(err.message || 'Xatolik')
    }
  })

  bot.action(/^orders:status:(.+)$/, async (ctx) => {
    const code = ctx.match[1]
    const order = await prisma.order.findUnique({ where: { code } })
    if (!order) {
      await ctx.answerCbQuery('Buyurtma topilmadi')
      return
    }
    await ctx.editMessageText(
      `<b>🔄 Holatni tanlang</b>\n\n${orderText(order)}`,
      { parse_mode: 'HTML', ...orderStatusKeyboard(code, order.status) },
    )
  })

  bot.action(/^orders:set:(.+):(.+)$/, async (ctx) => {
    const [, code, status] = ctx.match
    try {
      const order = await changeOrderStatus(code, status)
      await ctx.editMessageText(
        `<b>${ORDER_STATUS[status] || 'Holat o\'zgardi'}</b>\n\n${orderText(order)}`,
        { parse_mode: 'HTML', ...orderKeyboard(order.code) },
      )
    } catch (err) {
      await ctx.answerCbQuery(err.message || 'Xatolik')
    }
  })

  bot.action(/^orders:cancel:(.+)$/, async (ctx) => {
    const code = ctx.match[1]
    try {
      const order = await changeOrderStatus(code, 'cancelled')
      await ctx.editMessageText(
        `<b>❌ Buyurtma bekor qilindi</b>\n\n${orderText(order)}`,
        { parse_mode: 'HTML', ...orderKeyboard(order.code) },
      )
    } catch (err) {
      await ctx.answerCbQuery(err.message || 'Xatolik')
    }
  })

  bot.action(/^orders:assign:(.+):(.+)$/, async (ctx) => {
    const [, orderCode, workerCode] = ctx.match
    try {
      const order = await assignWorkerToOrder(orderCode, workerCode)
      await ctx.editMessageText(
        `<b>🔧 Usta tayinlandi: ${order.worker.name}</b>\n\n${orderText(order)}`,
        { parse_mode: 'HTML', ...orderKeyboard(order.code) },
      )
    } catch (err) {
      await ctx.answerCbQuery(err.message || 'Xatolik')
    }
  })

  bot.action(/^orders:assign:(.+)$/, async (ctx) => {
    const orderCode = ctx.match[1]
    const workers = await getWorkersWithStats()
    if (!workers.length) {
      await ctx.answerCbQuery('Ustalar yo\'q')
      return
    }
    const rows = workers.map((w) => [
      Markup.button.callback(`${w.name} ⭐${w.rating}`, `orders:assign:${orderCode}:${w.code}`),
    ])
    rows.push([Markup.button.callback('◀️ Orqaga', `orders:view:${orderCode}`)])
    await ctx.editMessageText('🔧 <b>Usta tanlang</b>', { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) })
  })

  bot.action(/^appointments:view:(.+)$/, async (ctx) => {
    const code = ctx.match[1]
    const appt = await prisma.appointment.findUnique({
      where: { code },
      include: { customer: true, worker: true },
    })
    if (!appt) {
      await ctx.answerCbQuery('Qabul topilmadi')
      return
    }
    await ctx.editMessageText(appointmentText(appt), {
      parse_mode: 'HTML',
      ...appointmentKeyboard(appt.code, appt.status),
    })
  })

  bot.action(/^appointments:set:(.+):(.+)$/, async (ctx) => {
    const [, code, status] = ctx.match
    try {
      const appt = await changeAppointmentStatus(code, status)
      await ctx.editMessageText(appointmentText(appt), {
        parse_mode: 'HTML',
        ...appointmentKeyboard(appt.code, appt.status),
      })
    } catch (err) {
      await ctx.answerCbQuery(err.message || 'Xatolik')
    }
  })

  bot.action('menu', async (ctx) => {
    await ctx.editMessageText('Bosh menyu:', mainMenu())
  })

  bot.on('text', async (ctx) => {
    await ctx.reply('Tushunmadim. Quyidagi tugmalardan foydalaning:', mainMenu())
  })
}

export function initTelegramBot() {
  if (!TOKEN) {
    console.log('[telegram] BOT_TOKEN topilmadi, bot o\'chirilgan')
    return null
  }
  const bot = new Telegraf(TOKEN)
  registerHandlers(bot)
  telegram.bot = bot
  bot.launch().then(() => {
    console.log('[telegram] Bot ishga tushdi')
    return Promise.all([bot.telegram.getMe(), bot.telegram.setMyCommands([
      { command: 'start', description: 'Botni boshlash va ulanish' },
      { command: 'menu', description: 'Bosh menyu' },
      { command: 'stats', description: 'Statistika' },
      { command: 'orders', description: 'Faol buyurtmalar' },
      { command: 'ustalar', description: 'Ustalar ro\'yxati' },
    ])])
  }).then(([me]) => {
    telegram.username = me.username
    console.log(`[telegram] Bot: @${me.username}`)
  }).catch((err) => {
    console.error('[telegram] Bot ishga tushmadi:', err.message || err)
    telegram.bot = null
  })
  return bot
}

export async function getBotStatus() {
  const [chatCount, s] = await Promise.all([prisma.telegramChat.count({ where: { active: true } }), settings()])
  let username = telegram.username
  if (!username && telegram.bot) {
    try {
      const me = await telegram.bot.telegram.getMe()
      username = telegram.username = me.username
    } catch {
      /* bot not reachable */
    }
  }
  return {
    configured: !!TOKEN,
    username,
    chatCount,
    notifyTelegram: s ? s.notifyTelegram !== false : false,
  }
}
