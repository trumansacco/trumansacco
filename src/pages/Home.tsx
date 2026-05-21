import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Home() {

  return (
    <section className="mx-auto grid min-h-[75vh] max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2">
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
      </Card>
    </section>
  )
}

export default Home