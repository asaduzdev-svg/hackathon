import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, CheckCircle2, Plus, Wallet, Wrench } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useI18n } from '../../i18n/index.jsx'
import { normalizePhone } from '../../utils/roles.js'
import { ORDER_STATUS_LABEL_KEY, ORDER_STATUS_TONE } from '../../constants/orderStatus.js'
import { formatDate } from '../../utils/formatDate.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import Badge from '../../components/common/Badge.jsx'
import SearchInput from '../../components/common/SearchInput.jsx'
import Table from '../../components/common/Table.jsx'
import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import { SkeletonRows } from '../../components/common/Skeleton.jsx'
import { useDebounce } from '../../hooks/useDebounce.js'

export default function Cars() {
  const { t } = useI18n()
  const { orders, customers, loading } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)

  const myPhone = useMemo(() => normalizePhone(user?.phone), [user])
  const myCustomer = useMemo(
    () => customers.find((c) => normalizePhone(c.phone) === myPhone) || null,
    [customers, myPhone],
  )

  const cars = useMemo(() => {
    const byPlate = new Map()
    const relevant = orders.filter((o) => {
      if (user?.role !== 'CUSTOMER') return true
      return myCustomer ? o.customerId === myCustomer.id : false
    })
    for (const o of relevant) {
      const key = (o.plate || 'noplate').toUpperCase()
      if (!byPlate.has(key)) {
        byPlate.set(key, {
          plate: o.plate,
          make: o.make,
          model: o.model,
          year: o.year,
          customerId: o.customerId,
          customerName: o.customerName,
          phone: o.phone,
          visits: 0,
          completed: 0,
          totalSpent: 0,
          lastVisit: null,
          lastStatus: null,
          lastOrderId: null,
        })
      }
      const c = byPlate.get(key)
      c.visits += 1
      if (o.status === 'completed') c.completed += 1
      if (o.status !== 'cancelled') c.totalSpent += Number(o.paid) || 0
      const at = new Date(o.createdAt)
      if (!c.lastVisit || at > new Date(c.lastVisit)) {
        c.lastVisit = o.createdAt
        c.lastStatus = o.status
        c.lastOrderId = o.id
      }
    }
    return Array.from(byPlate.values()).sort(
      (a, b) => new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0),
    )
  }, [orders, myCustomer, user?.role])

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    if (!q) return cars
    return cars.filter((c) =>
      [c.plate, c.make, c.model, c.customerName, c.phone].join(' ').toLowerCase().includes(q),
    )
  }, [cars, debounced])

  const inService = cars.filter((c) => ['new', 'diagnosing', 'repairing', 'ready'].includes(c.lastStatus)).length
  const completedCount = cars.filter((c) => c.lastStatus === 'completed').length
  const totalSpent = cars.reduce((s, c) => s + c.totalSpent, 0)

  const columns = [
    {
      key: 'car',
      header: t('cars.col.car'),
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Car size={18} />
          </span>
          <div>
            <p className="font-semibold text-foreground">{c.make} {c.model}</p>
            <p className="font-mono text-xs text-muted">{c.plate || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'customer',
      header: t('cars.col.customer'),
      render: (c) => (
        <div>
          <p className="font-medium text-foreground">{c.customerName}</p>
          <p className="font-mono text-xs text-muted">{c.phone}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('cars.col.status'),
      render: (c) =>
        c.lastStatus ? (
          <Badge tone={ORDER_STATUS_TONE[c.lastStatus]} dot>
            {t(ORDER_STATUS_LABEL_KEY[c.lastStatus])}
          </Badge>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    { key: 'visits', header: t('cars.col.visits'), align: 'center', render: (c) => <span className="tabular-nums text-foreground">{c.visits}</span> },
    { key: 'completed', header: t('cars.col.completed'), align: 'center', render: (c) => (c.completed > 0 ? <span className="inline-flex items-center gap-1 tabular-nums text-success"><CheckCircle2 size={14} />{c.completed}</span> : <span className="text-muted">—</span>) },
    { key: 'spent', header: t('cars.col.spent'), align: 'right', render: (c) => <span className="font-medium tabular-nums text-foreground">{formatCurrency(c.totalSpent)}</span> },
    { key: 'last', header: t('cars.col.lastVisit'), render: (c) => <span className="text-muted-foreground">{formatDate(c.lastVisit)}</span> },
  ]

  const mobileRender = (c) => (
    <Card as="button" type="button" className="p-4 text-left" onClick={() => c.lastOrderId && navigate(`/orders/${c.lastOrderId}`)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Car size={18} />
          </span>
          <div>
            <p className="font-semibold text-foreground">{c.make} {c.model}</p>
            <p className="font-mono text-xs text-muted">{c.plate || '—'}</p>
          </div>
        </div>
        {c.lastStatus && (
          <Badge tone={ORDER_STATUS_TONE[c.lastStatus]} dot>{t(ORDER_STATUS_LABEL_KEY[c.lastStatus])}</Badge>
        )}
      </div>
      <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>{c.customerName}</span>
        <span>{formatDate(c.lastVisit)}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="font-medium tabular-nums text-foreground">{formatCurrency(c.totalSpent)}</span>
        <span className="text-xs text-muted">{t('cars.col.visits')}: {c.visits}</span>
      </div>
    </Card>
  )

  return (
    <div>
      <PageHeader title={t('cars.title')} subtitle={t('cars.subtitle')}>
        <Link to="/orders/new">
          <Button icon={Plus}>{t('consumer.addCar')}</Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label={t('cars.stat.total')} value={String(cars.length)} icon={Car} iconTone="primary" />
        <StatCard label={t('cars.stat.inService')} value={String(inService)} icon={Wrench} iconTone="warning" />
        <StatCard label={t('cars.stat.completed')} value={String(completedCount)} icon={CheckCircle2} iconTone="success" />
      </div>

      <div className="mb-4 mt-4">
        <SearchInput value={search} onChange={setSearch} placeholder={t('cars.search')} className="max-w-xs" />
      </div>

      {loading ? (
        <SkeletonRows count={6} />
      ) : (
        <Table
          columns={columns}
          rows={filtered}
          onRowClick={(c) => c.lastOrderId && navigate(`/orders/${c.lastOrderId}`)}
          mobileRender={mobileRender}
          empty={{ icon: Car, title: t('cars.empty'), description: t('cars.emptyCta') }}
        />
      )}

      {totalSpent > 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wallet size={13} /> {t('cars.totalSpent', { total: formatCurrency(totalSpent) })}
        </p>
      )}
    </div>
  )
}
