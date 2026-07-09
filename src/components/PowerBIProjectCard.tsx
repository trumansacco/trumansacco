import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PowerBIProjectCardProps = {
  title: string
  description: string
  powerBiUrl: string
  tags?: string[]
}

function PowerBIProjectCard({
  title,
  description,
  powerBiUrl,
  tags = [],
}: PowerBIProjectCardProps) {
  return (
    <Card className="overflow-hidden rounded-3xl">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-2 leading-6">
              {description}
            </CardDescription>
          </div>

          <Button asChild variant="outline" className="rounded-2xl">
            <a href={powerBiUrl} target="_blank" rel="noreferrer">
              Open Dashboard
              <ExternalLink className="ml-2 size-4" />
            </a>
          </Button>
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

        <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
          <div className="aspect-video w-full">
            <iframe
              title={title}
              src={powerBiUrl}
              className="h-full w-full"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PowerBIProjectCard