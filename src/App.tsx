import { Navigate, Route, Routes } from "react-router"
import RootLayout from "@/layouts/RootLayout"
import Home from "@/pages/Home"
import Projects from "@/pages/Projects"
import About from "@/pages/About"
import Contact from "@/pages/Contact"

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App