import { motion } from 'framer-motion'
import { Mail, MapPin, Phone } from 'lucide-react'

const contacts = [
  { icon: Mail, label: 'info@example.com', href: 'mailto:info@example.com' },
  { icon: Phone, label: '+998 00 000 00 00', href: 'tel:+998000000000' },
  { icon: MapPin, label: "Toshkent, O'zbekiston", href: null },
]

export default function Contact() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-16 text-center"
    >
      <h1 className="m-0 text-3xl font-medium text-neutral-900 dark:text-neutral-100">
        Aloqa
      </h1>
      <p className="max-w-lg text-neutral-500">
        Biz bilan bog'lanish uchun quyidagi manzillardan foydalaning:
      </p>

      <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
        {contacts.map(({ icon: Icon, label, href }) =>
          href ? (
            <a
              key={label}
              href={href}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 p-3 text-neutral-900 no-underline transition-colors hover:border-violet-400 dark:border-neutral-700 dark:text-neutral-100"
            >
              <Icon size={20} className="text-violet-500" />
              {label}
            </a>
          ) : (
            <span
              key={label}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 p-3 text-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
            >
              <Icon size={20} className="text-violet-500" />
              {label}
            </span>
          ),
        )}
      </div>
    </motion.section>
  )
}
