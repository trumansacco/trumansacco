import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import PowerBIProjectCard from "@/components/PowerBIProjectCard"
import ComponentProjectCard from "@/components/ComponentProjectCard"
import AnnuityCalculator from "@/components/AnnuityCalculator/AnnuityCalculator"
import ProbabilitySimulatorShell from "@/components/ProbabilitySimulators/ProbabilitySimulatorShell"

const projectSections = [
    {
        id: "data-science",
        eyebrow: "Data Science",
        title: "Data Science Projects",
        description:
            "Projects focused on collecting, cleaning, analyzing, and presenting data in a way that helps people understand patterns and make better decisions.",
        cards: [],
    },
    {
        id: "actuarial-science",
        eyebrow: "Actuarial Science",
        title: "Actuarial Science Projects",
        description:
            "Projects related to risk, life contingencies, survival models, present values, insurance calculations, and actuarial exam concepts.",
        cards: [
            {
                title: "Actuarial Calculator",
                subtitle: "TypeScript, formulas, logic",
                body:
                    "A calculator project that handles actuarial notation, survival probabilities, mortality assumptions, and step-by-step calculations.",
            },
            {
                title: "Risk Modeling Concepts",
                subtitle: "Mortality, survival, financial math",
                body:
                    "A place to showcase projects that explain or calculate risk using actuarial models and probability-based logic.",
            },
        ],
    },
    {
        id: "probability",
        eyebrow: "Probability",
        title: "Probability & Math Projects",
        description:
            "Projects that focus on uncertainty, expected value, distributions, simulations, formulas, and mathematical problem-solving.",
        cards: [
            {
                title: "Probability Simulations",
                subtitle: "Models, random variables, outcomes",
                body:
                    "Interactive tools that simulate probability concepts and make abstract ideas easier to visualize.",
            },
            {
                title: "Math Explanation Tools",
                subtitle: "Step-by-step logic",
                body:
                    "Projects that break calculations into clear steps, showing not just the answer, but how the result was reached.",
            },
        ],
    },
    {
        id: "full-stack-development",
        eyebrow: "Full-Stack Development",
        title: "Full-Stack Development Projects",
        description:
            "Projects that combine frontend design, backend routes, databases, APIs, authentication, deployment, and real app structure.",
        cards: [
            {
                title: "Portfolio Website",
                subtitle: "React, TypeScript, Vercel, GitHub",
                body:
                    "This website itself is a full-stack portfolio project using a React frontend, Vercel deployment, GitHub workflow, and backend API routes.",
            },
            {
                title: "Backend API Routes",
                subtitle: "Node, Vercel Functions, API design",
                body:
                    "A place to showcase backend functionality such as API endpoints, server-side logic, and integrations.",
            },
        ],
    },
]

function Projects() {
    return (
        <section className="mx-auto max-w-6xl px-6 py-16">
            <div className="width-full">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Projects
                </p>

                <h2 className="text-5xl font-bold tracking-tight">
                    Things I have built.
                </h2>

                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    A place to showcase things that I've made; including projects, tools, and interactive demos related to data science, actuarial science, probability, and full-stack development.
                </p>
            </div>

            <div className="mt-12 space-y-20">
                {projectSections.map((section) => (
                    <section key={section.id} id={section.id} className="scroll-mt-32">
                        <div className="max-w-3xl">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                                {section.eyebrow}
                            </p>

                            <h3 className="text-3xl font-bold tracking-tight md:text-4xl">
                                {section.title}
                            </h3>

                            <p className="mt-4 text-lg leading-8 text-muted-foreground">
                                {section.description}
                            </p>
                        </div>

                        <div className="mt-8 grid gap-6 md:grid-cols-2">

                            {
                            //
                            //
                            //
                            //
                            // INSERT DATA SCIENCE COMPONENTS BELOW
                            //
                            //
                            //
                            //
                            }

                            {section.id === "data-science" && (
                                <>
                                    <div className="md:col-span-2">
                                        <PowerBIProjectCard
                                            title="Cost of College in North Texas"
                                            description="An interactive Power BI dashboard comparing the cost of college across 100 colleges in North Texas. This project focuses on making tuition and college cost data easier to explore, compare, and understand."
                                            powerBiUrl="https://app.powerbi.com/view?r=eyJrIjoiZmY1NWUxZDYtYzU1Ni00MmNmLWI5NGUtOWJlZjFiMWRhNWVjIiwidCI6ImNhODU2YzQ5LTFkNTQtNGYzMS04ODEzLWFiMTJmZGNmZGQ1MSJ9"
                                            tags={[
                                                "Power BI",
                                                "Data Analytics",
                                                "Data Visualization",
                                                "Higher Education",
                                                "North Texas",
                                            ]}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <PowerBIProjectCard
                                            title="Tropical Plant Database Visualization"
                                            description="An interactive Power BI dashboard built from tropical.theferns.info, a free tropical plant database that was taken offline and archived. This project visualizes plant data in a cleaner, more explorable format."
                                            powerBiUrl="https://app.powerbi.com/view?r=eyJrIjoiM2E3ZDc5MDYtNDIzZi00NzgxLTlhNmItNjI5NDEyZDUxZDk0IiwidCI6ImNhODU2YzQ5LTFkNTQtNGYzMS04ODEzLWFiMTJmZGNmZGQ1MSJ9"
                                            tags={[
                                                "Power BI",
                                                "Data Visualization",
                                                "Database Archive",
                                                "Plant Data",
                                                "Tropical Plants",
                                            ]}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <PowerBIProjectCard
                                            title="Free Music Plugin Finder"
                                            description="An interactive Power BI dashboard that helps users discover free music plugins based on what they already have and what kind of tools they are looking for. This project focuses on making a large plugin list easier to filter, compare, and explore."
                                            powerBiUrl="https://app.powerbi.com/view?r=eyJrIjoiOWE1MDBmYzktZjgxZC00Yjk0LTljMGQtMWE1NzExMjk3Njg3IiwidCI6ImNhODU2YzQ5LTFkNTQtNGYzMS04ODEzLWFiMTJmZGNmZGQ1MSJ9"
                                            tags={[
                                                "Power BI",
                                                "Music Technology",
                                                "Data Visualization",
                                                "Free Plugins",
                                                "Filtering Tools",
                                            ]}
                                        />
                                    </div>

                                </>
                            )}

                            {
                            //
                            //
                            //
                            //
                            // INSERT ACTUARIAL SCIENCE COMPONENTS BELOW
                            //
                            //
                            //
                            //
                            }

                            {section.id === "actuarial-science" && (
                                <div className="md:col-span-2">
                                    <ComponentProjectCard
                                        title="Annuity Calculator"
                                        description="An interactive actuarial finance component that will eventually visualize annuity payments, interest accumulation, and time-based cash flows."
                                        component={<AnnuityCalculator />}
                                        tags={[
                                            "React",
                                            "TypeScript",
                                            "Tailwind",
                                            "Actuarial Science",
                                            "Financial Math",
                                        ]}
                                    />
                                </div>
                            )}

                            {section.id === "probability" && (
                                <div className="md:col-span-2">
                                    <ComponentProjectCard
                                        title="Binomial Distribution Simulator"
                                        description="Visualize various probability distributions"
                                        component={<ProbabilitySimulatorShell />}
                                        tags={[
                                            "React",
                                            "TypeScript",
                                            "Tailwind",
                                            "Actuarial Science",
                                            "Financial Math",
                                        ]}
                                    />
                                </div>
                            )}

                            {section.cards.map((card) => (
                                <Card key={card.title} className="rounded-3xl">
                                    <CardHeader>
                                        <CardTitle>{card.title}</CardTitle>
                                        <CardDescription>{card.subtitle}</CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="text-muted-foreground">{card.body}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </section>
    )
}

export default Projects