import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

type EventResult = "success" | "failure" | null

type BinomialTableRow = {
  successCount: number
  count: number
  actualProbability: number
  theoreticalProbability: number
  difference: number
  absoluteDifference: number
  isCloseEnough: boolean
  status: "Close" | "Too high" | "Too low"
}

const MIN_EVENTS = 1
const MAX_EVENTS = 60
const DEFAULT_EVENTS = 20

function combination(n: number, r: number) {
  if (r < 0 || r > n) return 0

  let result = 1

  for (let i = 1; i <= r; i++) {
    result *= (n - r + i) / i
  }

  return result
}

function binomialProbability(n: number, k: number, p: number) {
  return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k)
}

export default function BinomialArcadeSimulator() {
  const [eventCount, setEventCount] = useState(DEFAULT_EVENTS)
  const [probability, setProbability] = useState(0.5)
  const [marginOfError, setMarginOfError] = useState(0.05)
  const [events, setEvents] = useState<EventResult[]>(
    Array(DEFAULT_EVENTS).fill(null)
  )
  const [isRunning, setIsRunning] = useState(false)
  const [trialResults, setTrialResults] = useState<number[]>([])
  const [latestSuccesses, setLatestSuccesses] = useState<number | null>(null)
  const [showDataTable, setShowDataTable] = useState(false)
  const [selectedSuccessCount, setSelectedSuccessCount] = useState<number | null>(
    null
  )

  const successes = events.filter((event) => event === "success").length
  const failures = events.filter((event) => event === "failure").length
  const expectedSuccesses = eventCount * probability

  const experimentalAverage = useMemo(() => {
    if (trialResults.length === 0) return null

    const total = trialResults.reduce((sum, value) => sum + value, 0)
    return total / trialResults.length
  }, [trialResults])

  const histogram = useMemo(() => {
    const counts = Array(eventCount + 1).fill(0)

    for (const result of trialResults) {
      if (result <= eventCount) {
        counts[result] += 1
      }
    }

    return counts
  }, [trialResults, eventCount])

  const maxHistogramCount = Math.max(...histogram, 1)

  const theoreticalDistribution = useMemo(() => {
    return Array.from({ length: eventCount + 1 }, (_, k) => {
      return binomialProbability(eventCount, k, probability)
    })
  }, [eventCount, probability])

  const maxTheoreticalProbability = Math.max(...theoreticalDistribution, 0.01)

  const tableRows = useMemo<BinomialTableRow[]>(() => {
    return histogram.map((count, successCount) => {
      const actualProbability =
        trialResults.length === 0 ? 0 : count / trialResults.length

      const theoreticalProbability = theoreticalDistribution[successCount] ?? 0
      const difference = actualProbability - theoreticalProbability
      const absoluteDifference = Math.abs(difference)
      const isCloseEnough = absoluteDifference <= marginOfError

      let status: "Close" | "Too high" | "Too low" = "Close"

      if (!isCloseEnough && difference > 0) {
        status = "Too high"
      }

      if (!isCloseEnough && difference < 0) {
        status = "Too low"
      }

      return {
        successCount,
        count,
        actualProbability,
        theoreticalProbability,
        difference,
        absoluteDifference,
        isCloseEnough,
        status,
      }
    })
  }, [histogram, theoreticalDistribution, trialResults.length, marginOfError])

  const selectedRow =
    selectedSuccessCount === null ? null : tableRows[selectedSuccessCount] ?? null

  const closeEnoughCount = tableRows.filter((row) => row.isCloseEnough).length

  const closeEnoughPercent =
    tableRows.length === 0 ? 0 : (closeEnoughCount / tableRows.length) * 100

  function updateEventCount(nextCount: number) {
    if (isRunning) return

    const safeCount = Math.max(MIN_EVENTS, Math.min(MAX_EVENTS, nextCount))

    setEventCount(safeCount)
    setEvents(Array(safeCount).fill(null))
    setTrialResults([])
    setLatestSuccesses(null)
    setSelectedSuccessCount(null)
  }

  function generateSingleTrial() {
    const nextResults: EventResult[] = Array.from({ length: eventCount }, () => {
      return Math.random() < probability ? "success" : "failure"
    })

    const successCount = nextResults.filter(
      (result) => result === "success"
    ).length

    return {
      nextResults,
      successCount,
    }
  }

  function runSimulation() {
    if (isRunning) return

    setIsRunning(true)
    setLatestSuccesses(null)
    setEvents(Array(eventCount).fill(null))

    const { nextResults, successCount } = generateSingleTrial()

    nextResults.forEach((result, index) => {
      window.setTimeout(() => {
        setEvents((previousEvents) => {
          const updatedEvents = [...previousEvents]
          updatedEvents[index] = result
          return updatedEvents
        })
      }, index * 35)
    })

    window.setTimeout(() => {
      setLatestSuccesses(successCount)
      setTrialResults((previousResults) => [...previousResults, successCount])
      setSelectedSuccessCount(successCount)
      setIsRunning(false)
    }, eventCount * 35 + 300)
  }

  function runManySimulations(count: number) {
    if (isRunning) return

    const newResults = Array.from({ length: count }, () => {
      let successCount = 0

      for (let i = 0; i < eventCount; i++) {
        if (Math.random() < probability) {
          successCount += 1
        }
      }

      return successCount
    })

    const latestResult = newResults[newResults.length - 1]

    setTrialResults((previousResults) => [...previousResults, ...newResults])
    setLatestSuccesses(latestResult)
    setSelectedSuccessCount(latestResult)
  }

  function resetSimulation() {
    setEvents(Array(eventCount).fill(null))
    setTrialResults([])
    setLatestSuccesses(null)
    setIsRunning(false)
    setSelectedSuccessCount(null)
  }

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 font-mono text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
            Binomial Distribution Simulator
          </p>

          <h1 className="font-mono text-3xl font-black tracking-[-0.06em] text-white sm:text-4xl lg:text-5xl">
            Arcade Probability Machine
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
            Choose the number of pixel events, probability of success, and margin
            of error. Then see whether the simulated data is close enough to the
            theoretical binomial model.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="w-fit rounded-none border-2 border-emerald-300 bg-emerald-300 px-4 py-2 font-mono text-sm font-black text-slate-950 shadow-[4px_4px_0_#064e3b] hover:bg-emerald-300">
            X ~ Binomial({eventCount}, {probability.toFixed(2)})
          </Badge>

          <Badge className="w-fit rounded-none border-2 border-yellow-300 bg-yellow-300 px-4 py-2 font-mono text-sm font-black text-slate-950 shadow-[4px_4px_0_#713f12] hover:bg-yellow-300">
            ±{(marginOfError * 100).toFixed(1)}% MOE
          </Badge>
        </div>
      </div>

      <Card className="relative overflow-hidden rounded-none border-2 border-slate-600 bg-slate-950/80 text-slate-100 shadow-[6px_6px_0_#020617]">
        <CardContent className="grid gap-5 p-4 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label className="font-mono text-sm font-black text-slate-200">
                Events / coins
              </label>

              <span className="font-mono text-2xl font-black text-sky-300">
                {eventCount}
              </span>
            </div>

            <Slider
              min={MIN_EVENTS}
              max={MAX_EVENTS}
              step={1}
              value={[eventCount]}
              disabled={isRunning}
              onValueChange={(value) =>
                updateEventCount(value[0] ?? DEFAULT_EVENTS)
              }
            />

            <div className="mt-1 flex justify-between font-mono text-[0.65rem] text-slate-500">
              <span>{MIN_EVENTS}</span>
              <span>{MAX_EVENTS}</span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label className="font-mono text-sm font-black text-slate-200">
                Success probability
              </label>

              <span className="font-mono text-2xl font-black text-emerald-300">
                {Math.round(probability * 100)}%
              </span>
            </div>

            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[probability]}
              disabled={isRunning}
              onValueChange={(value) => setProbability(value[0] ?? 0)}
            />

            <div className="mt-1 flex justify-between font-mono text-[0.65rem] text-slate-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label className="font-mono text-sm font-black text-slate-200">
                Margin of error
              </label>

              <span className="font-mono text-2xl font-black text-yellow-300">
                ±{(marginOfError * 100).toFixed(1)}%
              </span>
            </div>

            <Slider
              min={0}
              max={0.25}
              step={0.005}
              value={[marginOfError]}
              onValueChange={(value) => setMarginOfError(value[0] ?? 0)}
            />

            <div className="mt-1 flex justify-between font-mono text-[0.65rem] text-slate-500">
              <span>0%</span>
              <span>12.5%</span>
              <span>25%</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <Button
              onClick={runSimulation}
              disabled={isRunning}
              className="rounded-none border-2 border-emerald-200 bg-emerald-300 font-mono font-black text-slate-950 shadow-[3px_3px_0_#064e3b] hover:bg-emerald-200"
            >
              {isRunning ? "RUNNING..." : "RUN 1"}
            </Button>

            <Button
              onClick={() => runManySimulations(100)}
              disabled={isRunning}
              className="rounded-none border-2 border-sky-200 bg-sky-300 font-mono font-black text-slate-950 shadow-[3px_3px_0_#0c4a6e] hover:bg-sky-200"
            >
              +100
            </Button>

            <Button
              onClick={() => runManySimulations(1000)}
              disabled={isRunning}
              className="rounded-none border-2 border-purple-200 bg-purple-300 font-mono font-black text-slate-950 shadow-[3px_3px_0_#581c87] hover:bg-purple-200"
            >
              +1000
            </Button>

            <Button
              onClick={() => setShowDataTable((current) => !current)}
              variant="ghost"
              className="rounded-none border-2 border-yellow-300 font-mono font-black text-yellow-200 hover:bg-yellow-300 hover:text-slate-950"
            >
              {showDataTable ? "HIDE DATA" : "SHOW DATA"}
            </Button>

            <Button
              onClick={resetSimulation}
              variant="ghost"
              className="rounded-none border-2 border-slate-500 font-mono font-black text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              RESET
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-none border-2 border-slate-600 bg-slate-950/80 text-slate-100 shadow-[6px_6px_0_#020617]">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="font-mono text-lg font-black">
                  Pixel Event Board
                </CardTitle>

                <CardDescription className="font-mono text-xs text-slate-400">
                  Green = success, red = failure, gray = not flipped yet
                </CardDescription>
              </div>

              <Badge className="rounded-none bg-sky-300 font-mono font-black text-slate-950 hover:bg-sky-300">
                {latestSuccesses === null
                  ? "NO RUN"
                  : `${latestSuccesses}/${eventCount}`}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div
              className="grid max-h-[360px] min-h-[220px] content-start gap-2 overflow-y-auto rounded-none border-2 border-slate-700 bg-slate-900/80 p-3"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(34px, 1fr))",
              }}
            >
              {events.map((result, index) => {
                const isWaiting = isRunning && result === null

                return (
                  <div
                    key={index}
                    className={[
                      "relative aspect-square min-h-[34px] border-2 font-mono text-xs font-black transition-all duration-200",
                      "flex items-center justify-center",
                      "shadow-[3px_3px_0_rgba(0,0,0,0.45)]",
                      result === "success"
                        ? "border-emerald-200 bg-emerald-400 text-emerald-950"
                        : "",
                      result === "failure"
                        ? "border-red-200 bg-red-400 text-red-950"
                        : "",
                      result === null
                        ? "border-slate-600 bg-slate-800 text-slate-500"
                        : "",
                      isWaiting
                        ? "animate-[pixelBlink_0.28s_steps(2,end)_infinite]"
                        : "",
                    ].join(" ")}
                    style={{
                      animationDelay: `${index * 0.03}s`,
                    }}
                  >
                    {result === "success"
                      ? "1"
                      : result === "failure"
                        ? "0"
                        : "?"}
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <StatBox label="Success" value={successes.toString()} />
              <StatBox label="Failure" value={failures.toString()} />
              <StatBox label="Expected" value={expectedSuccesses.toFixed(1)} />
              <StatBox label="Trials" value={trialResults.length.toString()} />
              <StatBox
                label="Avg"
                value={
                  experimentalAverage === null
                    ? "—"
                    : experimentalAverage.toFixed(1)
                }
              />
            </div>

            <SelectedProbabilityBox
              selectedRow={selectedRow}
              marginOfError={marginOfError}
              trialCount={trialResults.length}
            />
          </CardContent>
        </Card>

        <Card className="rounded-none border-2 border-slate-600 bg-slate-950/80 text-slate-100 shadow-[6px_6px_0_#020617]">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="font-mono text-lg font-black">
                  Result Distribution
                </CardTitle>

                <CardDescription className="font-mono text-xs text-slate-400">
                  Hover or click a bar to inspect actual vs theoretical probability.
                </CardDescription>
              </div>

              <Badge
                className={[
                  "rounded-none font-mono font-black text-slate-950 hover:bg-emerald-300",
                  trialResults.length === 0
                    ? "bg-slate-300"
                    : closeEnoughPercent >= 75
                      ? "bg-emerald-300"
                      : closeEnoughPercent >= 50
                        ? "bg-yellow-300"
                        : "bg-red-300",
                ].join(" ")}
              >
                {trialResults.length === 0
                  ? "NO DATA"
                  : `${closeEnoughPercent.toFixed(0)}% CLOSE`}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-visible rounded-none border-2 border-slate-700 bg-slate-900/80 p-3">
              <div
                className="grid h-[360px] w-full items-end gap-[2px]"
                style={{
                  gridTemplateColumns: `repeat(${eventCount + 1}, minmax(0, 1fr))`,
                }}
              >
                {histogram.map((count, successCount) => {
                  const actualProbability =
                    trialResults.length === 0 ? 0 : count / trialResults.length

                  const theoreticalProbability =
                    theoreticalDistribution[successCount] ?? 0

                  const difference = actualProbability - theoreticalProbability
                  const absoluteDifference = Math.abs(difference)
                  const isCloseEnough = absoluteDifference <= marginOfError
                  const experimentalHeight = (count / maxHistogramCount) * 100

                  const theoreticalHeight =
                    (theoreticalProbability / maxTheoreticalProbability) * 100

                  const isSelected = selectedSuccessCount === successCount

                  return (
                    <div
                      key={successCount}
                      className="grid h-full min-w-0 cursor-pointer grid-rows-[1fr_auto] gap-1 text-center"
                      onMouseEnter={() => setSelectedSuccessCount(successCount)}
                      onClick={() => setSelectedSuccessCount(successCount)}
                    >
                      <div
                        className={[
                          "relative flex h-full items-end justify-center border bg-slate-950",
                          isSelected
                            ? "ring-2 ring-sky-300 ring-offset-2 ring-offset-slate-950"
                            : "",
                          trialResults.length === 0
                            ? "border-slate-800"
                            : isCloseEnough
                              ? "border-emerald-300"
                              : difference > 0
                                ? "border-red-300"
                                : "border-yellow-300",
                        ].join(" ")}
                      >
                        <div
                          className="absolute left-1/2 z-10 h-2 w-2 -translate-x-1/2 translate-y-1/2 bg-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.9)]"
                          style={{
                            bottom: `${theoreticalHeight}%`,
                          }}
                        />

                        <div
                          className={[
                            "w-full border-t-2 transition-all duration-300",
                            trialResults.length === 0
                              ? "border-slate-600 bg-slate-700"
                              : isCloseEnough
                                ? "border-emerald-100 bg-emerald-400"
                                : difference > 0
                                  ? "border-red-100 bg-red-400"
                                  : "border-yellow-100 bg-yellow-400",
                          ].join(" ")}
                          style={{
                            height: `${experimentalHeight}%`,
                            minHeight: count > 0 ? "4px" : "0px",
                          }}
                        />
                      </div>

                      <span className="h-3 truncate font-mono text-[0.5rem] font-black text-slate-500">
                        {eventCount <= 30 || successCount % 5 === 0
                          ? successCount
                          : ""}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-3 rounded-none border-2 border-slate-700 bg-slate-900/80 p-3 font-mono text-xs leading-5 text-slate-300">
              A result is considered{" "}
              <strong className="text-emerald-300">close enough</strong> when
              the actual probability is within{" "}
              <strong className="text-yellow-300">
                ±{(marginOfError * 100).toFixed(1)}%
              </strong>{" "}
              of the theoretical probability.
            </div>
          </CardContent>
        </Card>
      </div>

      {showDataTable && (
        <Card className="rounded-none border-2 border-yellow-300 bg-slate-950/90 text-slate-100 shadow-[6px_6px_0_#713f12]">
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-lg font-black text-yellow-300">
              Real Data Table
            </CardTitle>

            <CardDescription className="font-mono text-xs text-slate-400">
              Each row shows one possible value of k, where k is the number of
              successes out of {eventCount} events.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="max-h-[360px] overflow-auto rounded-none border-2 border-slate-700">
              <table className="w-full min-w-[900px] border-collapse font-mono text-xs">
                <thead className="sticky top-0 z-10 bg-slate-900 text-slate-200">
                  <tr>
                    <th className="border border-slate-700 p-3 text-left">
                      k successes
                    </th>
                    <th className="border border-slate-700 p-3 text-right">
                      Actual count
                    </th>
                    <th className="border border-slate-700 p-3 text-right">
                      Actual probability
                    </th>
                    <th className="border border-slate-700 p-3 text-right">
                      Theoretical probability
                    </th>
                    <th className="border border-slate-700 p-3 text-right">
                      Difference
                    </th>
                    <th className="border border-slate-700 p-3 text-right">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tableRows.map((row) => (
                    <tr
                      key={row.successCount}
                      className="bg-slate-950 hover:bg-slate-900"
                    >
                      <td className="border border-slate-800 p-3 font-black text-yellow-300">
                        {row.successCount}
                      </td>

                      <td className="border border-slate-800 p-3 text-right text-sky-300">
                        {row.count}
                      </td>

                      <td className="border border-slate-800 p-3 text-right text-sky-300">
                        {(row.actualProbability * 100).toFixed(3)}%
                      </td>

                      <td className="border border-slate-800 p-3 text-right text-yellow-300">
                        {(row.theoreticalProbability * 100).toFixed(3)}%
                      </td>

                      <td
                        className={[
                          "border border-slate-800 p-3 text-right",
                          row.isCloseEnough
                            ? "text-emerald-300"
                            : row.difference >= 0
                              ? "text-red-300"
                              : "text-yellow-300",
                        ].join(" ")}
                      >
                        {(row.difference * 100).toFixed(3)}%
                      </td>

                      <td
                        className={[
                          "border border-slate-800 p-3 text-right font-black",
                          row.isCloseEnough
                            ? "text-emerald-300"
                            : row.status === "Too high"
                              ? "text-red-300"
                              : "text-yellow-300",
                        ].join(" ")}
                      >
                        {row.isCloseEnough ? "Close enough" : row.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <style>{`
        @keyframes pixelBlink {
          0% {
            transform: translate(0, 0);
            opacity: 0.55;
          }

          50% {
            transform: translate(-1px, 1px);
            opacity: 1;
          }

          100% {
            transform: translate(1px, -1px);
            opacity: 0.55;
          }
        }
      `}</style>
    </>
  )
}

type StatBoxProps = {
  label: string
  value: string
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="rounded-none border-2 border-slate-700 bg-slate-900 p-3 shadow-[3px_3px_0_#020617]">
      <p className="font-mono text-[0.65rem] font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-mono text-xl font-black text-white">{value}</p>
    </div>
  )
}

type SelectedProbabilityBoxProps = {
  selectedRow: BinomialTableRow | null
  marginOfError: number
  trialCount: number
}

function SelectedProbabilityBox({
  selectedRow,
  marginOfError,
  trialCount,
}: SelectedProbabilityBoxProps) {
  if (selectedRow === null || trialCount === 0) {
    return (
      <div className="rounded-none border-2 border-slate-700 bg-slate-900/90 p-4 font-mono shadow-[3px_3px_0_#020617]">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
          Selected probability details
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Run the simulator, then hover or click a bar in the distribution graph
          to compare actual probability against theoretical probability.
        </p>
      </div>
    )
  }

  const statusColor = selectedRow.isCloseEnough
    ? "text-emerald-300"
    : selectedRow.difference > 0
      ? "text-red-300"
      : "text-yellow-300"

  return (
    <div className="rounded-none border-2 border-yellow-300 bg-slate-900/90 p-4 font-mono shadow-[4px_4px_0_#713f12]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-yellow-300">
            Selected probability details
          </p>

          <h3 className="mt-1 text-lg font-black text-white">
            k = {selectedRow.successCount} successes
          </h3>
        </div>

        <Badge
          className={[
            "rounded-none font-mono font-black text-slate-950",
            selectedRow.isCloseEnough
              ? "bg-emerald-300 hover:bg-emerald-300"
              : selectedRow.difference > 0
                ? "bg-red-300 hover:bg-red-300"
                : "bg-yellow-300 hover:bg-yellow-300",
          ].join(" ")}
        >
          {selectedRow.isCloseEnough ? "Close enough" : selectedRow.status}
        </Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <DetailItem label="Actual count" value={selectedRow.count.toString()} />
        <DetailItem
          label="Actual probability"
          value={`${(selectedRow.actualProbability * 100).toFixed(2)}%`}
        />
        <DetailItem
          label="Theoretical probability"
          value={`${(selectedRow.theoreticalProbability * 100).toFixed(2)}%`}
        />
        <DetailItem
          label="Difference"
          value={`${(selectedRow.difference * 100).toFixed(2)}%`}
          valueClassName={statusColor}
        />
        <DetailItem
          label="Absolute difference"
          value={`${(selectedRow.absoluteDifference * 100).toFixed(2)}%`}
        />
        <DetailItem
          label="Margin allowed"
          value={`±${(marginOfError * 100).toFixed(2)}%`}
          valueClassName="text-emerald-300"
        />
      </div>
    </div>
  )
}

type DetailItemProps = {
  label: string
  value: string
  valueClassName?: string
}

function DetailItem({ label, value, valueClassName }: DetailItemProps) {
  return (
    <div className="border border-slate-700 bg-slate-950 p-3">
      <p className="text-[0.65rem] font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-sm font-black text-slate-100",
          valueClassName,
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  )
}