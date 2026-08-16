import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import { useDebounce } from '../hooks/useDebounce.js'
import { PAYMENT_METHOD_LABEL_KEY } from '../constants/paymentStatus.js'
import { ACTIVE_STATUSES } from '../constants/orderStatus.js'
import { getRemaining } from '../constants/paymentStatus.js'
import { isToday } from '../utils/formatDate.js'
import { formatCurrency, formatCompact } from '../utils/formatCurrency.js'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Table from '../components/common/Table.jsx'
import { formatDateTime } from '../utils/formatDate.js'

export default function Payments() {
  const { t } = useI18n()
  const { payments, orders } = useApp()
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)

  const summary = useMemo(() => {
    const todayRevenue = payments.filter((p) => isToday(p.date)).reduce((s, p) => s + p.amount, 0)
    const collected = payments.reduce((s, p) => s + p.amount, 0)
    const unpaid = orders
      .filter((o) => ACTIVE_STATUSES.includes(o.status))
      .reduce((s, o) => s + getRemaining(o.price, o.paid), 0)
    const pending = orders.filter((o) => ACTIVE_STATUSES.includes(o.status) && getRemaining(o.price, o.paid) > 0).length
    return { todayRevenue, collected, unpaid, pending }
  }, [payments, orders])

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    return [...payments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter((p) => !q || p.orderRef.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q))
  }, [payments, debounced])

  const columns = [
    { key: 'id', header: t('payments.col.id'), render: (p) => <span className="font-semibold text-foreground">{p.id}</span> },
    { key: 'order', header: t('payments.col.order'), render: (p) => <Link to={`/orders/${p.orderId}`} className="font-medium text-primary-strong hover:underline">{p.orderRef}</Link> },
    { key: 'customer', header: t('payments.col.customer'), render: (p) => <span className="text-foreground">{p.customerName}</span> },
    { key: 'amount', header: t('payments.col.amount'), align: 'right', render: (p) => <span className="font-medium tabular-nums text-foreground">{formatCurrency(p.amount)}</span> },
    { key: 'method', header: t('payments.col.method'), render: (p) => <Badge tone="muted">{t(PAYMENT_METHOD_LABEL_KEY[p.method])}</Badge> },
    { key: 'date', header: t('payments.col.date'), render: (p) => <span className="text-muted-foreground">{formatDateTime(p.date)}</span> },
  ]

  const mobileRender = (p) => (
    <Card key={p.id} className="p-4">
      <div className="flex items-center justify-between gap-2">
        <Link to={`/orders/${p.orderId}`} className="font-semibold text-foreground">{p.orderRef}</Link>
        <span className="font-medium tabular-nums text-success">{formatCurrency(p.amount)}</span>
      </div>
      <div className="mt-1">
        <p className="text-sm text-foreground">{p.customerName}</p>
        <p className="text-xs text-muted">
          {t(PAYMENT_METHOD_LABEL_KEY[p.method])} · {formatDateTime(p.date)}
        </p>
      </div>
    </Card>
  )

  return (
    <div>
      <PageHeader title={t('payments.title')} subtitle={t('payments.subtitle')} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('payments.card.todayRevenue')} value={formatCompact(summary.todayRevenue)} icon={Wallet} iconTone="success" />
        <StatCard label={t('payments.card.collected')} value={formatCompact(summary.collected)} icon={Wallet} iconTone="primary" />
        <StatCard label={t('payments.card.unpaid')} value={formatCompact(summary.unpaid)} icon={Wallet} iconTone="warning" />
        <StatCard label={t('payments.card.pending')} value={String(summary.pending)} icon={Wallet} iconTone="info" />
      </div>

      <div className="mb-4 mt-4">
        <SearchInput value={search} onChange={setSearch} placeholder={t('payments.search')} className="max-w-xs" />
      </div>

      <Table
        columns={columns}
        rows={filtered}
        mobileRender={mobileRender}
        empty={{ icon: Wallet, title: t('payments.empty'), description: t('payments.empty') }}
      />
    </div>
  )
}
