import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

export default function About() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-16 text-center"
    >
      <Info size={40} className="text-violet-500" />
      <h1 className="m-0 text-3xl font-medium text-neutral-900 dark:text-neutral-100">
        Loyiha haqida
      </h1>
      <p className="max-w-lg text-neutral-500">
        Bu khakaton uchun yaratilgan loyiha. React, Vite, React Router, Tailwind,
        Lucide, Framer Motion va GSAP texnologiyalaridan foydalanadi.
      </p>
    </motion.section>
  )
}
