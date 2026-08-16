import { storage } from '../utils/storage.js'
import { buildSeed } from '../data/mockData.js'

const KEY = 'data'
const VERSION = 1

let cache = null

export function loadState() {
  if (cache) return cache
  const saved = storage.get(KEY)
  if (saved && saved.version === VERSION && Array.isArray(saved.orders)) {
    cache = saved
  } else {
    cache = buildSeed()
    storage.set(KEY, cache)
  }
  return cache
}

export function saveState(next) {
  cache = next
  storage.set(KEY, next)
  return next
}

export function getState() {
  return loadState()
}

export function updateState(mutator) {
  const next = mutator(loadState())
  return saveState(next)
}

export function cloneState() {
  return structuredClone(loadState())
}

export function resetState() {
  cache = buildSeed()
  storage.set(KEY, cache)
  return cache
}

export const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms))
