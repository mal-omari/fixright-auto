'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduced = useReducedMotion()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: reduced ? 0 : 0.3 } }}
        exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.2 } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
