import { useMemo, useState } from 'react'
import { Boxes, Package, PackagePlus, Plus, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useDebounce } from '../hooks/useDebounce.js'
import { getStockStatus, INVENTORY_STATUS_LABEL_KEY, INVENTORY_STATUS_TONE, INVENTORY_CATEGORIES, INVENTORY_CATEGORY_LABEL_KEY } from '../constants/inventoryStatus.js'
import { formatCurrency, formatCompact } from '../utils/formatCurrency.js'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Select from '../components/common/Select.jsx'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'
import Badge from '../components/common/Badge.jsx'
import Card from '../components/common/Card.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Table from '../components/common/Table.jsx'
import { SkeletonRows } from '../components/common/Skeleton.jsx'
import Modal from '../components/common/Modal.jsx'

const EMPTY_FORM = { name: '', category: 'filter', quantity: '', minimum: '', purchasePrice: '', sellingPrice: '' }

export default function Inventory() {
  const { t } = useI18n()
  const toast = useToast()
  const { inventory, createInventoryItem, updateInventoryStock, updateInventoryItem, loading } = useApp()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const debounced = useDebounce(search)

  const [addOpen, setAddOpen] = useState(false)
  const [stockItem, setStockItem] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [stockForm, setStockForm] = useState({ quantity: '', note: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const summary = useMemo(() => {
    const low = inventory.filter((i) => getStockStatus(i.quantity, i.minimum) === 'low_stock').length
    const out = inventory.filter((i) => getStockStatus(i.quantity, i.minimum) === 'out_of_stock').length
    const value = inventory.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.purchasePrice) || 0), 0)
    return { total: inventory.length, low, out, value }
  }, [inventory])

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    return inventory.filter(
      (i) =>
        (category === 'all' || i.category === category) &&
        (!q || i.name.toLowerCase().includes(q)),
    )
  }, [inventory, debounced, category])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setError('')
    setAddOpen(true)
  }

  const openStock = (item) => {
    setStockForm({ quantity: '', note: '' })
    setError('')
    setStockItem(item)
  }

  const openEdit = (item) => {
    setForm({
      name: item.name,
      category: item.category,
      quantity: '',
      minimum: String(item.minimum ?? ''),
      purchasePrice: String(item.purchasePrice ?? ''),
      sellingPrice: String(item.sellingPrice ?? ''),
    })
    setError('')
    setEditItem(item)
  }

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError(t('validation.required'))
      return
    }
    setSaving(true)
    try {
      await createInventoryItem({
        name: form.name.trim(),
        category: form.category,
        quantity: Number(form.quantity) || 0,
        minimum: Number(form.minimum) || 0,
        purchasePrice: Number(form.purchasePrice) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
      })
      toast.success('toasts.inventoryCreated')
      setAddOpen(false)
    } catch {
      setError(t('error.title'))
    } finally {
      setSaving(false)
    }
  }

  const handleStock = async () => {
    const qty = Number(stockForm.quantity)
    if (!qty || qty <= 0) {
      setError(t('validation.positive'))
      return
    }
    setSaving(true)
    try {
      await updateInventoryStock(stockItem.id, { quantity: qty, note: stockForm.note })
      toast.success('toasts.stockAdded')
      setStockItem(null)
    } catch {
      setError(t('error.title'))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!form.name.trim()) {
      setError(t('validation.required'))
      return
    }
    setSaving(true)
    try {
      await updateInventoryItem(editItem.id, {
        name: form.name.trim(),
        category: form.category,
        minimum: Number(form.minimum) || 0,
        purchasePrice: Number(form.purchasePrice) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
      })
      toast.success('toasts.inventoryUpdated')
      setEditItem(null)
    } catch {
      setError(t('error.title'))
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'item',
      header: t('inventory.col.item'),
      render: (i) => (
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-surface-muted p-2">
            <Package size={15} className="text-muted-foreground" />
          </span>
          <div>
            <p className="font-medium text-foreground">{i.name}</p>
            <p className="font-mono text-xs text-muted">{i.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('inventory.col.category'),
      render: (i) => <Badge tone="muted">{t(INVENTORY_CATEGORY_LABEL_KEY[i.category] || `inventory.category.${i.category}`)}</Badge>,
    },
    {
      key: 'quantity',
      header: t('inventory.col.quantity'),
      render: (i) => <span className="font-medium tabular-nums text-foreground">{i.quantity}</span>,
    },
    { key: 'minimum', header: t('inventory.col.minimum'), render: (i) => <span className="text-muted-foreground">{i.minimum}</span> },
    {
      key: 'status',
      header: t('inventory.col.status'),
      render: (i) => (
        <Badge tone={INVENTORY_STATUS_TONE[getStockStatus(i.quantity, i.minimum)]} dot>
          {t(INVENTORY_STATUS_LABEL_KEY[getStockStatus(i.quantity, i.minimum)])}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (i) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button size="sm" variant="outline" onClick={() => openStock(i)}>
            {t('inventory.addStock')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(i)}>
            {t('inventory.edit')}
          </Button>
        </div>
      ),
    },
  ]

  const mobileRender = (i) => {
    const status = getStockStatus(i.quantity, i.minimum)
    return (
      <Card key={i.id} className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{i.name}</p>
            <p className="text-xs text-muted">
              {t(INVENTORY_CATEGORY_LABEL_KEY[i.category] || `inventory.category.${i.category}`)} · {i.id}
            </p>
          </div>
          <Badge tone={INVENTORY_STATUS_TONE[status]} dot>{t(INVENTORY_STATUS_LABEL_KEY[status])}</Badge>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-4">
            <div>
              <p className="text-[11px] text-muted">{t('inventory.col.quantity')}</p>
              <p className="text-sm font-medium tabular-nums text-foreground">{i.quantity}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">{t('inventory.col.minimum')}</p>
              <p className="text-sm tabular-nums text-muted-foreground">{i.minimum}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">{t('inventory.col.sellingPrice')}</p>
              <p className="text-sm font-medium tabular-nums text-foreground">{formatCurrency(i.sellingPrice)}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" icon={PackagePlus} className="flex-1" onClick={() => openStock(i)}>
            {t('inventory.addStock')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(i)}>
            {t('inventory.edit')}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <PageHeader title={t('inventory.title')} subtitle={t('inventory.subtitle')}>
        <Button icon={Plus} onClick={openAdd}>
          {t('inventory.add')}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('inventory.title')} value={String(summary.total)} icon={Boxes} iconTone="primary" />
        <StatCard label={t('inventory.lowStock')} value={String(summary.low)} icon={TrendingUp} iconTone="warning" />
        <StatCard label={t('inventory.outOfStock')} value={String(summary.out)} icon={Package} iconTone="danger" />
        <StatCard label={t('inventory.stockValue')} value={formatCompact(summary.value)} icon={PackagePlus} iconTone="success" />
      </div>

      <div className="mb-4 mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder={t('inventory.search')} className="sm:max-w-xs" />
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="sm:w-52"
          aria-label={t('inventory.filterCategory')}
        >
          <option value="all">{t('inventory.filterCategory')}: {t('common.all')}</option>
          {INVENTORY_CATEGORIES.map((c) => (
            <option key={c} value={c}>{t(INVENTORY_CATEGORY_LABEL_KEY[c])}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <SkeletonRows count={5} />
      ) : (
      <Table
        columns={columns}
        rows={filtered}
        mobileRender={mobileRender}
        empty={{
          icon: Package,
          title: t('inventory.empty'),
          description: t('inventory.emptyCta'),
          action: (
            <Button size="sm" icon={Plus} onClick={openAdd}>
              {t('inventory.add')}
            </Button>
          ),
        }}
      />
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('inventory.add')} size="md">
        <div className="space-y-3">
          <Input label={t('inventory.col.item')} required value={form.name} onChange={set('name')} placeholder="Moy filtri" />
          <Select
            label={t('inventory.col.category')}
            value={form.category}
            onChange={set('category')}
            options={INVENTORY_CATEGORIES.map((c) => ({ value: c, label: t(INVENTORY_CATEGORY_LABEL_KEY[c]) }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('inventory.col.quantity')} type="number" min="0" value={form.quantity} onChange={set('quantity')} placeholder="0" />
            <Input label={t('inventory.col.minimum')} type="number" min="0" value={form.minimum} onChange={set('minimum')} placeholder="0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('inventory.col.purchasePrice')} type="number" min="0" value={form.purchasePrice} onChange={set('purchasePrice')} placeholder="0" />
            <Input label={t('inventory.col.sellingPrice')} type="number" min="0" value={form.sellingPrice} onChange={set('sellingPrice')} placeholder="0" />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setAddOpen(false)} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreate} loading={saving}>
            {t('common.save')}
          </Button>
        </div>
      </Modal>

      <Modal open={!!stockItem} onClose={() => setStockItem(null)} title={t('inventory.addStockTitle')} size="sm">
        <div className="mb-3 rounded-lg bg-surface-muted/60 p-3 text-sm">
          <p className="font-medium text-foreground">{stockItem?.name}</p>
          <p className="mt-0.5 text-xs text-muted">
            {t('inventory.col.quantity')}: {stockItem?.quantity} · {t('inventory.col.minimum')}: {stockItem?.minimum}
          </p>
        </div>
        <div className="space-y-3">
          <Input
            label={t('inventory.addStockQty')}
            type="number"
            min="1"
            required
            value={stockForm.quantity}
            onChange={(e) => setStockForm((f) => ({ ...f, quantity: e.target.value }))}
            placeholder="0"
          />
          <Input
            label={t('inventory.addStockNote')}
            value={stockForm.note}
            onChange={(e) => setStockForm((f) => ({ ...f, note: e.target.value }))}
            placeholder={t('common.optional')}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setStockItem(null)} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleStock} loading={saving}>
            {t('common.save')}
          </Button>
        </div>
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={t('inventory.edit')} size="md">
        <div className="space-y-3">
          <Input label={t('inventory.col.item')} required value={form.name} onChange={set('name')} />
          <Select
            label={t('inventory.col.category')}
            value={form.category}
            onChange={set('category')}
            options={INVENTORY_CATEGORIES.map((c) => ({ value: c, label: t(INVENTORY_CATEGORY_LABEL_KEY[c]) }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('inventory.col.minimum')} type="number" min="0" value={form.minimum} onChange={set('minimum')} placeholder="0" />
            <Input label={t('inventory.col.purchasePrice')} type="number" min="0" value={form.purchasePrice} onChange={set('purchasePrice')} placeholder="0" />
          </div>
          <Input label={t('inventory.col.sellingPrice')} type="number" min="0" value={form.sellingPrice} onChange={set('sellingPrice')} placeholder="0" />
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditItem(null)} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleEdit} loading={saving}>
            {t('common.save')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
