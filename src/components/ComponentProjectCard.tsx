import type { ReactNode } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ComponentProjectCardProps = {
  title: string
  description: string
  component: ReactNode
  projectUrl?: string
  buttonText?: string
  tags?: string[]
}

function ComponentProjectCard({
  title,
  description,
  component,
  projectUrl,
  buttonText = "Open Project",
  tags = [],
}: ComponentProjectCardProps) {
  return (
    <Card className="h-auto overflow-visible rounded-3xl">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-2 leading-6">
              {description}
            </CardDescription>
          </div>

          {projectUrl && (
            <Button asChild variant="outline" className="shrink-0 rounded-2xl">
              <a href={projectUrl} target="_blank" rel="noreferrer">
                {buttonText}
                <ExternalLink className="ml-2 size-4" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-muted/30">
          <div className="w-full">{component}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ComponentProjectCard