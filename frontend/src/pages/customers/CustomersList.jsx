import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useCustomers } from '../../hooks/useCustomers.js'
import { useApp } from '../../context/AppContext.jsx'
import { useI18n } from '../../i18n/index.jsx'
import { useDebounce } from '../../hooks/useDebounce.js'
import { addDays } from '../../utils/formatDate.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import PageHeader from '../../components/common/PageHeader.jsx'
import SearchInput from '../../components/common/SearchInput.jsx'
import Badge from '../../components/common/Badge.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import Table from '../../components/common/Table.jsx'
import Card from '../../components/common/Card.jsx'
import { SkeletonRows } from '../../components/common/Skeleton.jsx'

export default function CustomersList() {
  const { t } = useI18n()
  const { customers } = useCustomers()
  const { orders, loading } = useApp()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
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
      <PageHeader title={t('customers.title')} subtitle={t('customers.subtitle')} />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder={t('customers.search')} className="max-w-xs" />
      </div>

      {loading ? (
        <SkeletonRows count={6} />
      ) : (
      <Table
        columns={columns}
        rows={filtered}
        onRowClick={(c) => navigate(`/customers/${c.id}`)}
        mobileRender={mobileRender}
        empty={{ icon: Users, title: t('customers.empty'), description: t('customers.emptyCta') }}
      />
      )}
    </div>
  )
}
