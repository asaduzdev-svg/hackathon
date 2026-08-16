// Centralized fetch layer.
//   - All requests carry credentials so the JWT cookie is sent.
//   - On 401 (except for /auth/*) we try a single /auth/refresh and retry.
//   - Thrown errors carry `status` and a translated-friendly message.
const BASE = '/api'

let refreshPromise = null

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((r) => r.json().catch(() => ({})))
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

async function request(path, { method = 'GET', body, params } = {}) {
  let url = BASE + path
  if (params) {
    const qs = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') qs.set(key, value)
    }
    const str = qs.toString()
    if (str) url += `?${str}`
  }

  const init = {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }

  let res = await fetch(url, init)

  if (res.status === 401 && !path.startsWith('/auth')) {
    await refreshSession()
    res = await fetch(url, init)
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || 'So\'rovda xatolik yuz berdi')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}
