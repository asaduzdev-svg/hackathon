import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, ChevronRight, Phone, Wrench } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useI18n } from '../../i18n/index.jsx'
import { usePageLoading } from '../../hooks/usePageLoading.js'
import { ORDER_STATUS_LABEL_KEY, ORDER_STATUS_TONE } from '../../constants/orderStatus.js'
import { PAYMENT_METHOD_LABEL_KEY } from '../../constants/paymentStatus.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import { formatDate, formatDateTime } from '../../utils/formatDate.js'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card from '../../components/common/Card.jsx'
import Badge from '../../components/common/Badge.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import Button from '../../components/common/Button.jsx'
import { SkeletonText } from '../../components/common/Skeleton.jsx'

export default function CustomerDetail() {
  const { id } = useParams()
  const { t } = useI18n()
  const navigate = useNavigate()
  const { customers, orders, payments } = useApp()
  const loading = usePageLoading([id])

  const customer = customers.find((c) => c.id === id)

  const orderList = useMemo(
    () =>
      orders
        .filter((o) => o.customerId === id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders, id],
  )
  const paymentList = useMemo(
    () =>
      payments
        .filter((p) => orderList.some((o) => o.id === p.orderId))
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [payments, orderList],
  )
  const totalSpent = orderList.reduce((s, o) => s + o.paid, 0)

  if (loading) {
    return (
      <div className="max-w-4xl">
        <SkeletonText lines={4} />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        <Link to="/customers" className="mt-2 inline-block text-sm font-medium text-primary-strong hover:underline">
          {t('common.back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title={t('customers.detail.profile')}>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/customers')}>
          {t('common.back')}
        </Button>
      </PageHeader>

      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Avatar name={customer.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-foreground">{customer.name}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-mono">{customer.phone}</span>
              {customer.telegram && <span>{customer.telegram}</span>}
              <span className="flex items-center gap-1">
                <CalendarClock size={13} />
                {formatDate(customer.createdAt)}
              </span>
            </p>
          </div>
          <a href={`tel:${customer.phone}`} className="hidden sm:block">
            <Button variant="outline" icon={Phone}>{t('orders.contact')}</Button>
          </a>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted">{t('customers.col.orders')}</p>
            <p className="text-lg font-semibold text-foreground">{orderList.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted">{t('customers.col.totalSpent')}</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalSpent)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">{t('customers.col.lastVisit')}</p>
            <p className="text-sm font-medium text-foreground">
              {orderList[0] ? formatDate(orderList[0].createdAt) : '—'}
            </p>
          </div>
        </div>
        {customer.notes && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs text-muted">{t('customers.detail.notes')}</p>
            <p className="mt-0.5 text-sm text-foreground">{customer.notes}</p>
          </div>
        )}
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">{t('customers.detail.orders')}</h2>
          <div className="flex flex-col divide-y divide-border">
            {orderList.map((o) => (
              <Link
                key={o.id}
                to={`/orders/${o.id}`}
                className="flex items-center gap-3 py-3 transition-colors hover:bg-surface-hover"
              >
                <span className="rounded-lg bg-surface-muted p-1.5">
                  <Wrench size={14} className="text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{o.id} · {o.brand} {o.model}</p>
                  <p className="truncate text-xs text-muted-foreground">{o.issue}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(o.price)}</p>
                  <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                </div>
                <Badge tone={ORDER_STATUS_TONE[o.status]}>{t(ORDER_STATUS_LABEL_KEY[o.status])}</Badge>
              </Link>
            ))}
            {orderList.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">{t('common.noData')}</p>}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">{t('customers.detail.payments')}</h2>
          <div className="flex flex-col divide-y divide-border">
            {paymentList.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.orderRef}</p>
                  <p className="text-xs text-muted">
                    {t(PAYMENT_METHOD_LABEL_KEY[p.method])} · {formatDateTime(p.date)}
                  </p>
                </div>
                <p className="font-medium tabular-nums text-success">{formatCurrency(p.amount)}</p>
              </div>
            ))}
            {paymentList.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">{t('common.noData')}</p>}
          </div>
          <Link
            to="/payments"
            className="mt-2 flex items-center justify-center gap-1 text-sm font-medium text-primary-strong hover:underline"
          >
            {t('dashboard.viewAll')}
            <ChevronRight size={14} />
          </Link>
        </Card>
      </div>
    </div>
  )
}
