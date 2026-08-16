import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Plus, Wallet, XCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useI18n } from '../../i18n/index.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { usePageLoading } from '../../hooks/usePageLoading.js'
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABEL_KEY,
  ORDER_STATUS_TONE,
} from '../../constants/orderStatus.js'
import { PRIORITY_LABEL_KEY, PRIORITY_TONE, CANCELLATION_REASONS, CANCELLATION_REASON_LABEL_KEY } from '../../constants/priority.js'
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABEL_KEY,
  getPaymentStatus,
  getRemaining,
  PAYMENT_STATUS_LABEL_KEY,
  PAYMENT_STATUS_TONE,
} from '../../constants/paymentStatus.js'
import { DEVICE_TYPE_LABEL_KEY } from '../../constants/deviceTypes.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import { formatDate, formatDateTime } from '../../utils/formatDate.js'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card from '../../components/common/Card.jsx'
import Badge from '../../components/common/Badge.jsx'
import Button from '../../components/common/Button.jsx'
import Select from '../../components/common/Select.jsx'
import Input from '../../components/common/Input.jsx'
import Modal from '../../components/common/Modal.jsx'
import { SkeletonText } from '../../components/common/Skeleton.jsx'

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value || '—'}</p>
    </div>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const { t } = useI18n()
  const navigate = useNavigate()
  const toast = useToast()
  const { orders, payments, updateOrderStatus, cancelOrder, addPayment } = useApp()

  const order = orders.find((o) => o.id === id)
  const loading = usePageLoading([id])

  const [statusModal, setStatusModal] = useState(false)
  const [paymentModal, setPaymentModal] = useState(false)
  const [cancelModal, setCancelModal] = useState(false)
  const [pending, setPending] = useState(false)

  const [nextStatus, setNextStatus] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cancelReason, setCancelReason] = useState('customer')

  const orderPayments = useMemo(
    () => payments.filter((p) => p.orderId === id).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [payments, id],
  )

  if (loading) {
    return (
      <div className="max-w-4xl">
        <SkeletonText lines={4} />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">{t('orders.notFound')}</p>
        <Link to="/orders" className="mt-2 inline-block text-sm font-medium text-primary-strong hover:underline">
          {t('common.back')} — {t('orders.title')}
        </Link>
      </div>
    )
  }

  const remaining = getRemaining(order.price, order.paid)
  const payStatus = getPaymentStatus(order.price, order.paid)
  const nextStatuses = ORDER_STATUS_FLOW[order.status] || []

  const handleStatusChange = async () => {
    if (!nextStatus) return
    setPending(true)
    try {
      await updateOrderStatus(order.id, nextStatus)
      toast.success('toasts.orderUpdated')
      setStatusModal(false)
      setNextStatus('')
    } finally {
      setPending(false)
    }
  }

  const handlePayment = async () => {
    const amount = Number(paymentAmount)
    if (!amount || amount <= 0) {
      toast.error('validation.positive')
      return
    }
    if (amount > remaining) {
      toast.error('validation.amountMax')
      return
    }
    setPending(true)
    try {
      await addPayment({ orderId: order.id, amount, method: paymentMethod })
      toast.success('toasts.paymentAdded')
      setPaymentAmount('')
      setPaymentModal(false)
    } finally {
      setPending(false)
    }
  }

  const handleCancel = async () => {
    setPending(true)
    try {
      await cancelOrder(order.id, cancelReason)
      toast.success('toasts.orderCancelled')
      setCancelModal(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title={t('orders.detailTitle', { id: order.id })}>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/orders')}>
          {t('common.back')}
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone={ORDER_STATUS_TONE[order.status]} dot>{t(ORDER_STATUS_LABEL_KEY[order.status])}</Badge>
        <Badge tone={PRIORITY_TONE[order.priority]}>{t(PRIORITY_LABEL_KEY[order.priority])}</Badge>
        <Badge tone={PAYMENT_STATUS_TONE[payStatus]}>{t(PAYMENT_STATUS_LABEL_KEY[payStatus])}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label={t('common.customer')} value={order.customerName} />
              <Field label={t('common.phone')} value={order.phone} />
              <Field label={t('orders.create.deviceType')} value={t(DEVICE_TYPE_LABEL_KEY[order.deviceType])} />
              <Field label={t('orders.create.brand')} value={`${order.brand} ${order.model}`} />
              <Field label={t('orders.createdAt')} value={formatDate(order.createdAt)} />
              <Field label={t('orders.create.notes')} value={order.notes} />
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <Field label={t('orders.create.issue')} value={order.issue} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">{t('orders.section.timeline')}</h2>
              <span className="text-xs text-muted">{formatDateTime(order.createdAt)}</span>
            </div>
            <ol className="relative ml-2 flex flex-col gap-4 border-l border-border pl-5">
              {order.timeline.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[26px] top-0.5 h-2.5 w-2.5 rounded-full border-2 border-border bg-primary" />
                  <p className="text-sm font-medium text-foreground">{t(entry.key, entry.vars)}</p>
                  <p className="text-xs text-muted">{formatDateTime(entry.at)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet size={15} className="text-muted" />
              {t('orders.section.payment')}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('orders.totalPrice')}</span>
                <span className="font-semibold tabular-nums text-foreground">{formatCurrency(order.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('orders.paidAmount')}</span>
                <span className="font-medium tabular-nums text-success">{formatCurrency(order.paid)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">{t('orders.remainingAmount')}</span>
                <span className="font-medium tabular-nums text-warning">{formatCurrency(remaining)}</span>
              </div>
            </div>
            {orderPayments.length > 0 && (
              <div className="mt-4 flex flex-col divide-y divide-border">
                {orderPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-muted">
                        {t(PAYMENT_METHOD_LABEL_KEY[p.method])} · {formatDate(p.date)}
                      </p>
                    </div>
                    <Badge tone="success">{t('status.payment.paid')}</Badge>
                  </div>
                ))}
              </div>
            )}
            {remaining > 0 && order.status !== 'cancelled' && order.status !== 'completed' && (
              <Button className="mt-4 w-full" variant="outline" icon={Plus} onClick={() => setPaymentModal(true)}>
                {t('orders.addPayment')}
              </Button>
            )}
          </Card>

          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <Card className="flex flex-col gap-2.5 p-5">
              {nextStatuses.length > 0 && (
                <Button icon={Check} onClick={() => setStatusModal(true)} className="w-full">
                  {t('orders.changeStatus')}
                </Button>
              )}
              <Button
                variant="outline"
                icon={XCircle}
                onClick={() => setCancelModal(true)}
                className="w-full text-danger hover:border-danger/40 hover:bg-danger-bg"
              >
                {t('orders.cancelOrder')}
              </Button>
            </Card>
          )}
        </div>
      </div>

      <Modal open={statusModal} onClose={() => setStatusModal(false)} title={t('orders.changeStatus')} size="sm">
        <Select
          label={t('orders.changeStatus')}
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value)}
          options={nextStatuses.map((s) => ({ value: s, label: t(ORDER_STATUS_LABEL_KEY[s]) }))}
          placeholder={t('orders.changeStatus')}
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setStatusModal(false)} disabled={pending}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleStatusChange} loading={pending} disabled={!nextStatus}>
            {t('common.confirm')}
          </Button>
        </div>
      </Modal>

      <Modal open={paymentModal} onClose={() => setPaymentModal(false)} title={t('orders.addPayment')} size="sm">
        <div className="mb-3 rounded-lg bg-surface-muted/60 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('orders.totalPrice')}</span>
            <span className="font-medium text-foreground">{formatCurrency(order.price)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-muted-foreground">{t('orders.remainingAmount')}</span>
            <span className="font-medium text-warning">{formatCurrency(remaining)}</span>
          </div>
        </div>
        <div className="space-y-3">
          <Input label={t('payments.add.amount')} type="number" min="0" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0" />
          <Select
            label={t('payments.add.method')}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={PAYMENT_METHODS.map((m) => ({ value: m, label: t(PAYMENT_METHOD_LABEL_KEY[m]) }))}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPaymentModal(false)} disabled={pending}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handlePayment} loading={pending}>
            {t('common.save')}
          </Button>
        </div>
      </Modal>

      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title={t('orders.cancelOrderTitle')} size="sm">
        <p className="text-sm text-muted-foreground">{t('orders.cancelOrderText')}</p>
        <div className="mt-4">
          <Select
            label={t('orders.cancelReason')}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            options={CANCELLATION_REASONS.map((r) => ({ value: r, label: t(CANCELLATION_REASON_LABEL_KEY[r]) }))}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCancelModal(false)} disabled={pending}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleCancel} loading={pending}>
            {t('orders.cancelOrder')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
