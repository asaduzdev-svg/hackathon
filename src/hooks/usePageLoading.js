import { useEffect, useState } from 'react'

export function usePageLoading(deps = [], delay = 220) {
  const key = deps.join(',')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let mounted = true
    setLoading(true)
    const timer = setTimeout(() => {
      if (mounted) setLoading(false)
    }, delay)
    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [key, delay])
  return loading
}
