import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, Phone, UserRound, Wallet, Wrench, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import { normalizePhone } from '../utils/roles.js'
import { ORDER_STATUS_LABEL_KEY, ORDER_STATUS_TONE } from '../constants/orderStatus.js'
import {
  getPaymentStatus,
  PAYMENT_STATUS_LABEL_KEY,
  PAYMENT_STATUS_TONE,
} from '../constants/paymentStatus.js'
import { formatDate } from '../utils/formatDate.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Table from '../components/common/Table.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Button from '../components/common/Button.jsx'
import { SkeletonRows } from '../components/common/Skeleton.jsx'

export default function ConsumerPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { orders, customers, payments, loading } = useApp()
  const navigate = useNavigate()

  const me = useMemo(() => {
    const phone = normalizePhone(user?.phone)
    return customers.find((c) => normalizePhone(c.phone) === phone) || null
  }, [customers, user])

  const myOrders = useMemo(
    () =>
      orders
        .filter((o) => me && o.customerId === me.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders, me],
  )

  const activeCount = myOrders.filter((o) => ['new', 'diagnosing', 'repairing', 'ready'].includes(o.status)).length
  const totalSpent = myOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + (Number(o.paid) || 0), 0)
  const myPayments = useMemo(
    () => payments.filter((p) => myOrders.some((o) => o.id === p.orderId)).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [payments, myOrders],
  )

  const columns = [
    { key: 'id', header: t('orders.col.id'), render: (o) => <span className="font-semibold text-foreground">{o.id}</span> },
    {
      key: 'car',
      header: t('orders.col.device'),
      render: (o) => (
        <div>
          <p className="text-foreground">{o.make} {o.model}</p>
          <p className="text-xs text-muted">{o.plate}</p>
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

  return (
    <div>
      <PageHeader title={t('consumer.title', { name: user?.name })} subtitle={t('consumer.subtitle')}>
        <Link to="/orders/new">
          <Button icon={Plus}>{t('consumer.addCar')}</Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label={t('consumer.myOrders')} value={String(myOrders.length)} icon={Car} iconTone="primary" />
            <StatCard label={t('consumer.activeOrders')} value={String(activeCount)} icon={Wrench} iconTone="warning" />
            <StatCard label={t('consumer.totalSpent')} value={formatCurrency(totalSpent)} icon={Wallet} iconTone="success" />
          </div>

          <div className="mt-4">
            {loading ? (
              <SkeletonRows count={4} />
            ) : (
              <Table
                columns={columns}
                rows={myOrders}
                onRowClick={(o) => navigate(`/orders/${o.id}`)}
                empty={{
                  icon: Car,
                  title: t('consumer.noOrders'),
                  description: t('consumer.addCarCta'),
                  action: (
                    <Link to="/orders/new">
                      <Button size="sm" icon={Plus}>{t('consumer.addCar')}</Button>
                    </Link>
                  ),
                }}
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/15 p-2.5">
                <UserRound size={18} className="text-primary-strong" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{me?.name || user?.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Phone size={11} /> {me?.phone || user?.phone}
                </p>
              </div>
            </div>
            {me?.telegram && (
              <p className="mt-3 text-sm text-muted-foreground">
                {t('consumer.telegram')}: <span className="text-foreground">{me.telegram}</span>
              </p>
            )}
            {me?.notes && <p className="mt-1 text-sm text-muted-foreground">{me.notes}</p>}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">{t('consumer.paymentHistory')}</h2>
            {myPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('consumer.noPayments')}</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {myPayments.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-muted">{p.orderId} · {formatDate(p.date)}</p>
                    </div>
                    <Badge tone="success">{t('status.payment.paid')}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
