import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function App() {
  const [message, setMessage] = useState("Loading backend...")

  useEffect(() => {
    async function fetchMessage() {
      try {
        const response = await fetch("/api/hello")
        const data = await response.json()

        setMessage(data.message)
      } catch {
        setMessage("Could not connect to backend")
      }
    }

    fetchMessage()
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Analytics />
      <SpeedInsights />
      <Navbar />

      <section
        id="home"
        className="mx-auto grid min-h-[75vh] max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2"
      >
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Personal Portfolio
          </p>

          <h2 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Building clean apps, dashboards, and full-stack projects.
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            This site will showcase your resume, technical projects, analytics
            work, and anything else you want to make public.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button className="rounded-2xl px-6 py-6 font-semibold">
              View Projects
            </Button>

            <Button
              variant="outline"
              className="rounded-2xl px-6 py-6 font-semibold"
            >
              Contact Me
            </Button>
          </div>
        </div>

        <Card className="rounded-3xl shadow-xl">
          <CardHeader>
            <CardDescription>Backend Status</CardDescription>
            <CardTitle>React + TypeScript + Node on Vercel</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">API response:</p>
            <p className="font-medium">{message}</p>
          </CardContent>
        </Card>
      </section>

      <section
        id="projects"
        className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3"
      >
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Add your apps, dashboards, calculators, and portfolio work here.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Highlight your experience, technical skills, and education.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Showcase data, dashboards, and business intelligence projects.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default App