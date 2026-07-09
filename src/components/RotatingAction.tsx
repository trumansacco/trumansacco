import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import "./RotatingAction.css"

const words = [
  "code",
  "calculate",
  "model",
  "predict",
  "analyze",
  "build",
  "design",
  "optimize",
  "visualize",
  "create",
]

function RotatingAction() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % words.length)
    }, 3400)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
        I can...
      </span>

      <span className="relative inline-block h-[stretch] w-[50%] overflow-hidden align-middle">
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            className="absolute left-0 top-0 text-5xl font-bold leading-tight tracking-tight md:text-6xl"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="animated-text-pattern">{words[index]}</span>
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  )
}

export default RotatingAction