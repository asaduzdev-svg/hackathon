import { daysAgo, todayAt } from '../utils/formatDate.js'
import { uid } from '../utils/id.js'

const NOW = new Date().toISOString()

const customers = [
  { id: 'CUS-001', name: 'Azizbek Karimov', phone: '+998 90 123 45 67', telegram: '@azizkarimov', createdAt: daysAgo(40), notes: 'Doimiy mijoz' },
  { id: 'CUS-002', name: 'Madina Karimova', phone: '+998 93 456 78 90', telegram: '@madina_k', createdAt: daysAgo(35), notes: '' },
  { id: 'CUS-003', name: 'Jasur Abdullayev', phone: '+998 94 567 89 01', telegram: '@jasurabd', createdAt: daysAgo(30), notes: '' },
  { id: 'CUS-004', name: 'Nilufar Toshmatova', phone: '+998 91 234 56 78', telegram: '@nilufart', createdAt: daysAgo(28), notes: '' },
  { id: 'CUS-005', name: 'Sherzod Ismoilov', phone: '+998 95 678 90 12', telegram: '@sherzod_i', createdAt: daysAgo(25), notes: '' },
  { id: 'CUS-006', name: 'Malika Yusupova', phone: '+998 90 345 67 89', telegram: '@malikay', createdAt: daysAgo(22), notes: '' },
  { id: 'CUS-007', name: 'Ulugbek Nazarov', phone: '+998 97 456 78 90', telegram: '@ulugnazarov', createdAt: daysAgo(20), notes: '' },
  { id: 'CUS-008', name: 'Zilola Hamidova', phone: '+998 93 678 90 12', telegram: '@zilolah', createdAt: daysAgo(18), notes: '' },
  { id: 'CUS-009', name: 'Sanjar Qodirov', phone: '+998 91 789 01 23', telegram: '@sanjarq', createdAt: daysAgo(15), notes: '' },
  { id: 'CUS-010', name: 'Feruza Saidova', phone: '+998 94 890 12 34', telegram: '@feruzas', createdAt: daysAgo(12), notes: '' },
  { id: 'CUS-011', name: 'Doston Ergashev', phone: '+998 95 901 23 45', telegram: '@doston_e', createdAt: daysAgo(10), notes: '' },
  { id: 'CUS-012', name: 'Gulnora Rahimova', phone: '+998 90 012 34 56', telegram: '@gulnora_r', createdAt: daysAgo(8), notes: '' },
]

const workers = [
  { id: 'WRK-01', name: 'Bekzod Rahimov', phone: '+998 90 111 22 33', specialization: 'phoneRepair', joinedAt: daysAgo(200), rating: 4.8 },
  { id: 'WRK-02', name: 'Dilshod Xasanov', phone: '+998 90 222 33 44', specialization: 'computerRepair', joinedAt: daysAgo(180), rating: 4.6 },
  { id: 'WRK-03', name: 'Jasur Abdullayev', phone: '+998 90 333 44 55', specialization: 'laptopRepair', joinedAt: daysAgo(150), rating: 4.7 },
  { id: 'WRK-04', name: 'Madina Karimova', phone: '+998 90 444 55 66', specialization: 'tabletRepair', joinedAt: daysAgo(120), rating: 4.9 },
  { id: 'WRK-05', name: 'Ulugbek Nazarov', phone: '+998 90 555 66 77', specialization: 'phoneRepair', joinedAt: daysAgo(90), rating: 4.5 },
]

const workerName = (id) => workers.find((w) => w.id === id)?.name || '—'

function buildTimeline(order) {
  const entries = [{ id: uid(), key: 'orders.timeline.created', at: order.createdAt }]
  const active = ['diagnosing', 'repairing', 'ready', 'completed'].includes(order.status)
  if (active) {
    entries.push({ id: uid(), key: 'orders.timeline.assigned', at: addMin(order.createdAt, 30), vars: { worker: order.workerName } })
    entries.push({ id: uid(), key: 'orders.timeline.diagnosis', at: addMin(order.createdAt, 75) })
  }
  if (['repairing', 'ready', 'completed'].includes(order.status)) {
    entries.push({ id: uid(), key: 'orders.timeline.repair', at: addMin(order.createdAt, 150) })
  }
  if (['ready', 'completed'].includes(order.status)) {
    entries.push({ id: uid(), key: 'orders.timeline.ready', at: addMin(order.createdAt, 260) })
  }
  if (order.status === 'completed') {
    entries.push({ id: uid(), key: 'orders.timeline.completed', at: addMin(order.createdAt, 400) })
  }
  if (order.status === 'cancelled') {
    entries.push({ id: uid(), key: 'orders.timeline.cancelled', at: addMin(order.createdAt, 180) })
  }
  return entries
}

function addMin(iso, minutes) {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() + minutes)
  return d.toISOString()
}

function makeOrder(data) {
  const order = {
    id: data.id,
    customerId: data.customerId,
    customerName: data.customerName,
    phone: data.phone,
    deviceType: data.deviceType,
    brand: data.brand,
    model: data.model,
    imei: data.imei || '',
    issue: data.issue,
    condition: data.condition || 'Yaxshi',
    workerId: data.workerId,
    workerName: workerName(data.workerId),
    status: data.status,
    priority: data.priority || 'normal',
    price: data.price,
    paid: data.payments.reduce((sum, p) => sum + p.amount, 0),
    payments: data.payments,
    createdAt: data.createdAt,
    expectedDate: data.expectedDate,
    notes: data.notes || '',
    cancelledReason: data.cancelledReason || '',
  }
  order.timeline = buildTimeline(order)
  return order
}

const ordersSeed = [
  // ——— Today (12 orders) ———
  makeOrder({ id: 'ORD-1024', customerId: 'CUS-001', customerName: 'Azizbek Karimov', phone: '+998 90 123 45 67', deviceType: 'phone', brand: 'Apple', model: 'iPhone 13', imei: '356789102345678', issue: 'Ekran ishlamayapti', workerId: 'WRK-01', status: 'repairing', priority: 'normal', price: 850000, createdAt: todayAt(9, 20), expectedDate: daysAgo(-2), payments: [{ method: 'cash', amount: 300000, at: todayAt(9, 25) }] }),
  makeOrder({ id: 'ORD-1023', customerId: 'CUS-002', customerName: 'Madina Karimova', phone: '+998 93 456 78 90', deviceType: 'macbook', brand: 'Apple', model: 'MacBook Air 13', issue: 'Quvvat ulanmayapti', workerId: 'WRK-03', status: 'repairing', priority: 'high', price: 1200000, createdAt: todayAt(8, 45), expectedDate: daysAgo(-1), payments: [{ method: 'cash', amount: 500000, at: todayAt(12, 40) }] }),
  makeOrder({ id: 'ORD-1022', customerId: 'CUS-003', customerName: 'Jasur Abdullayev', phone: '+998 94 567 89 01', deviceType: 'phone', brand: 'Samsung', model: 'Galaxy S23', issue: 'Sensor ishlamayapti', workerId: 'WRK-05', status: 'ready', priority: 'normal', price: 600000, createdAt: todayAt(9, 5), expectedDate: todayAt(18, 0), payments: [{ method: 'cash', amount: 600000, at: todayAt(9, 5) }] }),
  makeOrder({ id: 'ORD-1021', customerId: 'CUS-004', customerName: 'Nilufar Toshmatova', phone: '+998 91 234 56 78', deviceType: 'phone', brand: 'Apple', model: 'iPhone 14', issue: 'Akumulyator tez tugayapti', workerId: 'WRK-01', status: 'ready', priority: 'normal', price: 400000, createdAt: todayAt(10, 5), expectedDate: todayAt(18, 0), payments: [{ method: 'transfer', amount: 200000, at: todayAt(11, 30) }] }),
  makeOrder({ id: 'ORD-1020', customerId: 'CUS-005', customerName: 'Sherzod Ismoilov', phone: '+998 95 678 90 12', deviceType: 'laptop', brand: 'HP', model: 'Pavilion 15', issue: 'Windows ishga tushmayapti', workerId: 'WRK-02', status: 'new', priority: 'normal', price: 250000, createdAt: todayAt(9, 50), expectedDate: daysAgo(-1), payments: [] }),
  makeOrder({ id: 'ORD-1019', customerId: 'CUS-006', customerName: 'Malika Yusupova', phone: '+998 90 345 67 89', deviceType: 'phone', brand: 'Apple', model: 'iPhone 12', issue: 'Suv tushgan', workerId: 'WRK-01', status: 'diagnosing', priority: 'urgent', price: 700000, createdAt: todayAt(8, 30), expectedDate: daysAgo(-2), payments: [] }),
  makeOrder({ id: 'ORD-1018', customerId: 'CUS-007', customerName: 'Ulugbek Nazarov', phone: '+998 97 456 78 90', deviceType: 'tablet', brand: 'Apple', model: 'iPad 9', issue: 'Ekran singan', workerId: 'WRK-04', status: 'repairing', priority: 'normal', price: 900000, createdAt: todayAt(11, 0), expectedDate: daysAgo(-1), payments: [{ method: 'card', amount: 450000, at: daysAgo(1, 9, 40) }] }),
  makeOrder({ id: 'ORD-1017', customerId: 'CUS-008', customerName: 'Zilola Hamidova', phone: '+998 93 678 90 12', deviceType: 'phone', brand: 'Xiaomi', model: 'Redmi Note 12', issue: 'Zaryad olmayapti', workerId: 'WRK-05', status: 'repairing', priority: 'normal', price: 350000, createdAt: todayAt(10, 40), expectedDate: todayAt(19, 0), payments: [] }),
  makeOrder({ id: 'ORD-1016', customerId: 'CUS-009', customerName: 'Sanjar Qodirov', phone: '+998 91 789 01 23', deviceType: 'laptop', brand: 'Dell', model: 'XPS 13', issue: 'Issiqlik ketayapti', workerId: 'WRK-02', status: 'repairing', priority: 'high', price: 380000, createdAt: todayAt(12, 10), expectedDate: daysAgo(-1), payments: [{ method: 'card', amount: 250000, at: todayAt(13, 15) }] }),
  makeOrder({ id: 'ORD-1015', customerId: 'CUS-010', customerName: 'Feruza Saidova', phone: '+998 94 890 12 34', deviceType: 'phone', brand: 'Apple', model: 'iPhone 13', issue: 'Kamera ishlamayapti', workerId: 'WRK-01', status: 'diagnosing', priority: 'normal', price: 500000, createdAt: todayAt(11, 30), expectedDate: daysAgo(-1), payments: [] }),
  makeOrder({ id: 'ORD-1014', customerId: 'CUS-011', customerName: 'Doston Ergashev', phone: '+998 95 901 23 45', deviceType: 'laptop', brand: 'Lenovo', model: 'ThinkPad T14', issue: 'Klaviatura ishlamayapti', workerId: 'WRK-03', status: 'cancelled', priority: 'low', price: 450000, createdAt: todayAt(13, 40), expectedDate: null, payments: [], cancelledReason: 'parts' }),
  makeOrder({ id: 'ORD-1013', customerId: 'CUS-012', customerName: 'Gulnora Rahimova', phone: '+998 90 012 34 56', deviceType: 'phone', brand: 'Samsung', model: 'Galaxy A54', issue: "Sim kartani o'qimayapti", workerId: 'WRK-04', status: 'ready', priority: 'normal', price: 300000, createdAt: todayAt(9, 15), expectedDate: todayAt(18, 0), payments: [{ method: 'cash', amount: 300000, at: daysAgo(2, 11, 0) }] }),
  // ——— Previous days (8 orders) ———
  makeOrder({ id: 'ORD-1012', customerId: 'CUS-002', customerName: 'Madina Karimova', phone: '+998 93 456 78 90', deviceType: 'phone', brand: 'Apple', model: 'iPhone 14 Pro', issue: 'Back glass singan', workerId: 'WRK-05', status: 'completed', priority: 'normal', price: 750000, createdAt: daysAgo(1, 10, 0), expectedDate: daysAgo(1), payments: [{ method: 'cash', amount: 500000, at: daysAgo(1, 14, 20) }, { method: 'card', amount: 250000, at: daysAgo(2, 12, 0) }] }),
  makeOrder({ id: 'ORD-1011', customerId: 'CUS-005', customerName: 'Sherzod Ismoilov', phone: '+998 95 678 90 12', deviceType: 'laptop', brand: 'HP', model: 'Pavilion 15', issue: 'SSD almashtirish', workerId: 'WRK-02', status: 'completed', priority: 'normal', price: 550000, createdAt: daysAgo(1, 9, 0), expectedDate: daysAgo(1), payments: [{ method: 'transfer', amount: 550000, at: daysAgo(1, 11, 10) }] }),
  makeOrder({ id: 'ORD-1010', customerId: 'CUS-010', customerName: 'Feruza Saidova', phone: '+998 94 890 12 34', deviceType: 'phone', brand: 'Apple', model: 'iPhone 13', issue: 'Zaryad porti buzilgan', workerId: 'WRK-01', status: 'completed', priority: 'normal', price: 320000, createdAt: daysAgo(2, 9, 30), expectedDate: daysAgo(2), payments: [{ method: 'cash', amount: 320000, at: daysAgo(2, 16, 40) }] }),
  makeOrder({ id: 'ORD-1009', customerId: 'CUS-009', customerName: 'Sanjar Qodirov', phone: '+998 91 789 01 23', deviceType: 'laptop', brand: 'Huawei', model: 'MateBook 14', issue: 'Ekran chizilgan', workerId: 'WRK-02', status: 'cancelled', priority: 'normal', price: 600000, createdAt: daysAgo(3, 10, 0), expectedDate: null, payments: [], cancelledReason: 'customer' }),
  makeOrder({ id: 'ORD-1008', customerId: 'CUS-001', customerName: 'Azizbek Karimov', phone: '+998 90 123 45 67', deviceType: 'laptop', brand: 'Asus', model: 'VivoBook 15', issue: 'Qattiq disk almashtirish', workerId: 'WRK-02', status: 'completed', priority: 'normal', price: 500000, createdAt: daysAgo(5, 10, 0), expectedDate: daysAgo(5), payments: [{ method: 'card', amount: 500000, at: daysAgo(5, 13, 30) }] }),
  makeOrder({ id: 'ORD-1007', customerId: 'CUS-006', customerName: 'Malika Yusupova', phone: '+998 90 345 67 89', deviceType: 'macbook', brand: 'Apple', model: 'MacBook Pro 14', issue: 'Ekran almashtirish', workerId: 'WRK-03', status: 'completed', priority: 'high', price: 2400000, createdAt: daysAgo(6, 11, 0), expectedDate: daysAgo(6), payments: [{ method: 'card', amount: 800000, at: daysAgo(6, 15, 0) }, { method: 'cash', amount: 400000, at: daysAgo(3, 17, 20) }] }),
  makeOrder({ id: 'ORD-1006', customerId: 'CUS-008', customerName: 'Zilola Hamidova', phone: '+998 93 678 90 12', deviceType: 'phone', brand: 'Apple', model: 'iPhone 11', issue: 'Zaryad porti', workerId: 'WRK-01', status: 'completed', priority: 'normal', price: 300000, createdAt: daysAgo(8, 10, 0), expectedDate: daysAgo(8), payments: [{ method: 'cash', amount: 300000, at: daysAgo(8, 12, 0) }] }),
  makeOrder({ id: 'ORD-1005', customerId: 'CUS-007', customerName: 'Ulugbek Nazarov', phone: '+998 97 456 78 90', deviceType: 'phone', brand: 'Samsung', model: 'Galaxy S22', issue: 'Batareya almashtirish', workerId: 'WRK-01', status: 'completed', priority: 'normal', price: 450000, createdAt: daysAgo(10, 9, 0), expectedDate: daysAgo(10), payments: [{ method: 'transfer', amount: 450000, at: daysAgo(10, 10, 30) }] }),
]

const appointments = [
  { id: 'APT-1000', customerId: 'CUS-009', customerName: 'Sanjar Qodirov', phone: '+998 91 789 01 23', service: 'Diagnostika — MateBook', workerId: 'WRK-02', date: daysAgo(1), time: '17:00', status: 'no_show', notes: '' },
  { id: 'APT-1001', customerId: 'CUS-001', customerName: 'Azizbek Karimov', phone: '+998 90 123 45 67', service: 'Diagnostika — iPhone 13', workerId: 'WRK-01', date: NOW, time: '09:30', status: 'confirmed', notes: '' },
  { id: 'APT-1002', customerId: 'CUS-002', customerName: 'Madina Karimova', phone: '+998 93 456 78 90', service: 'Quvvat muammosi — MacBook Air', workerId: 'WRK-03', date: NOW, time: '10:30', status: 'confirmed', notes: '' },
  { id: 'APT-1003', customerId: 'CUS-003', customerName: 'Jasur Abdullayev', phone: '+998 94 567 89 01', service: 'Sensor — Galaxy S23', workerId: 'WRK-05', date: NOW, time: '11:30', status: 'completed', notes: '' },
  { id: 'APT-1004', customerId: 'CUS-004', customerName: 'Nilufar Toshmatova', phone: '+998 91 234 56 78', service: 'Akumulyator — iPhone 14', workerId: 'WRK-01', date: NOW, time: '12:15', status: 'waiting', notes: '' },
  { id: 'APT-1005', customerId: 'CUS-005', customerName: 'Sherzod Ismoilov', phone: '+998 95 678 90 12', service: 'Windows — HP Pavilion', workerId: 'WRK-02', date: NOW, time: '14:00', status: 'confirmed', notes: '' },
  { id: 'APT-1006', customerId: 'CUS-006', customerName: 'Malika Yusupova', phone: '+998 90 345 67 89', service: 'Suv tushgan — iPhone 12', workerId: 'WRK-01', date: NOW, time: '15:30', status: 'confirmed', notes: '' },
  { id: 'APT-1007', customerId: 'CUS-008', customerName: 'Zilola Hamidova', phone: '+998 93 678 90 12', service: 'Zaryad — Redmi Note 12', workerId: 'WRK-05', date: daysAgo(-1), time: '10:00', status: 'confirmed', notes: '' },
  { id: 'APT-1008', customerId: 'CUS-009', customerName: 'Sanjar Qodirov', phone: '+998 91 789 01 23', service: 'Issiqlik — Dell XPS', workerId: 'WRK-02', date: daysAgo(-1), time: '11:30', status: 'confirmed', notes: '' },
  { id: 'APT-1009', customerId: 'CUS-010', customerName: 'Feruza Saidova', phone: '+998 94 890 12 34', service: 'Kamera — iPhone 13', workerId: 'WRK-04', date: daysAgo(-1), time: '13:00', status: 'confirmed', notes: '' },
  { id: 'APT-1010', customerId: 'CUS-007', customerName: 'Ulugbek Nazarov', phone: '+998 97 456 78 90', service: 'Ekran — iPad 9', workerId: 'WRK-04', date: daysAgo(-1), time: '14:30', status: 'confirmed', notes: '' },
  { id: 'APT-1011', customerId: 'CUS-011', customerName: 'Doston Ergashev', phone: '+998 95 901 23 45', service: 'Klaviatura — ThinkPad', workerId: 'WRK-03', date: daysAgo(-5), time: '10:30', status: 'confirmed', notes: '' },
  { id: 'APT-1012', customerId: 'CUS-012', customerName: 'Gulnora Rahimova', phone: '+998 90 012 34 56', service: 'Sim karta — Galaxy A54', workerId: 'WRK-04', date: daysAgo(-3), time: '16:00', status: 'confirmed', notes: '' },
]

const inventory = [
  { id: 'INV-01', name: 'iPhone 13 Display', category: 'screen', quantity: 3, minimum: 5, purchasePrice: 250000, sellingPrice: 420000, history: [{ id: uid(), type: 'stock', quantity: 10, note: 'Boshlang\'ich zaxira', at: daysAgo(20) }] },
  { id: 'INV-02', name: 'iPhone 14 Display', category: 'screen', quantity: 8, minimum: 5, purchasePrice: 350000, sellingPrice: 550000, history: [{ id: uid(), type: 'stock', quantity: 8, note: 'Boshlang\'ich zaxira', at: daysAgo(18) }] },
  { id: 'INV-03', name: 'iPhone 13 Battery', category: 'battery', quantity: 12, minimum: 5, purchasePrice: 80000, sellingPrice: 150000, history: [{ id: uid(), type: 'stock', quantity: 12, note: 'Boshlang\'ich zaxira', at: daysAgo(16) }] },
  { id: 'INV-04', name: 'Samsung S23 Display', category: 'screen', quantity: 2, minimum: 3, purchasePrice: 300000, sellingPrice: 480000, history: [{ id: uid(), type: 'stock', quantity: 5, note: 'Boshlang\'ich zaxira', at: daysAgo(14) }] },
  { id: 'INV-05', name: 'Type-C Charging Port', category: 'port', quantity: 15, minimum: 6, purchasePrice: 25000, sellingPrice: 60000, history: [{ id: uid(), type: 'stock', quantity: 15, note: 'Boshlang\'ich zaxira', at: daysAgo(12) }] },
  { id: 'INV-06', name: 'Lightning Charging Port', category: 'port', quantity: 10, minimum: 6, purchasePrice: 30000, sellingPrice: 70000, history: [{ id: uid(), type: 'stock', quantity: 10, note: 'Boshlang\'ich zaxira', at: daysAgo(12) }] },
  { id: 'INV-07', name: 'MacBook Air Battery', category: 'battery', quantity: 1, minimum: 2, purchasePrice: 600000, sellingPrice: 950000, history: [{ id: uid(), type: 'stock', quantity: 3, note: 'Boshlang\'ich zaxira', at: daysAgo(11) }] },
  { id: 'INV-08', name: 'Laptop Keyboard RU', category: 'component', quantity: 6, minimum: 3, purchasePrice: 90000, sellingPrice: 160000, history: [{ id: uid(), type: 'stock', quantity: 6, note: 'Boshlang\'ich zaxira', at: daysAgo(10) }] },
  { id: 'INV-09', name: 'SSD 256GB', category: 'component', quantity: 4, minimum: 2, purchasePrice: 220000, sellingPrice: 350000, history: [{ id: uid(), type: 'stock', quantity: 4, note: 'Boshlang\'ich zaxira', at: daysAgo(9) }] },
  { id: 'INV-10', name: 'RAM 8GB DDR4', category: 'component', quantity: 7, minimum: 3, purchasePrice: 180000, sellingPrice: 290000, history: [{ id: uid(), type: 'stock', quantity: 7, note: 'Boshlang\'ich zaxira', at: daysAgo(8) }] },
  { id: 'INV-11', name: 'Thermal Paste', category: 'accessory', quantity: 20, minimum: 5, purchasePrice: 15000, sellingPrice: 35000, history: [{ id: uid(), type: 'stock', quantity: 20, note: 'Boshlang\'ich zaxira', at: daysAgo(7) }] },
  { id: 'INV-12', name: 'Glass Screen Protector', category: 'accessory', quantity: 0, minimum: 10, purchasePrice: 5000, sellingPrice: 15000, history: [{ id: uid(), type: 'stock', quantity: 10, note: 'Boshlang\'ich zaxira', at: daysAgo(6) }] },
  { id: 'INV-13', name: 'Motherboard IC BGA', category: 'component', quantity: 9, minimum: 4, purchasePrice: 120000, sellingPrice: 220000, history: [{ id: uid(), type: 'stock', quantity: 9, note: 'Boshlang\'ich zaxira', at: daysAgo(5) }] },
  { id: 'INV-14', name: 'iPad 9 Screen', category: 'screen', quantity: 5, minimum: 3, purchasePrice: 280000, sellingPrice: 450000, history: [{ id: uid(), type: 'stock', quantity: 5, note: 'Boshlang\'ich zaxira', at: daysAgo(4) }] },
  { id: 'INV-15', name: 'Charging Cable Type-C', category: 'accessory', quantity: 18, minimum: 8, purchasePrice: 10000, sellingPrice: 30000, history: [{ id: uid(), type: 'stock', quantity: 18, note: 'Boshlang\'ich zaxira', at: daysAgo(3) }] },
  { id: 'INV-16', name: 'Samsung S23 Battery', category: 'battery', quantity: 3, minimum: 4, purchasePrice: 100000, sellingPrice: 180000, history: [{ id: uid(), type: 'stock', quantity: 6, note: 'Boshlang\'ich zaxira', at: daysAgo(2) }] },
]

let paymentSeq = 1000
function buildPayments() {
  const payments = []
  for (const order of ordersSeed) {
    for (const p of order.payments) {
      paymentSeq += 1
      payments.push({
        id: `PAY-${paymentSeq}`,
        orderId: order.id,
        orderRef: order.id,
        customerName: order.customerName,
        amount: p.amount,
        method: p.method,
        date: p.at,
        status: 'completed',
      })
    }
  }
  return payments
}

const activity = [
  { id: uid(), type: 'order_created', key: 'notifications.orderCreated', vars: { id: 'ORD-1024', customer: 'Azizbek Karimov' }, at: todayAt(9, 20) },
  { id: uid(), type: 'order_ready', key: 'notifications.orderStatus', vars: { id: 'ORD-1021', status: 'tayyor' }, at: todayAt(10, 5) },
  { id: uid(), type: 'payment', key: 'notifications.payment', vars: { id: 'ORD-1021', amount: '200,000 so\'m' }, at: todayAt(11, 30) },
  { id: uid(), type: 'appointment', key: 'notifications.appointmentReminder', vars: { time: '12:15', customer: 'Nilufar Toshmatova' }, at: todayAt(12, 15) },
  { id: uid(), type: 'order_cancelled', key: 'notifications.orderStatus', vars: { id: 'ORD-1014', status: 'bekor qilingan' }, at: todayAt(13, 40) },
]

export function buildSeed() {
  const payments = buildPayments()
  return {
    version: 1,
    orders: ordersSeed,
    customers,
    workers,
    appointments,
    payments,
    inventory,
    activity,
    notifications: [],
    settings: {
      business: {
        name: 'ServiceCore',
        phone: '+998 90 000 00 00',
        address: "Toshkent sh., Chilonzor tumani, 12-kvartal",
        hours: '09:00 — 20:00',
      },
      profile: {
        name: 'Sardor Karimov',
        phone: '+998 90 123 45 67',
        email: 'owner@servicecore.app',
      },
      notifications: {
        customer: true,
        appointments: true,
        telegram: false,
      },
    },
  }
}
