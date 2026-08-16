import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Wrench } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { normalizePhone } from '../utils/roles.js'
import { ORDER_STATUS_LABEL_KEY, ORDER_STATUS_TONE, ORDER_STATUS_FLOW } from '../constants/orderStatus.js'
import { formatDate } from '../utils/formatDate.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import PageHeader from '../components/common/PageHeader.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import Table from '../components/common/Table.jsx'
import { UserRound, ListChecks, CheckCircle2, Banknote } from 'lucide-react'

export default function WorkerPage() {
  const { t } = useI18n()
  const toast = useToast()
  const { user } = useAuth()
  const { orders, workers, updateOrderStatus } = useApp()
  const [busyId, setBusyId] = useState('')

  const me = useMemo(() => {
    const phone = normalizePhone(user?.phone)
    return workers.find((w) => normalizePhone(w.phone) === phone) || null
  }, [workers, user])

  const myOrders = useMemo(
    () =>
      orders
        .filter((o) => me && o.workerId === me.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders, me],
  )

  const active = myOrders.filter((o) => ['new', 'diagnosing', 'repairing', 'ready'].includes(o.status))
  const completed = myOrders.filter((o) => o.status === 'completed').length
  const earned = myOrders
    .filter((o) => o.status === 'completed')
    .reduce((s, o) => s + (Number(o.price) || 0), 0)

  const advance = async (order) => {
    const next = (ORDER_STATUS_FLOW[order.status] || [])[0]
    if (!next) return
    setBusyId(order.id)
    try {
      await updateOrderStatus(order.id, next)
      toast.success('toasts.orderUpdated')
    } catch {
      toast.error('error.title')
    } finally {
      setBusyId('')
    }
  }

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
    { key: 'price', header: t('orders.col.price'), align: 'right', render: (o) => <span className="font-medium tabular-nums text-foreground">{formatCurrency(o.price)}</span> },
    { key: 'date', header: t('orders.col.date'), render: (o) => <span className="text-muted-foreground">{formatDate(o.createdAt)}</span> },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (o) =>
        (ORDER_STATUS_FLOW[o.status] || []).length > 0 ? (
          <Button size="sm" icon={Check} loading={busyId === o.id} onClick={() => advance(o)}>
            {t('orders.changeStatus')}
          </Button>
        ) : null,
    },
  ]

  return (
    <div>
      <PageHeader title={t('worker.title', { name: user?.name })} subtitle={t('worker.subtitle')} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('worker.myOrders')} value={String(myOrders.length)} icon={ListChecks} iconTone="primary" />
        <StatCard label={t('worker.activeOrders')} value={String(active.length)} icon={Wrench} iconTone="warning" />
        <StatCard label={t('worker.completedOrders')} value={String(completed)} icon={CheckCircle2} iconTone="success" />
        <StatCard label={t('worker.earned')} value={formatCurrency(earned)} icon={Banknote} iconTone="info" />
      </div>

      {!me && (
        <Card className="mt-4 p-5">
          <p className="text-sm text-muted-foreground">{t('worker.notLinked')}</p>
        </Card>
      )}

      <div className="mt-4">
        <Table
          columns={columns}
          rows={myOrders}
          empty={{
            icon: UserRound,
            title: t('worker.noOrders'),
            description: t('worker.noOrdersCta'),
          }}
        />
      </div>

      <div className="mt-4">
        <Link to="/orders" className="text-sm font-medium text-primary-strong hover:underline">
          {t('worker.allOrders')}
        </Link>
      </div>
    </div>
  )
}
