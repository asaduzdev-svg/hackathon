import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Package, Search, Users, Wrench } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useI18n } from '../i18n/index.jsx'

function ResultGroup({ icon: Icon, title, items, onPick }) {
  if (items.length === 0) return null
  return (
    <div className="px-2 py-2">
      <p className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
        <Icon size={12} />
        {title}
      </p>
      <div>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onPick(item.to)}
            className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-hover"
          >
            <span className="min-w-0 truncate">{item.title}</span>
            <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
              {item.subtitle}
              <ArrowRight size={13} />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function GlobalSearch({ open, onClose }) {
  const { orders, customers, inventory } = useApp()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return undefined
    setQuery('')
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const q = query.trim().toLowerCase()
  const matchOrders = orders
    .filter(
      (o) =>
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        `${o.device?.brand || ''} ${o.device?.model || ''}`.toLowerCase().includes(q),
    )
    .slice(0, 5)
    .map((o) => ({
      key: o.id,
      to: `/orders/${o.id}`,
      title: `${o.id} — ${o.customerName}`,
      subtitle: t('status.order.' + o.status),
    }))
  const matchCustomers = customers
    .filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q))
    .slice(0, 5)
    .map((c) => ({
      key: c.id,
      to: `/customers/${c.id}`,
      title: c.name,
      subtitle: c.phone,
    }))
  const matchInventory = inventory
    .filter((i) => !q || i.name.toLowerCase().includes(q))
    .slice(0, 5)
    .map((i) => ({
      key: i.id,
      to: '/inventory',
      title: i.name,
      subtitle: t(`status.inventory.${i.status}`),
    }))

  const hasResults = matchOrders.length + matchCustomers.length + matchInventory.length > 0

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-start justify-center p-3 pt-[8dvh] sm:pt-[12dvh]">
      <div className="animate-fade-in absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="animate-scale-in relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-pop">
        <div className="flex items-center gap-2.5 border-b border-border px-4">
          <Search size={18} className="text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.search')}
            className="h-13 w-full bg-transparent py-4 text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
        </div>
        <div className="max-h-[50dvh] overflow-y-auto py-1">
          {!hasResults ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t('common.noData')}</p>
          ) : (
            <>
              <ResultGroup icon={Wrench} title={t('nav.orders')} items={matchOrders} onPick={(to) => { onClose(); navigate(to) }} />
              <ResultGroup icon={Users} title={t('nav.customers')} items={matchCustomers} onPick={(to) => { onClose(); navigate(to) }} />
              <ResultGroup icon={Package} title={t('nav.inventory')} items={matchInventory} onPick={(to) => { onClose(); navigate(to) }} />
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
