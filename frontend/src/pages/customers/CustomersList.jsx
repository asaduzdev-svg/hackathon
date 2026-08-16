import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useCustomers } from '../../hooks/useCustomers.js'
import { useApp } from '../../context/AppContext.jsx'
import { useI18n } from '../../i18n/index.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useDebounce } from '../../hooks/useDebounce.js'
import { addDays } from '../../utils/formatDate.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/common/SearchInput.jsx'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import Table from '../../components/common/Table.jsx'
import Card from '../../components/common/Card.jsx'
import Modal from '../../components/common/Modal.jsx'
import Input from '../../components/common/Input.jsx'

export default function CustomersList() {
  const { t } = useI18n()
  const { customers, createCustomer } = useCustomers()
  const { orders } = useApp()
  const toast = useToast()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', telegram: '' })
  const [saving, setSaving] = useState(false)
  const debounced = useDebounce(search)

  const stats = useMemo(() => {
    const map = new Map()
    for (const c of customers) {
      map.set(c.id, { orders: [], spent: 0 })
    }
    for (const o of orders) {
      const row = map.get(o.customerId)
      if (row) {
        row.orders.push(o)
        row.spent += o.paid
      }
    }
    return map
  }, [customers, orders])

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    return customers.filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q))
  }, [customers, debounced])

  const isActive = (c) => {
    const list = stats.get(c.id)?.orders || []
    const cutoff = addDays(new Date(), -30)
    return list.some((o) => new Date(o.createdAt) >= cutoff)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await createCustomer(form)
      toast.success('toasts.customerCreated')
      setModalOpen(false)
      setForm({ name: '', phone: '', telegram: '' })
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('customers.col.name'),
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={c.name} />
          <div>
            <p className="font-medium text-foreground">{c.name}</p>
            {c.telegram && <p className="text-xs text-muted">{c.telegram}</p>}
          </div>
        </div>
      ),
    },
    { key: 'phone', header: t('customers.col.phone'), render: (c) => <span className="font-mono text-sm text-foreground">{c.phone}</span> },
    { key: 'orders', header: t('customers.col.orders'), align: 'right', render: (c) => <span className="tabular-nums text-foreground">{stats.get(c.id)?.orders.length || 0}</span> },
    { key: 'spent', header: t('customers.col.totalSpent'), align: 'right', render: (c) => <span className="font-medium tabular-nums text-foreground">{formatCurrency(stats.get(c.id)?.spent || 0)}</span> },
    {
      key: 'status',
      header: t('customers.col.status'),
      render: (c) =>
        isActive(c) ? (
          <Badge tone="success" dot>{t('customers.active')}</Badge>
        ) : (
          <Badge tone="muted">{t('customers.inactive')}</Badge>
        ),
    },
  ]

  const mobileRender = (c) => (
    <Card key={c.id} as="button" type="button" className="p-4 text-left" onClick={() => navigate(`/customers/${c.id}`)}>
      <div className="flex items-center gap-3">
        <Avatar name={c.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
          <p className="font-mono text-xs text-muted">{c.phone}</p>
        </div>
        {isActive(c) ? <Badge tone="success" dot>{t('customers.active')}</Badge> : <Badge tone="muted">{t('customers.inactive')}</Badge>}
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{stats.get(c.id)?.orders.length || 0} {t('orders.title')}</span>
        <span className="font-medium text-foreground">{formatCurrency(stats.get(c.id)?.spent || 0)}</span>
      </div>
    </Card>
  )

  return (
    <div>
      <PageHeader title={t('customers.title')} subtitle={t('customers.subtitle')}>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>
          {t('customers.create')}
        </Button>
      </PageHeader>

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder={t('customers.search')} className="max-w-xs" />
      </div>

      <Table
        columns={columns}
        rows={filtered}
        onRowClick={(c) => navigate(`/customers/${c.id}`)}
        mobileRender={mobileRender}
        empty={{ icon: Users, title: t('customers.empty'), description: t('customers.emptyCta') }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('customers.createTitle')} size="sm">
        <form onSubmit={submit} className="space-y-4">
          <Input label={t('common.name')} required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label={t('common.phone')} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998 90 000 00 00" />
          <Input label={t('customers.detail.telegram')} value={form.telegram} onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))} placeholder="@username" />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={saving}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
