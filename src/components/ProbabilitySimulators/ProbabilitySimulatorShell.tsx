import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import BinomialArcadeSimulator from "./BinomialSimulator"
import FishBiteExponentialSimulator from "./FishBiteExponentialSimulator"

type SimulatorType = "binomial" | "exponential"

type SimulatorTab = {
  id: SimulatorType
  label: string
  subtitle: string
}

const simulatorTabs: SimulatorTab[] = [
  {
    id: "binomial",
    label: "Binomial",
    subtitle: "Count successes",
  },
  {
    id: "exponential",
    label: "Exponential",
    subtitle: "Wait for fish bites",
  },
]

export default function ProbabilitySimulatorShell() {
  const [activeSimulator, setActiveSimulator] =
    useState<SimulatorType>("binomial")

  return (
    <section className="relative min-h-screen overflow-hidden rounded-[2rem] border border-slate-800 bg-[#101018] p-4 text-slate-100 shadow-2xl sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:18px_18px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(52,211,153,0.18),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(56,189,248,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.14),transparent_30%)]" />

      <div className="relative z-10 space-y-4">
        <Card className="sticky top-4 z-30 rounded-none border-2 border-slate-600 bg-slate-950/90 text-slate-100 shadow-[6px_6px_0_#020617] backdrop-blur">
          <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                Probability Simulator Lab
              </p>

              <h2 className="mt-1 font-mono text-2xl font-black tracking-[-0.05em] text-white">
                Distribution Arcade
              </h2>

              <p className="mt-1 font-mono text-xs text-slate-400">
                Choose a distribution simulator from the navbar.
              </p>
            </div>

            <nav className="grid gap-2 sm:grid-cols-2">
              {simulatorTabs.map((tab) => {
                const isActive = activeSimulator === tab.id

                return (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveSimulator(tab.id)}
                    className={[
                      "h-auto rounded-none border-2 p-3 text-left font-mono shadow-[3px_3px_0_#020617]",
                      isActive
                        ? tab.id === "binomial"
                          ? "border-emerald-200 bg-emerald-300 text-slate-950 hover:bg-emerald-200"
                          : "border-sky-200 bg-sky-300 text-slate-950 hover:bg-sky-200"
                        : "border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800",
                    ].join(" ")}
                  >
                    <span className="block text-sm font-black">
                      {tab.label}
                    </span>

                    <span className="block text-[0.65rem] font-bold opacity-80">
                      {tab.subtitle}
                    </span>
                  </Button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {activeSimulator === "binomial" && <BinomialArcadeSimulator />}
        {activeSimulator === "exponential" && <FishBiteExponentialSimulator />}
      </div>
    </section>
  )
}