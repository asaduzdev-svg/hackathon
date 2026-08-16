export const INVENTORY_STATUSES = ['in_stock', 'low_stock', 'out_of_stock']

export const INVENTORY_STATUS_LABEL_KEY = {
  in_stock: 'status.inventory.in_stock',
  low_stock: 'status.inventory.low_stock',
  out_of_stock: 'status.inventory.out_of_stock',
}

export const INVENTORY_STATUS_TONE = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger',
}

export function getStockStatus(quantity, minimum) {
  const qty = Number(quantity) || 0
  const min = Number(minimum) || 0
  if (qty <= 0) return 'out_of_stock'
  if (qty <= min) return 'low_stock'
  return 'in_stock'
}
