import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function About() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          About
        </p>

        <h2 className="text-5xl font-bold tracking-tight">
          A little about me.
        </h2>

        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          I am building a portfolio that brings together my technical projects,
          analytics work, business experience, and future career goals in one
          clean place.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Technical Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              React, TypeScript, SQL, dashboards, backend routes, data analysis,
              and full-stack project structure.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Career Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              A place to explain your interests in analytics, software,
              healthcare, actuarial work, or whatever direction you want this
              site to represent.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default About