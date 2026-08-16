import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Topbar from './Topbar.jsx'
import Sidebar from './Sidebar.jsx'
import MobileDrawer from './MobileDrawer.jsx'
import GlobalSearch from './GlobalSearch.jsx'
import AiAssistant from '../components/ai/AiAssistant.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function RootLayout() {
  const { user, loading } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenSidebar={() => setDrawerOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
