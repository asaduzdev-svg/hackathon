import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Activity, CalendarCheck, PackageCheck, Plus, Users, Wallet, Wrench } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import { ACTIVE_STATUSES, ORDER_STATUS_LABEL_KEY, ORDER_STATUS_TONE } from '../constants/orderStatus.js'
import { isToday, isYesterday, formatRelativeTime } from '../utils/formatDate.js'
import { formatCurrency, formatCompact } from '../utils/formatCurrency.js'
import StatCard from '../components/common/StatCard.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Avatar from '../components/common/Avatar.jsx'
import Button from '../components/common/Button.jsx'
import { SkeletonCards, SkeletonText } from '../components/common/Skeleton.jsx'

function greetingKey() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

function deltaBadge(delta) {
  if (delta > 0) return 'up'
  if (delta < 0) return 'down'
  return 'neutral'
}

const ACTIVITY_ICON = {
  order_created: Wrench,
  order_status: PackageCheck,
  payment: CalendarCheck,
  order_cancelled: PackageCheck,
}

export default function Dashboard() {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const { orders, payments, activity, loading } = useApp()

  const kpi = useMemo(() => {
    const todayOrders = orders.filter((o) => isToday(o.createdAt))
    const yesterdayOrders = orders.filter((o) => isYesterday(o.createdAt))
    const todayRevenue = payments.filter((p) => isToday(p.date)).reduce((s, p) => s + p.amount, 0)
    const yesterdayRevenue = payments.filter((p) => isYesterday(p.date)).reduce((s, p) => s + p.amount, 0)
    const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status))
    const ready = orders.filter((o) => o.status === 'ready')
    return {
      todayOrders: todayOrders.length,
      todayOrdersDelta: todayOrders.length - yesterdayOrders.length,
      todayRevenue,
      todayRevenueDelta: todayRevenue - yesterdayRevenue,
      active: active.length,
      ready: ready.length,
    }
  }, [orders, payments])

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [orders],
  )

  const todayActivity = useMemo(
    () => activity.filter((a) => isToday(a.at)).slice(0, 6),
    [activity],
  )

  const deltaLabel = (delta) => {
    const key = deltaBadge(delta)
    if (key === 'neutral') return t('dashboard.delta.neutral')
    return t(`dashboard.delta.${key}`, { value: Math.abs(delta) })
  }

  if (loading) {
    return (
      <div>
        <SkeletonText lines={2} className="max-w-sm" />
        <div className="mt-5">
          <SkeletonCards count={4} />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SkeletonText lines={6} />
          </div>
          <SkeletonText lines={6} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {t(`dashboard.greeting.${greetingKey()}`, { name: user?.name?.split(' ')[0] })}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label={t('dashboard.kpi.todayOrders')}
          value={String(kpi.todayOrders)}
          icon={Wrench}
          iconTone="primary"
          delta={{ direction: deltaBadge(kpi.todayOrdersDelta), label: deltaLabel(kpi.todayOrdersDelta) }}
        />
        <StatCard label={t('dashboard.kpi.activeRepairs')} value={String(kpi.active)} icon={PackageCheck} iconTone="warning" />
        <StatCard label={t('dashboard.kpi.readyForPickup')} value={String(kpi.ready)} icon={CalendarCheck} iconTone="info" />
        <StatCard
          label={t('dashboard.kpi.todayRevenue')}
          value={formatCompact(kpi.todayRevenue)}
          icon={Wallet}
          iconTone="success"
          delta={{ direction: deltaBadge(kpi.todayRevenueDelta), label: deltaLabel(kpi.todayRevenueDelta) }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link to="/orders/new">
          <Button icon={Plus}>{t('orders.create.title')}</Button>
        </Link>
        <Link to="/customers">
          <Button variant="outline" icon={Users}>
            {t('customers.create')}
          </Button>
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{t('dashboard.recentOrders')}</h2>
            <Link to="/orders" className="flex items-center text-xs font-medium text-primary-strong hover:underline">
              {t('dashboard.viewAll')}
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                to={`/orders/${o.id}`}
                className="flex items-center gap-3 py-3 transition-colors hover:bg-surface-hover"
              >
                <Avatar name={o.customerName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    <span className="font-semibold">{o.id}</span> · {o.customerName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {o.make} {o.model} · {o.plate} — {o.issue}
                  </p>
                </div>
                <span className="hidden text-sm font-medium tabular-nums text-foreground sm:block">
                  {formatCurrency(o.price)}
                </span>
                <Badge tone={ORDER_STATUS_TONE[o.status]}>{t(ORDER_STATUS_LABEL_KEY[o.status])}</Badge>
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">{t('common.noData')}</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Activity size={16} className="text-muted" />
            <h2 className="text-sm font-semibold text-foreground">{t('dashboard.activity')}</h2>
          </div>
          <div className="flex flex-col gap-3">
            {todayActivity.map((a) => {
              const Icon = ACTIVITY_ICON[a.type] || Activity
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-lg bg-surface-muted p-1.5">
                    <Icon size={14} className="text-muted-foreground" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{t(a.key, a.vars)}</p>
                    <p className="text-xs text-muted">{formatRelativeTime(a.at, lang)}</p>
                  </div>
                </div>
              )
            })}
            {todayActivity.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">{t('dashboard.activityEmpty')}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
