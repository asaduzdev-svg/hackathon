import { useMemo, useState } from 'react'
import { Pencil, UserRound } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useI18n } from '../../i18n/index.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { workersApi } from '../../services/modules/workersApi.js'
import { formatDate } from '../../utils/formatDate.js'
import PageHeader from '../../components/common/PageHeader.jsx'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import Table from '../../components/common/Table.jsx'
import Card from '../../components/common/Card.jsx'
import Modal from '../../components/common/Modal.jsx'
import Input from '../../components/common/Input.jsx'
import Select from '../../components/common/Select.jsx'
import SearchInput from '../../components/common/SearchInput.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import { SkeletonRows } from '../../components/common/Skeleton.jsx'
import { useDebounce } from '../../hooks/useDebounce.js'

const SPECIALIZATIONS = ['mechanic', 'electrician', 'diagnostician', 'painter', 'tire', 'body repair']

const EMPTY_FORM = { name: '', phone: '', specialization: 'mechanic' }

export default function WorkersList() {
  const { t } = useI18n()
  const toast = useToast()
  const { workers, orders, loading, refresh } = useApp()
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const withStats = useMemo(
    () =>
      (workers || []).map((w) => {
        const own = orders.filter((o) => o.workerId === w.id)
        return {
          ...w,
          activeOrders: own.filter((o) => !['cancelled', 'completed'].includes(o.status)).length,
          completedOrders: own.filter((o) => o.status === 'completed').length,
        }
      }),
    [workers, orders],
  )

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    if (!q) return withStats
    return withStats.filter((w) => `${w.name} ${w.phone} ${w.specialization}`.toLowerCase().includes(q))
  }, [withStats, debounced])

  const totalActive = withStats.reduce((s, w) => s + w.activeOrders, 0)
  const totalCompleted = withStats.reduce((s, w) => s + w.completedOrders, 0)

  const openEdit = (w) => {
    setEditing(w)
    setForm({ name: w.name, phone: w.phone || '', specialization: w.specialization || 'mechanic' })
    setModalOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = { name: form.name.trim(), phone: form.phone.trim(), specialization: form.specialization }
      if (editing) {
        await workersApi.update(editing.id, payload)
        toast.success('toasts.updated')
      } else {
        await workersApi.create(payload)
        toast.success('toasts.created')
      }
      setModalOpen(false)
      await refresh()
    } catch (err) {
      toast.error(err?.message || 'error.title')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'worker',
      header: t('workers.col.worker'),
      render: (w) => (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 font-bold text-accent">
            {(w.name || '?')[0].toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-foreground">{w.name}</p>
            <p className="font-mono text-xs text-muted">{w.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'specialization',
      header: t('workers.col.spec'),
      render: (w) => <Badge tone="info">{t(`workers.spec.${w.specialization}`)}</Badge>,
    },
    { key: 'rating', header: t('workers.col.rating'), align: 'center', render: (w) => <span className="tabular-nums text-foreground">⭐ {w.rating ?? '—'}</span> },
    { key: 'active', header: t('workers.col.active'), align: 'center', render: (w) => <span className="tabular-nums text-warning">{w.activeOrders}</span> },
    { key: 'completed', header: t('workers.col.completed'), align: 'center', render: (w) => <span className="tabular-nums text-success">{w.completedOrders}</span> },
    { key: 'joined', header: t('workers.col.joined'), render: (w) => <span className="text-muted-foreground">{formatDate(w.joinedAt)}</span> },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'right',
      render: (w) => (
        <Button size="sm" variant="outline" icon={Pencil} onClick={(ev) => { ev.stopPropagation(); openEdit(w) }}>
          {t('common.edit')}
        </Button>
      ),
    },
  ]

  const mobileRender = (w) => (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 font-bold text-accent">
            {(w.name || '?')[0].toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-foreground">{w.name}</p>
            <p className="font-mono text-xs text-muted">{w.phone}</p>
          </div>
        </div>
        <Button size="xs" variant="ghost" icon={Pencil} onClick={() => openEdit(w)} />
      </div>
      <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
        <Badge tone="info">{t(`workers.spec.${w.specialization}`)}</Badge>
        <span>⭐ {w.rating ?? '—'}</span>
      </div>
      <div className="mt-2 flex items-center gap-4 text-sm">
        <span className="text-warning">{w.activeOrders} {t('workers.col.active').toLowerCase()}</span>
        <span className="text-success">{w.completedOrders} {t('workers.col.completed').toLowerCase()}</span>
      </div>
    </Card>
  )

  return (
    <div>
      <PageHeader title={t('workers.title')} subtitle={t('workers.subtitle')} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label={t('workers.stat.total')} value={String(withStats.length)} icon={UserRound} iconTone="primary" />
        <StatCard label={t('workers.stat.active')} value={String(totalActive)} icon={UserRound} iconTone="warning" />
        <StatCard label={t('workers.stat.completed')} value={String(totalCompleted)} icon={UserRound} iconTone="success" />
      </div>

      <div className="mb-4 mt-4">
        <SearchInput value={search} onChange={setSearch} placeholder={t('workers.search')} className="max-w-xs" />
      </div>

      {loading ? (
        <SkeletonRows count={6} />
      ) : (
        <Table
          columns={columns}
          rows={filtered}
          mobileRender={mobileRender}
          empty={{ icon: UserRound, title: t('workers.empty'), description: t('workers.emptyCta') }}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('workers.editTitle') : t('workers.createTitle')}
        size="sm"
      >
        <form onSubmit={submit} className="space-y-4">
          <Input
            label={t('common.name')}
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={t('workers.placeholders.name')}
          />
          <Input
            label={t('common.phone')}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+998 90 000 00 00"
          />
          <Select
            label={t('workers.col.spec')}
            value={form.specialization}
            onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{t(`workers.spec.${s}`)}</option>
            ))}
          </Select>
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
