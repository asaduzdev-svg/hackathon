export const INVENTORY_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
}

export function getStockStatus(quantity, minimum) {
  const q = Number(quantity || 0)
  const m = Number(minimum || 0)
  if (q <= 0) return INVENTORY_STATUS.OUT_OF_STOCK
  if (q <= m) return INVENTORY_STATUS.LOW_STOCK
  return INVENTORY_STATUS.IN_STOCK
}

export function deriveInventoryStatus(item) {
  return getStockStatus(item.quantity, item.minimum)
}

export const INVENTORY_STATUS_TONE = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger',
}

export const INVENTORY_STATUS_LABEL_KEY = {
  in_stock: 'status.inventory.in_stock',
  low_stock: 'status.inventory.low_stock',
  out_of_stock: 'status.inventory.out_of_stock',
}

export const INVENTORY_CATEGORIES = [
  'filter',
  'oil',
  'brake',
  'suspension',
  'cooling',
  'body',
  'battery',
  'component',
  'accessory',
]

export const INVENTORY_CATEGORY_LABEL_KEY = {
  filter: 'inventory.category.filter',
  oil: 'inventory.category.oil',
  brake: 'inventory.category.brake',
  suspension: 'inventory.category.suspension',
  cooling: 'inventory.category.cooling',
  body: 'inventory.category.body',
  battery: 'inventory.category.battery',
  component: 'inventory.category.component',
  accessory: 'inventory.category.accessory',
}
