import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Wrench } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders.js'
import { useI18n } from '../../i18n/index.jsx'
import { useDebounce } from '../../hooks/useDebounce.js'
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_KEY,
  ORDER_STATUS_TONE,
} from '../../constants/orderStatus.js'
import {
  getPaymentStatus,
  PAYMENT_STATUS_LABEL_KEY,
  PAYMENT_STATUS_TONE,
} from '../../constants/paymentStatus.js'
import { formatDate } from '../../utils/formatDate.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/common/SearchInput.jsx'
import Select from '../../components/common/Select.jsx'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import Table from '../../components/common/Table.jsx'
import Card from '../../components/common/Card.jsx'

export default function OrdersList() {
  const { t } = useI18n()
  const { orders } = useOrders()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const debounced = useDebounce(search)

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    return orders
      .filter((o) => {
        if (status !== 'all' && o.status !== status) return false
        if (!q) return true
        const hay = `${o.id} ${o.customerName} ${o.phone} ${o.brand} ${o.model} ${o.issue}`
        return hay.toLowerCase().includes(q)
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [orders, debounced, status])

  const columns = [
    { key: 'id', header: t('orders.col.id'), render: (o) => <span className="font-semibold text-foreground">{o.id}</span> },
    {
      key: 'customer',
      header: t('orders.col.customer'),
      render: (o) => (
        <div>
          <p className="font-medium text-foreground">{o.customerName}</p>
          <p className="font-mono text-xs text-muted">{o.phone}</p>
        </div>
      ),
    },
    {
      key: 'device',
      header: t('orders.col.device'),
      render: (o) => (
        <div>
          <p className="text-foreground">{o.brand} {o.model}</p>
          <p className="text-xs text-muted">{o.issue}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('orders.col.status'),
      render: (o) => <Badge tone={ORDER_STATUS_TONE[o.status]} dot>{t(ORDER_STATUS_LABEL_KEY[o.status])}</Badge>,
    },
    {
      key: 'payment',
      header: t('orders.col.payment'),
      render: (o) => (
        <Badge tone={PAYMENT_STATUS_TONE[getPaymentStatus(o.price, o.paid)]}>
          {t(PAYMENT_STATUS_LABEL_KEY[getPaymentStatus(o.price, o.paid)])}
        </Badge>
      ),
    },
    { key: 'price', header: t('orders.col.price'), align: 'right', render: (o) => <span className="font-medium tabular-nums text-foreground">{formatCurrency(o.price)}</span> },
    { key: 'date', header: t('orders.col.date'), render: (o) => <span className="text-muted-foreground">{formatDate(o.createdAt)}</span> },
  ]

  const mobileRender = (o) => (
    <Card key={o.id} as="button" type="button" className="p-4 text-left" onClick={() => navigate(`/orders/${o.id}`)}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-foreground">{o.id}</span>
        <Badge tone={ORDER_STATUS_TONE[o.status]} dot>{t(ORDER_STATUS_LABEL_KEY[o.status])}</Badge>
      </div>
      <div className="mt-1.5">
        <p className="text-sm font-medium text-foreground">{o.customerName}</p>
        <p className="truncate text-xs text-muted-foreground">{o.brand} {o.model} · {o.issue}</p>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-sm">
        <span className="font-medium tabular-nums text-foreground">{formatCurrency(o.price)}</span>
        <Badge tone={PAYMENT_STATUS_TONE[getPaymentStatus(o.price, o.paid)]}>
          {t(PAYMENT_STATUS_LABEL_KEY[getPaymentStatus(o.price, o.paid)])}
        </Badge>
      </div>
    </Card>
  )

  return (
    <div>
      <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')}>
        <Link to="/orders/new">
          <Button icon={Plus}>{t('orders.create.title')}</Button>
        </Link>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder={t('orders.search')} className="sm:max-w-xs" />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="sm:w-48"
          aria-label={t('orders.filterStatus')}
        >
          <option value="all">{t('orders.filterStatus')}: {t('common.all')}</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{t(ORDER_STATUS_LABEL_KEY[s])}</option>
          ))}
        </Select>
      </div>

      <Table
        columns={columns}
        rows={filtered}
        onRowClick={(o) => navigate(`/orders/${o.id}`)}
        mobileRender={mobileRender}
        empty={{
          icon: Wrench,
          title: t('orders.empty'),
          description: t('orders.emptyCta'),
          action: (
            <Link to="/orders/new">
              <Button size="sm" icon={Plus}>{t('orders.create.title')}</Button>
            </Link>
          ),
        }}
      />
    </div>
  )
}
