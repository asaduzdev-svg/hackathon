import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders.js'
import { useCustomers } from '../../hooks/useCustomers.js'
import { useI18n } from '../../i18n/index.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { DEVICE_TYPES, DEVICE_TYPE_LABEL_KEY, DEVICE_BRANDS } from '../../constants/deviceTypes.js'
import { PRIORITIES, PRIORITY_LABEL_KEY } from '../../constants/priority.js'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card from '../../components/common/Card.jsx'
import Input from '../../components/common/Input.jsx'
import Select from '../../components/common/Select.jsx'
import Textarea from '../../components/common/Textarea.jsx'
import Button from '../../components/common/Button.jsx'
import SegmentedControl from '../../components/common/SegmentedControl.jsx'

export default function CreateOrder() {
  const { t } = useI18n()
  const { createOrder, addPayment } = useOrders()
  const { customers, createCustomer } = useCustomers()
  const toast = useToast()
  const navigate = useNavigate()

  const [mode, setMode] = useState('existing')
  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    phone: '',
    deviceType: 'phone',
    brand: '',
    model: '',
    issue: '',
    price: '',
    paid: '',
    priority: 'normal',
    notes: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const brands = DEVICE_BRANDS[form.deviceType] || []
  const customerOptions = useMemo(
    () => customers.map((c) => ({ value: c.id, label: `${c.name} — ${c.phone}` })),
    [customers],
  )

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (mode === 'new' && !form.customerName.trim()) {
      setError(t('validation.required'))
      return
    }
    if (!form.issue.trim()) {
      setError(t('validation.required'))
      return
    }
    setSaving(true)
    try {
      let customerId = form.customerId
      let customerName = ''
      let phone = ''
      if (mode === 'new') {
        const customer = await createCustomer({
          name: form.customerName.trim(),
          phone: form.phone,
        })
        customerId = customer.id
        customerName = customer.name
        phone = customer.phone
      } else {
        const customer = customers.find((c) => c.id === form.customerId)
        customerName = customer?.name || ''
        phone = customer?.phone || ''
      }
      const order = await createOrder({
        customerId,
        customerName,
        phone,
        deviceType: form.deviceType,
        brand: form.brand,
        model: form.model,
        issue: form.issue,
        priority: form.priority,
        price: Number(form.price) || 0,
        notes: form.notes,
      })
      const initialPaid = Number(form.paid) || 0
      if (initialPaid > 0) {
        await addPayment({ orderId: order.id, amount: initialPaid, method: 'cash' })
      }
      toast.success('toasts.orderCreated')
      navigate(`/orders/${order.id}`)
    } catch {
      setError(t('error.title'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title={t('orders.create.title')} subtitle={t('orders.create.subtitle')}>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/orders')}>
          {t('common.back')}
        </Button>
      </PageHeader>

      <form onSubmit={submit} className="space-y-4">
        <Card className="p-5">
          <SegmentedControl
            value={mode}
            onChange={setMode}
            options={[
              { value: 'existing', label: t('orders.create.existingCustomer') },
              { value: 'new', label: t('orders.create.newCustomer') },
            ]}
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {mode === 'existing' ? (
              <Select
                label={t('orders.create.selectCustomer')}
                required
                value={form.customerId}
                onChange={set('customerId')}
                options={customerOptions}
                placeholder={t('orders.create.selectCustomer')}
                className="sm:col-span-2"
              />
            ) : (
              <>
                <Input label={t('orders.create.customerName')} required value={form.customerName} onChange={set('customerName')} />
                <Input label={t('orders.create.customerPhone')} value={form.phone} onChange={set('phone')} placeholder="+998 90 000 00 00" />
              </>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label={t('orders.create.deviceType')}
              required
              value={form.deviceType}
              onChange={set('deviceType')}
              options={DEVICE_TYPES.map((d) => ({ value: d, label: t(DEVICE_TYPE_LABEL_KEY[d]) }))}
            />
            <Select
              label={t('orders.create.brand')}
              value={form.brand}
              onChange={set('brand')}
              options={brands.map((b) => ({ value: b, label: b }))}
              placeholder={t('orders.create.brand')}
            />
            <Input label={t('orders.create.model')} value={form.model} onChange={set('model')} placeholder="iPhone 13" />
            <Textarea
              label={t('orders.create.issue')}
              required
              value={form.issue}
              onChange={set('issue')}
              placeholder={t('orders.create.issuePlaceholder')}
              rows={2}
              className="sm:col-span-2 lg:col-span-3"
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t('orders.create.price')}
              type="number"
              min="0"
              value={form.price}
              onChange={set('price')}
              placeholder="0"
            />
            <Input
              label={t('orders.paidAmount')}
              type="number"
              min="0"
              value={form.paid}
              onChange={set('paid')}
              placeholder="0"
            />
            <Select
              label={t('orders.create.priority')}
              value={form.priority}
              onChange={set('priority')}
              options={PRIORITIES.map((p) => ({ value: p, label: t(PRIORITY_LABEL_KEY[p]) }))}
            />
            <Textarea
              label={t('orders.create.notes')}
              value={form.notes}
              onChange={set('notes')}
              rows={2}
              placeholder={t('common.optional')}
            />
          </div>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" type="button" onClick={() => navigate('/orders')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={saving} icon={Plus}>
            {t('orders.create.title')}
          </Button>
        </div>
      </form>
    </div>
  )
}
