import { useLocation, useOutlet } from "react-router"
import { AnimatePresence, motion } from "motion/react"
import Navbar from "@/components/Navbar"

function RootLayout() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

export default RootLayout