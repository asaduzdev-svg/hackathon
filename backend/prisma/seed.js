import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

const SALT = 12
const now = () => new Date()
const daysAgo = (d, h = 9, m = 0) => {
  const dt = new Date()
  dt.setDate(dt.getDate() - d)
  dt.setHours(h, m, 0, 0)
  return dt
}
const todayAt = (h, m) => {
  const dt = new Date()
  dt.setHours(h, m, 0, 0)
  return dt
}
const tomorrowAt = (h, m) => {
  const dt = todayAt(h, m)
  dt.setDate(dt.getDate() + 1)
  return dt
}

async function seq(name, start = 1) {
  const row = await prisma.sequence.upsert({
    where: { name },
    update: {},
    create: { name, value: start },
  })
  const value = row.value
  await prisma.sequence.update({ where: { name }, data: { value: value + 1 } })
  return value
}

async function main() {
  console.log('Cleaning database...')
  await prisma.notification.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderTimeline.deleteMany()
  await prisma.order.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.inventoryHistory.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.worker.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.sequence.deleteMany()

  // ---------- Users ----------
  const hash = await bcrypt.hash('demo123', SALT)
  await prisma.user.createMany({
    data: [
      { name: 'Sardor Karimov', email: 'owner@autocore.app', password: hash, role: 'OWNER', phone: '+998 90 123 45 67' },
      { name: 'Bekzod Rahimov', email: 'bekzod@autocore.app', password: hash, role: 'WORKER', phone: '+998 90 111 22 33' },
      { name: 'Azizbek Karimov', email: 'azizbek@autocore.app', password: hash, role: 'CUSTOMER', phone: '+998 90 123 45 67' },
    ],
  })

  // ---------- Settings ----------
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      businessName: 'AutoCore',
      businessPhone: '+998 90 000 00 00',
      address: 'Toshkent sh., Chilonzor tumani, 12-kvartal',
      hours: '09:00 — 20:00',
      profileName: 'Sardor Karimov',
      profilePhone: '+998 90 123 45 67',
      profileEmail: 'owner@autocore.app',
    },
  })

  // ---------- Customers ----------
  const customerData = [
    ['Azizbek Karimov', '+998 90 123 45 67', '@azizkarimov', 'Doimiy mijoz', daysAgo(40)],
    ['Madina Karimova', '+998 93 456 78 90', '@madina_k', '', daysAgo(35)],
    ['Jasur Abdullayev', '+998 94 567 89 01', '@jasurabd', '', daysAgo(30)],
    ['Nilufar Toshmatova', '+998 91 234 56 78', '@nilufart', '', daysAgo(28)],
    ['Sherzod Ismoilov', '+998 95 678 90 12', '@sherzod_i', '', daysAgo(25)],
    ['Malika Yusupova', '+998 90 345 67 89', '@malikay', '', daysAgo(22)],
    ['Ulugbek Nazarov', '+998 97 456 78 90', '@ulugnazarov', '', daysAgo(20)],
    ['Zilola Hamidova', '+998 93 678 90 12', '@zilolah', '', daysAgo(18)],
    ['Sanjar Qodirov', '+998 91 789 01 23', '@sanjarq', '', daysAgo(15)],
    ['Feruza Saidova', '+998 94 890 12 34', '@feruzas', '', daysAgo(12)],
    ['Doston Ergashev', '+998 95 901 23 45', '@doston_e', '', daysAgo(10)],
    ['Gulnora Rahimova', '+998 90 012 34 56', '@gulnora_r', '', daysAgo(8)],
  ]
  const customers = []
  for (const [name, phone, telegram, notes, createdAt] of customerData) {
    const code = `CUS-${String(await seq('customer')).padStart(3, '0')}`
    customers.push(
      await prisma.customer.create({ data: { code, name, phone, telegram, notes, createdAt } }),
    )
  }
  const C = Object.fromEntries(customers.map((c) => c.code.slice(4).padStart(3, '0') === c.code.slice(4) ? [c.code, c] : []))
  const byPhone = {}
  customers.forEach((c) => {
    byPhone[c.phone.replace(/\D/g, '').slice(-9)] = c
  })
  const pick = (n) => customers[Math.floor(Math.random() * customers.length)]
  const findC = (phone) => byPhone[String(phone).replace(/\D/g, '').slice(-9)]

  // ---------- Workers ----------
  const workerData = [
    ['Bekzod Rahimov', '+998 90 111 22 33', 'mechanic', daysAgo(200), 4.8],
    ['Dilshod Xasanov', '+998 90 222 33 44', 'electrician', daysAgo(180), 4.6],
    ['Jasur Abdullayev', '+998 90 333 44 55', 'bodywork', daysAgo(150), 4.7],
    ['Madina Karimova', '+998 90 444 55 66', 'diagnostics', daysAgo(120), 4.9],
    ['Ulugbek Nazarov', '+998 90 555 66 77', 'mechanic', daysAgo(90), 4.5],
  ]
  const workers = []
  for (const [name, phone, specialization, joinedAt, rating] of workerData) {
    const code = `WRK-${String(await seq('worker')).padStart(2, '0')}`
    workers.push(await prisma.worker.create({ data: { code, name, phone, specialization, joinedAt, rating } }))
  }
  const W = Object.fromEntries(workers.map((w) => [w.code, w]))
  const workerName = (code) => W[code]?.name || '—'
  const pickW = () => workers[Math.floor(Math.random() * workers.length)]

  // ---------- Orders ----------
  const orderInputs = [
    { d: 0, h: 9, m: 20, cus: 0, wrk: 0, type: 'sedan', make: 'Chevrolet', model: 'Malibu', year: 2021, plate: '01 A 123 BC', issue: 'Dvigatel titrayapti, check yonadi', st: 'repairing', pr: 'normal', price: 850000, pay: [[todayAt(9, 25), 300000]] },
    { d: 0, h: 8, m: 45, cus: 1, wrk: 1, type: 'suv', make: 'Kia', model: 'Sportage', year: 2022, plate: '01 B 456 CD', issue: 'Quvvat yo\'qolmoqda, turbo shubhali', st: 'repairing', pr: 'high', price: 1200000, pay: [[todayAt(12, 40), 500000]] },
    { d: 0, h: 9, m: 5, cus: 2, wrk: 4, type: 'sedan', make: 'Hyundai', model: 'Sonata', year: 2020, plate: '01 C 789 DE', issue: 'Tormoz vazilashyapti', st: 'ready', pr: 'normal', price: 600000, pay: [[todayAt(9, 5), 600000]] },
    { d: 0, h: 10, m: 5, cus: 3, wrk: 0, type: 'hatchback', make: 'Daewoo', model: 'Matiz', year: 2018, plate: '01 D 012 EF', issue: 'Akumulyator tez tugayapti', st: 'ready', pr: 'normal', price: 400000, pay: [[todayAt(11, 30), 200000]] },
    { d: 0, h: 9, m: 50, cus: 4, wrk: 1, type: 'sedan', make: 'Chevrolet', model: 'Cobalt', year: 2021, plate: '01 E 345 FG', issue: 'Dvigatel ishga tushmayapti', st: 'new', pr: 'normal', price: 250000, pay: [] },
    { d: 0, h: 8, m: 30, cus: 5, wrk: 0, type: 'suv', make: 'Toyota', model: 'Camry', year: 2020, plate: '01 F 678 GH', issue: 'Suv tushgan, dvigatel', st: 'diagnosing', pr: 'urgent', price: 700000, pay: [] },
    { d: 0, h: 11, m: 0, cus: 6, wrk: 3, type: 'minivan', make: 'Chevrolet', model: 'Orlando', year: 2019, plate: '01 G 901 HI', issue: 'Konditsioner ishlamayapti', st: 'repairing', pr: 'normal', price: 900000, pay: [[daysAgo(1, 9, 40), 450000]] },
    { d: 0, h: 10, m: 40, cus: 7, wrk: 4, type: 'hatchback', make: 'Kia', model: 'Rio', year: 2022, plate: '01 H 234 IJ', issue: 'Zaryad tizimi muammosi', st: 'repairing', pr: 'normal', price: 350000, pay: [] },
    { d: 0, h: 12, m: 10, cus: 8, wrk: 1, type: 'sedan', make: 'Chevrolet', model: 'Lacetti', year: 2017, plate: '01 I 567 JK', issue: 'Issiqlik ko\'tarilmoqda', st: 'repairing', pr: 'high', price: 380000, pay: [[todayAt(13, 15), 250000]] },
    { d: 0, h: 11, m: 30, cus: 9, wrk: 0, type: 'suv', make: 'Hyundai', model: 'Santa Fe', year: 2021, plate: '01 J 890 KL', issue: 'Kamera ishlamayapti', st: 'diagnosing', pr: 'normal', price: 500000, pay: [] },
    { d: 0, h: 13, m: 40, cus: 10, wrk: 2, type: 'pickup', make: 'Toyota', model: 'Land Cruiser', year: 2016, plate: '01 K 123 LM', issue: 'Kuza zanglab ketgan', st: 'cancelled', pr: 'low', price: 450000, pay: [], cancel: 'parts' },
    { d: 0, h: 9, m: 15, cus: 11, wrk: 3, type: 'sedan', make: 'Daewoo', model: 'Nexia', year: 2019, plate: '01 L 456 MN', issue: 'Datchik ishlamayapti', st: 'ready', pr: 'normal', price: 300000, pay: [[daysAgo(2, 11, 0), 300000]] },
    { d: 1, h: 10, m: 0, cus: 1, wrk: 4, type: 'sedan', make: 'Chevrolet', model: 'Malibu', year: 2020, plate: '01 M 789 NO', issue: 'Orqa ko\'zgular ishlamayapti', st: 'completed', pr: 'normal', price: 750000, pay: [[daysAgo(1, 14, 20), 500000], [daysAgo(2, 12, 0), 250000]] },
    { d: 1, h: 9, m: 0, cus: 4, wrk: 0, type: 'hatchback', make: 'Chevrolet', model: 'Spark', year: 2018, plate: '01 N 012 OP', issue: 'Yonilg\'i nasosi almashtirish', st: 'completed', pr: 'normal', price: 550000, pay: [[daysAgo(1, 11, 10), 550000]] },
    { d: 2, h: 9, m: 30, cus: 9, wrk: 0, type: 'sedan', make: 'Chevrolet', model: 'Gentra', year: 2021, plate: '01 O 345 PQ', issue: 'Zaryad generatori buzilgan', st: 'completed', pr: 'normal', price: 320000, pay: [[daysAgo(2, 16, 40), 320000]] },
    { d: 3, h: 10, m: 0, cus: 8, wrk: 0, type: 'suv', make: 'Hyundai', model: 'Tucson', year: 2019, plate: '01 P 678 QR', issue: 'Bo\'yoq ishi, old qanot', st: 'cancelled', pr: 'normal', price: 600000, pay: [], cancel: 'customer' },
    { d: 5, h: 10, m: 0, cus: 0, wrk: 0, type: 'sedan', make: 'Chevrolet', model: 'Malibu', year: 2022, plate: '01 Q 901 RS', issue: 'Yog\' almashish, filtrlar', st: 'completed', pr: 'normal', price: 500000, pay: [[daysAgo(5, 13, 30), 500000]] },
    { d: 6, h: 11, m: 0, cus: 5, wrk: 2, type: 'suv', make: 'Kia', model: 'Sorento', year: 2020, plate: '01 R 234 ST', issue: 'Old oyna almashtirish', st: 'completed', pr: 'high', price: 2400000, pay: [[daysAgo(6, 15, 0), 800000], [daysAgo(3, 17, 20), 400000]] },
    { d: 8, h: 10, m: 0, cus: 7, wrk: 0, type: 'sedan', make: 'Chevrolet', model: 'Lacetti', year: 2019, plate: '01 S 567 TU', issue: 'Amortizator almashtirish', st: 'completed', pr: 'normal', price: 300000, pay: [[daysAgo(8, 12, 0), 300000]] },
    { d: 10, h: 9, m: 0, cus: 6, wrk: 1, type: 'sedan', make: 'Hyundai', model: 'Elantra', year: 2021, plate: '01 T 890 UV', issue: 'Boshlang\'ich tormoz kolodkalari', st: 'completed', pr: 'normal', price: 450000, pay: [[daysAgo(10, 10, 30), 450000]] },
  ]

  const statusKeys = {
    new: 'orders.timeline.created',
    diagnosing: 'orders.timeline.diagnosis',
    repairing: 'orders.timeline.repair',
    ready: 'orders.timeline.ready',
    completed: 'orders.timeline.completed',
    cancelled: 'orders.timeline.cancelled',
  }
  const timelineOrder = ['new', 'diagnosing', 'repairing', 'ready', 'completed']
  const timelineOffsets = { new: 0, diagnosing: 45, repairing: 150, ready: 260, completed: 400 }

  for (const o of orderInputs) {
    const c = customers[o.cus]
    const w = workers[o.wrk]
    const created = daysAgo(o.d, o.h, o.m)
    const code = `ORD-${await seq('order', 1024)}`
    const payData = []
    for (const [at, amount] of o.pay || []) {
      payData.push({
        code: `PAY-${await seq('payment', 1050)}`,
        amount,
        method: payData.length % 2 === 0 ? 'cash' : 'card',
        date: at,
      })
    }
    const order = await prisma.order.create({
      data: {
        code,
        customerId: c.id,
        workerId: w.id,
        carType: o.type,
        make: o.make,
        model: o.model,
        year: o.year,
        plate: o.plate,
        issue: o.issue,
        status: o.st,
        priority: o.pr,
        price: o.price,
        paid: payData.reduce((s, p) => s + p.amount, 0),
        createdAt: created,
        expectedDate: o.st === 'ready' ? todayAt(18, 0) : o.st === 'completed' ? created : null,
        cancelledReason: o.cancel || '',
        timeline: {
          create: timelineOrder
            .slice(0, timelineOrder.indexOf(o.st) + 1)
            .map((k) => {
              const at = new Date(created)
              at.setMinutes(at.getMinutes() + timelineOffsets[k])
              return { key: statusKeys[k], at, vars: k === 'repairing' ? { worker: w.name } : undefined }
            }),
        },
        payments: { create: payData },
      },
      include: { payments: true },
    })
    if (o.st === 'ready') {
      await prisma.orderTimeline.create({
        data: { orderId: order.id, key: 'orders.timeline.ready', at: todayAt(18, 0) },
      })
    }
  }

  // ---------- Appointments ----------
  const appointmentInputs = [
    { cus: 8, wrk: 1, service: 'Diagnostika — Lacetti', date: daysAgo(1), time: '17:00', st: 'no_show' },
    { cus: 0, wrk: 0, service: 'Diagnostika — Malibu', date: todayAt(9, 30), time: '09:30', st: 'confirmed' },
    { cus: 1, wrk: 1, service: 'Quvvat muammosi — Sportage', date: todayAt(10, 30), time: '10:30', st: 'confirmed' },
    { cus: 2, wrk: 4, service: 'Tormoz — Sonata', date: todayAt(11, 30), time: '11:30', st: 'completed' },
    { cus: 3, wrk: 0, service: 'Akumulyator — Matiz', date: todayAt(12, 15), time: '12:15', st: 'waiting' },
    { cus: 4, wrk: 1, service: 'Dvigatel — Cobalt', date: todayAt(14, 0), time: '14:00', st: 'confirmed' },
    { cus: 5, wrk: 0, service: 'Suv tushgan — Camry', date: todayAt(15, 30), time: '15:30', st: 'confirmed' },
    { cus: 7, wrk: 4, service: 'Zaryad — Rio', date: tomorrowAt(10, 0), time: '10:00', st: 'confirmed' },
    { cus: 8, wrk: 2, service: 'Issiqlik — Santa Fe', date: tomorrowAt(11, 30), time: '11:30', st: 'confirmed' },
    { cus: 9, wrk: 3, service: 'Kamera — Gentra', date: tomorrowAt(13, 0), time: '13:00', st: 'confirmed' },
    { cus: 6, wrk: 3, service: 'Konditsioner — Orlando', date: tomorrowAt(14, 30), time: '14:30', st: 'confirmed' },
  ]
  for (const a of appointmentInputs) {
    await prisma.appointment.create({
      data: {
        code: `APT-${await seq('appointment', 1000)}`,
        customerId: customers[a.cus].id,
        workerId: workers[a.wrk].id,
        service: a.service,
        date: a.date,
        time: a.time,
        status: a.st,
      },
    })
  }

  // ---------- Inventory ----------
  const inventoryData = [
    ['Moy filtri', 'filter', 25, 10, 30000, 60000],
    ['Havo filtri', 'filter', 12, 8, 40000, 80000],
    ['Dvigatel moyi 5W-30 (4L)', 'oil', 10, 5, 150000, 280000],
    ['Transmissiya moyi (1L)', 'oil', 8, 4, 60000, 110000],
    ['Tormoz kolodkalari', 'brake', 6, 4, 120000, 220000],
    ['Amortizator', 'suspension', 4, 3, 350000, 550000],
    ['Akumulyator 60Ah', 'battery', 3, 4, 450000, 750000],
    ['Boshqalar uchun avtomobil lampalari', 'accessory', 20, 8, 15000, 35000],
    ['Tormoz suyuqligi (1L)', 'brake', 15, 6, 25000, 60000],
    ['Antifriz (5L)', 'cooling', 9, 4, 80000, 150000],
    ['Yonilg\'i filtri', 'filter', 14, 5, 50000, 95000],
    ['O\'rna oyna (kuzov)', 'body', 2, 1, 900000, 1400000],
    ['Shisha yuvish suyuqligi (5L)', 'accessory', 12, 5, 20000, 45000],
    ['Kompressor uchun moy', 'oil', 4, 2, 70000, 130000],
    ['Yog\' parchasi tozalash', 'component', 10, 4, 18000, 40000],
    ['Fikatorli siyoh (1L)', 'body', 3, 2, 250000, 420000],
  ]
  for (const [name, category, quantity, minimum, purchasePrice, sellingPrice] of inventoryData) {
    const code = `INV-${String(await seq('inventory')).padStart(2, '0')}`
    await prisma.inventoryItem.create({
      data: {
        code,
        name,
        category,
        quantity,
        minimum,
        purchasePrice,
        sellingPrice,
        history: { create: [{ type: 'stock', quantity, note: 'Boshlang\'ich zaxira', at: daysAgo(10) }] },
      },
    })
  }

  // ---------- Activity ----------
  await prisma.activity.createMany({
    data: [
      { type: 'order_created', key: 'notifications.orderCreated', vars: { id: 'ORD-1024', customer: 'Azizbek Karimov' }, at: todayAt(9, 20) },
      { type: 'order_ready', key: 'notifications.orderStatus', vars: { id: 'ORD-1022', status: 'tayyor' }, at: todayAt(10, 5) },
      { type: 'payment', key: 'notifications.payment', vars: { id: 'ORD-1021', amount: '200 000 so\'m' }, at: todayAt(11, 30) },
      { type: 'appointment', key: 'notifications.appointmentReminder', vars: { time: '12:15', customer: 'Nilufar Toshmatova' }, at: todayAt(12, 15) },
      { type: 'order_cancelled', key: 'notifications.orderStatus', vars: { id: 'ORD-1014', status: 'bekor qilingan' }, at: todayAt(13, 40) },
    ],
  })

  await prisma.notification.createMany({
    data: [
      { type: 'order_created', bodyKey: 'notifications.orderCreated', vars: { id: 'ORD-1024', customer: 'Azizbek Karimov' }, at: todayAt(9, 20), read: false },
      { type: 'order_status', bodyKey: 'notifications.orderStatus', vars: { id: 'ORD-1022', status: 'tayyor' }, at: todayAt(10, 5), read: false },
      { type: 'payment', bodyKey: 'notifications.payment', vars: { id: 'ORD-1021', amount: '200 000 so\'m' }, at: todayAt(11, 30), read: false },
      { type: 'appointment', bodyKey: 'notifications.appointmentReminder', vars: { time: '12:15', customer: 'Nilufar Toshmatova' }, at: todayAt(12, 15), read: true },
      { type: 'order_cancelled', bodyKey: 'notifications.orderStatus', vars: { id: 'ORD-1014', status: 'bekor qilingan' }, at: todayAt(13, 40), read: true },
    ],
  })

  console.log('Seed completed!')
  console.log('Demo users:')
  console.log('  OWNER    owner@autocore.app / demo123')
  console.log('  WORKER   bekzod@autocore.app / demo123')
  console.log('  CUSTOMER azizbek@autocore.app / demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
