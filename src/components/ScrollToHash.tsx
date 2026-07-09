import { useEffect } from "react"
import { useLocation } from "react-router"

function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
      return
    }

    const id = location.hash.replace("#", "")

    const timeout = window.setTimeout(() => {
      const element = document.getElementById(id)

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [location.pathname, location.hash])

  return null
}

export default ScrollToHash