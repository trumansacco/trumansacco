import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Analytics } from "@vercel/analytics/next"

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
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <Analytics />
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>React + TypeScript + Node on Vercel</CardTitle>
          <CardDescription>
            Your frontend, backend, Tailwind, and shadcn setup is working.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Backend response:</p>
          <p className="font-medium">{message}</p>

          <Button onClick={() => window.open("/api/hello", "_blank")}>
            Test API
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

export default App