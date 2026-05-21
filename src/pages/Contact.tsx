import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Contact() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Contact
        </p>

        <h2 className="text-5xl font-bold tracking-tight">
          Let’s connect.
        </h2>

        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          This page can later become a real contact form, but for now it gives
          visitors a clean way to reach you.
        </p>
      </div>

      <Card className="mt-12 max-w-xl rounded-3xl">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">trumansacco@hotmail.com</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">GitHub</p>
            <p className="font-medium">@trumansacco</p>
          </div>

          <Button className="rounded-2xl">
            Send Message
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}

export default Contact