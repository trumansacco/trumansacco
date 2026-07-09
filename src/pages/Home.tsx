import { Link } from "react-router"
import { ArrowRight, BarChart3, Code2, LineChart, Sigma } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import RotatingAction from "@/components/RotatingAction"

const focusAreas = [
    {
        title: "Data Science",
        description: "Exploring data, patterns, dashboards, and practical insights.",
        icon: BarChart3,
        href: "/projects#data-science",
    },
    {
        title: "Actuarial Science",
        description: "Studying risk, probability, survival models, and financial math.",
        icon: LineChart,
        href: "/projects#actuarial-science",
    },
    {
        title: "Probability",
        description: "Using uncertainty, models, and mathematical reasoning to solve problems.",
        icon: Sigma,
        href: "/projects#probability",
    },
    {
        title: "Full-Stack Development",
        description: "Building clean frontend interfaces with backend functionality.",
        icon: Code2,
        href: "/projects#full-stack-development",
    },
]

function Home() {
    return (
        <section className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid items-center gap-12 md:grid-cols-[1.15fr_0.85fr]">
                <div>
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                        Personal Portfolio
                    </p>

                    <h2>
                        <RotatingAction />
                    </h2>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                        I’m interested in anything involving probability, mathematics, art, and full-stack programming. This
                        site showcases the projects, tools, and ideas I’ve built along the
                        way.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="rounded-2xl px-6 py-6 font-semibold">
                            <Link to="/projects">
                                View Projects
                                <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="rounded-2xl px-6 py-6 font-semibold"
                        >
                            <Link to="/contact">Contact Me</Link>
                        </Button>
                    </div>
                </div>

                <Card className="rounded-3xl shadow-xl">
                    <CardHeader>
                        <p className="text-sm font-medium text-muted-foreground">
                            What this site is about
                        </p>
                        <CardTitle className="text-3xl leading-tight">
                            A portfolio for technical projects, analytics, and problem-solving.
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            
                        </p>

                        <div className="rounded-2xl border border-border bg-muted/40 p-4">
                            <p className="text-sm font-medium text-foreground">
                                Current focus
                            </p>
                            <p className="mt-1 text-sm">
                                React, TypeScript, data analysis, actuarial models, probability,
                                backend logic, and portfolio-ready projects.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {focusAreas.map((area) => {
                    const Icon = area.icon

                    return (
                        <a key={area.title} href={area.href} className="group">
                            <Card className="h-full rounded-3xl transition group-hover:-translate-y-1 group-hover:shadow-lg">
                                <CardHeader>
                                    <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <Icon className="size-5" />
                                    </div>

                                    <CardTitle className="text-xl">{area.title}</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {area.description}
                                    </p>

                                    <p className="text-sm font-medium text-primary transition group-hover:translate-x-1">
                                        View related projects →
                                    </p>
                                </CardContent>
                            </Card>
                        </a>
                    )
                })}
            </div>
        </section>
    )
}

export default Home