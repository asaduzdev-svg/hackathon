import { motion } from 'framer-motion'
import { Rocket } from 'lucide-react'

export default function Home() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-16 text-center"
    >
      <Rocket size={48} className="text-violet-500" />
      <h1 className="m-0 text-4xl font-medium text-neutral-900 md:text-6xl dark:text-neutral-100">
        Get started
      </h1>
      <p className="max-w-lg text-neutral-500">
        Khakaton loyihasining bosh sahifasi. Sahifa va komponentlarni{' '}
        <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
          src/pages
        </code>{' '}
        va{' '}
        <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
          src/components
        </code>{' '}
        papkalariga qo'shing.
      </p>
    </motion.section>
  )
}
