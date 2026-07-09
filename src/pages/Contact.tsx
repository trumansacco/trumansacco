import { Mail, Phone, ExternalLink, ArrowUpRight } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const contactLinks = [
  {
    label: "Email",
    value: "trumansacco@hotmail.com",
    href: "mailto:trumansacco@hotmail.com",
    icon: Mail,
  },
  {
    label: "Phone",
    value: "214-663-4410",
    href: "tel:2146634410",
    icon: Phone,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/truman-sacco-2641a5279",
    href: "https://www.linkedin.com/in/truman-sacco-2641a5279",
    icon: ExternalLink,
  },
]

function Contact() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-start">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Contact
          </p>

          <h2 className="text-5xl font-bold tracking-tight">
            Want to reach me?
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Whether it is about a project, opportunity, collaboration, or just
            connecting professionally, these are the best places to contact me.
          </p>
        </div>

        <Card className="rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl">Find me here.</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4">
            {contactLinks.map((item) => {
              const Icon = item.icon

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={
                    item.label === "LinkedIn" || item.label === "GitHub"
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    item.label === "LinkedIn" || item.label === "GitHub"
                      ? "noreferrer"
                      : undefined
                  }
                  className="group flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4 transition hover:bg-muted/60"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </div>

                  <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-foreground" />
                </a>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default Contact