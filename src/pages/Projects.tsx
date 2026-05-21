import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Projects() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Projects
        </p>

        <h2 className="text-5xl font-bold tracking-tight">
          Things I have built.
        </h2>

        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          A clean space to showcase apps, dashboards, calculators, database
          projects, and anything else you want recruiters or visitors to see.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>React, SQL, dashboards</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Showcase a dashboard project with KPIs, charts, filters, and
              reporting features.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Actuarial Calculator</CardTitle>
            <CardDescription>TypeScript, formulas, logic</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Highlight your actuarial calculation app and the technical logic
              behind it.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Portfolio Website</CardTitle>
            <CardDescription>React, Vercel, GitHub</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This website itself can be one of your featured full-stack
              projects.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default Projects