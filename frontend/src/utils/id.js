export function nextId(prefix, list = []) {
  const max = list.reduce((acc, item) => {
    const num = Number(String(item.id || '').replace(/^\D+/, ''))
    return Number.isFinite(num) && num > acc ? num : acc
  }, 0)
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}

let counter = 0
export function uid() {
  counter += 1
  return `${Date.now().toString(36)}-${counter.toString(36)}`
}
