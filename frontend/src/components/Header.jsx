import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import { motion } from 'framer-motion'

const links = [
  { to: '/', label: 'Bosh sahifa' },
  { to: '/about', label: 'Haqida' },
  { to: '/contact', label: 'Aloqa' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-neutral-900/90"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 text-xl font-semibold text-neutral-900 no-underline dark:text-neutral-100"
        >
          <Rocket size={24} className="text-violet-500" />
          <span>Khakaton</span>
        </Link>
<button></button>
        <nav
          className={`flex flex-col gap-1 md:flex-row ${
            open ? 'flex' : 'hidden'
          } absolute left-0 right-0 top-full border-b border-gray-200 bg-white p-3 md:static md:flex md:border-0 md:bg-transparent md:p-0 dark:border-gray-800 dark:bg-neutral-900`}
        >
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-base no-underline transition-colors ${
                  isActive
                    ? 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 p-1.5 md:hidden"
        >
          <span className="h-0.5 w-6 rounded bg-neutral-900 dark:bg-neutral-100" />
          <span className="h-0.5 w-6 rounded bg-neutral-900 dark:bg-neutral-100" />
          <span className="h-0.5 w-6 rounded bg-neutral-900 dark:bg-neutral-100" />
        </button>
      </div>
    </motion.header>
  )
}
