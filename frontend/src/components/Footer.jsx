import { Link } from 'react-router-dom'
import { MessageCircle, Send } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'

const socials = [
  { href: 'https://github.com/', icon: FaGithub, label: 'GitHub' },
  { href: 'https://discord.com/', icon: MessageCircle, label: 'Discord' },
  { href: 'https://t.me/', icon: Send, label: 'Telegram' },
]

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-neutral-50 dark:border-gray-800 dark:bg-neutral-900">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-neutral-500 dark:text-neutral-400">
        <p>© {new Date().getFullYear()} Khakaton. Barcha huquqlar himoyalangan.</p>

        <div className="flex gap-4">
          <Link to="/about" className="no-underline hover:text-violet-500">
            Haqida
          </Link>
          <Link to="/contact" className="no-underline hover:text-violet-500">
            Aloqa
          </Link>
        </div>

        <div className="flex gap-2">
          {socials.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-violet-500 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
