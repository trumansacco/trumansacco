import { useEffect, useMemo, useRef, useState } from "react"
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

const EXPONENTIAL_BIN_COUNT = 20

type ExponentialBinRow = {
  index: number
  start: number
  end: number
  midpoint: number
  count: number
  actualProbability: number
  theoreticalProbability: number
  difference: number
}

function generateExponentialWaitTime(rate: number) {
  const u = Math.random()
  return -Math.log(1 - u) / rate
}

function exponentialCdf(time: number, rate: number) {
  return 1 - Math.exp(-rate * time)
}

function exponentialBinProbability(start: number, end: number, rate: number) {
  return exponentialCdf(end, rate) - exponentialCdf(start, rate)
}

function formatPercent(probability: number) {
  const percent = probability * 100

  if (percent === 0) return "0%"

  const absolutePercent = Math.abs(percent)

  if (absolutePercent < 0.000001) {
    return `${percent.toExponential(4)}%`
  }

  return `${percent.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  })}%`
}

export default function FishBiteExponentialSimulator() {
  const [biteRate, setBiteRate] = useState(0.25)
  const [targetTime, setTargetTime] = useState(10)
  const [waitTimes, setWaitTimes] = useState<number[]>([])
  const [latestWaitTime, setLatestWaitTime] = useState<number | null>(null)
  const [showDataTable, setShowDataTable] = useState(false)
  const [selectedBinIndex, setSelectedBinIndex] = useState<number | null>(null)

  const [isFishing, setIsFishing] = useState(false)
  const [currentWaitTime, setCurrentWaitTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  const startTimestampRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const expectedWaitTime = 1 / biteRate
  const medianWaitTime = Math.log(2) / biteRate
  const targetProbability = exponentialCdf(targetTime, biteRate)

  const progressPercent =
    currentWaitTime === null
      ? 0
      : Math.min(100, (elapsedTime / currentWaitTime) * 100)

  const maxDisplayTime = useMemo(() => {
    const theoreticalCap = expectedWaitTime * 5
    const observedMax = waitTimes.length === 0 ? 0 : Math.max(...waitTimes)

    return Math.max(theoreticalCap, observedMax, targetTime, 10)
  }, [expectedWaitTime, waitTimes, targetTime])

  const binWidth = maxDisplayTime / EXPONENTIAL_BIN_COUNT

  const bins = useMemo<ExponentialBinRow[]>(() => {
    const counts = Array(EXPONENTIAL_BIN_COUNT).fill(0)

    for (const waitTime of waitTimes) {
      const rawIndex = Math.floor(waitTime / binWidth)
      const safeIndex = Math.min(
        EXPONENTIAL_BIN_COUNT - 1,
        Math.max(0, rawIndex)
      )

      counts[safeIndex] += 1
    }

    return counts.map((count, index) => {
      const start = index * binWidth
      const end =
        index === EXPONENTIAL_BIN_COUNT - 1
          ? maxDisplayTime
          : start + binWidth

      const midpoint = (start + end) / 2

      const actualProbability =
        waitTimes.length === 0 ? 0 : count / waitTimes.length

      const theoreticalProbability = exponentialBinProbability(
        start,
        end,
        biteRate
      )

      return {
        index,
        start,
        end,
        midpoint,
        count,
        actualProbability,
        theoreticalProbability,
        difference: actualProbability - theoreticalProbability,
      }
    })
  }, [waitTimes, binWidth, maxDisplayTime, biteRate])

  const selectedBin =
    selectedBinIndex === null ? null : bins[selectedBinIndex] ?? null

  const maxBinCount = Math.max(...bins.map((bin) => bin.count), 1)

  const maxTheoreticalProbability = Math.max(
    ...bins.map((bin) => bin.theoreticalProbability),
    0.01
  )

  const averageObservedWait = useMemo(() => {
    if (waitTimes.length === 0) return null

    const total = waitTimes.reduce((sum, time) => sum + time, 0)
    return total / waitTimes.length
  }, [waitTimes])

  function clearTimer() {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    startTimestampRef.current = null
  }

  function resetSimulation() {
    clearTimer()
    setIsFishing(false)
    setCurrentWaitTime(null)
    setElapsedTime(0)
    setWaitTimes([])
    setLatestWaitTime(null)
    setSelectedBinIndex(null)
  }

  function recordBite(waitTime: number) {
    setWaitTimes((previous) => [...previous, waitTime])
    setLatestWaitTime(waitTime)

    const binIndex = Math.min(
      EXPONENTIAL_BIN_COUNT - 1,
      Math.max(0, Math.floor(waitTime / binWidth))
    )

    setSelectedBinIndex(binIndex)
  }

  function startFishing() {
    if (isFishing) return

    clearTimer()

    const nextWaitTime = generateExponentialWaitTime(biteRate)

    setCurrentWaitTime(nextWaitTime)
    setElapsedTime(0)
    setIsFishing(true)
    setLatestWaitTime(null)

    startTimestampRef.current = performance.now()
  }

  function stopFishing() {
    clearTimer()
    setIsFishing(false)
    setCurrentWaitTime(null)
    setElapsedTime(0)
  }

  function runManyCasts(count: number) {
    if (isFishing) return

    const newWaitTimes = Array.from({ length: count }, () =>
      generateExponentialWaitTime(biteRate)
    )

    const latest = newWaitTimes[newWaitTimes.length - 1]

    setWaitTimes((previous) => [...previous, ...newWaitTimes])
    setLatestWaitTime(latest)

    const binIndex = Math.min(
      EXPONENTIAL_BIN_COUNT - 1,
      Math.max(0, Math.floor(latest / binWidth))
    )

    setSelectedBinIndex(binIndex)
  }

  function handleBiteRateChange(nextRate: number) {
    setBiteRate(nextRate)
    clearTimer()
    setIsFishing(false)
    setCurrentWaitTime(null)
    setElapsedTime(0)
    setWaitTimes([])
    setLatestWaitTime(null)
    setSelectedBinIndex(null)
  }

  function handleTargetTimeChange(nextTargetTime: number) {
    setTargetTime(nextTargetTime)
    clearTimer()
    setIsFishing(false)
    setCurrentWaitTime(null)
    setElapsedTime(0)
    setWaitTimes([])
    setLatestWaitTime(null)
    setSelectedBinIndex(null)
  }

  useEffect(() => {
    if (!isFishing || currentWaitTime === null) return

    function tick(now: number) {
      if (startTimestampRef.current === null || currentWaitTime === null) {
        return
      }

      const nextElapsed = (now - startTimestampRef.current) / 1000

      if (nextElapsed >= currentWaitTime) {
        setElapsedTime(currentWaitTime)
        recordBite(currentWaitTime)
        clearTimer()
        setIsFishing(false)
        setCurrentWaitTime(null)
        return
      }

      setElapsedTime(nextElapsed)
      animationFrameRef.current = requestAnimationFrame(tick)
    }

    animationFrameRef.current = requestAnimationFrame(tick)

    return () => {
      clearTimer()
    }
  }, [isFishing, currentWaitTime])

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 font-mono text-xs font-black uppercase tracking-[0.22em] text-sky-300">
            Exponential Distribution Simulator
          </p>

          <h1 className="font-mono text-3xl font-black tracking-[-0.06em] text-white sm:text-4xl lg:text-5xl">
            Pixel Fish Bite Timer
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
            Model how many seconds you wait until the next fish bites. Press
            start, wait in real time, and the simulator automatically reels when
            the bite happens.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="w-fit rounded-none border-2 border-sky-300 bg-sky-300 px-4 py-2 font-mono text-sm font-black text-slate-950 shadow-[4px_4px_0_#0c4a6e] hover:bg-sky-300">
            T ~ Exponential({biteRate.toFixed(2)})
          </Badge>

          <Badge className="w-fit rounded-none border-2 border-yellow-300 bg-yellow-300 px-4 py-2 font-mono text-sm font-black text-slate-950 shadow-[4px_4px_0_#713f12] hover:bg-yellow-300">
            E[T] = {expectedWaitTime.toFixed(2)} sec
          </Badge>
        </div>
      </div>

      <Card className="rounded-none border-2 border-slate-600 bg-slate-950/80 text-slate-100 shadow-[6px_6px_0_#020617]">
        <CardContent className="grid gap-5 p-4 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label className="font-mono text-sm font-black text-slate-200">
                Fish bite rate λ
              </label>

              <span className="font-mono text-2xl font-black text-sky-300">
                {biteRate.toFixed(2)} / sec
              </span>
            </div>

            <Slider
              min={0.05}
              max={2}
              step={0.05}
              value={[biteRate]}
              onValueChange={(value) => {
                handleBiteRateChange(value[0] ?? 0.25)
              }}
            />

            <div className="mt-1 flex justify-between font-mono text-[0.65rem] text-slate-500">
              <span>slow pond</span>
              <span>feeding frenzy</span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label className="font-mono text-sm font-black text-slate-200">
                Target wait time
              </label>

              <span className="font-mono text-2xl font-black text-yellow-300">
                {targetTime.toFixed(1)} sec
              </span>
            </div>

            <Slider
              min={1}
              max={30}
              step={0.5}
              value={[targetTime]}
              onValueChange={(value) => {
                handleTargetTimeChange(value[0] ?? 10)
              }}
            />

            <div className="mt-1 flex justify-between font-mono text-[0.65rem] text-slate-500">
              <span>impatient</span>
              <span>patient</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <Button
              onClick={isFishing ? stopFishing : startFishing}
              className={[
                "rounded-none border-2 font-mono font-black text-slate-950 shadow-[3px_3px_0_#0c4a6e]",
                isFishing
                  ? "border-red-200 bg-red-300 hover:bg-red-200"
                  : "border-sky-200 bg-sky-300 hover:bg-sky-200",
              ].join(" ")}
            >
              {isFishing ? "STOP" : "START"}
            </Button>

            <Button
              onClick={() => runManyCasts(100)}
              disabled={isFishing}
              className="rounded-none border-2 border-emerald-200 bg-emerald-300 font-mono font-black text-slate-950 shadow-[3px_3px_0_#064e3b] hover:bg-emerald-200"
            >
              +100
            </Button>

            <Button
              onClick={() => runManyCasts(1000)}
              disabled={isFishing}
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

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-none border-2 border-slate-600 bg-slate-950/80 text-slate-100 shadow-[6px_6px_0_#020617]">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="font-mono text-lg font-black">
                  Pixel Fishing Pond
                </CardTitle>

                <CardDescription className="font-mono text-xs text-slate-400">
                  The timer runs in real time until the fish bites.
                </CardDescription>
              </div>

              <Badge className="rounded-none bg-sky-300 font-mono font-black text-slate-950 hover:bg-sky-300">
                {isFishing
                  ? `${elapsedTime.toFixed(2)} sec`
                  : latestWaitTime === null
                    ? "NO BITE"
                    : `${latestWaitTime.toFixed(2)} sec`}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative min-h-[260px] overflow-hidden rounded-none border-2 border-slate-700 bg-slate-900/80 p-4 shadow-[4px_4px_0_#020617]">
              <div className="absolute inset-x-0 bottom-0 h-32 bg-sky-500/20" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-sky-400/20" />

              <div className="absolute left-8 top-8 h-8 w-24 border-b-4 border-slate-400">
                <div className="absolute right-0 top-0 h-24 w-1 bg-slate-400" />

                <div
                  className={[
                    "absolute right-[-10px] top-24 h-5 w-5 border-2 border-yellow-300 bg-yellow-300 shadow-[3px_3px_0_#713f12]",
                    isFishing
                      ? "animate-[bobberBounce_0.35s_steps(2,end)_infinite]"
                      : "",
                  ].join(" ")}
                />
              </div>

              <div
                className={[
                  "absolute bottom-12 left-1/2 grid h-20 w-32 -translate-x-1/2 place-items-center border-4 font-mono text-4xl font-black shadow-[6px_6px_0_#020617]",
                  isFishing
                    ? "animate-[fishSwim_0.5s_steps(2,end)_infinite] border-sky-200 bg-sky-300 text-slate-950"
                    : latestWaitTime === null
                      ? "border-slate-600 bg-slate-800 text-slate-500"
                      : latestWaitTime <= targetTime
                        ? "border-emerald-200 bg-emerald-400 text-emerald-950"
                        : "border-red-200 bg-red-400 text-red-950",
                ].join(" ")}
              >
                {isFishing
                  ? "🐟"
                  : latestWaitTime === null
                    ? "?"
                    : latestWaitTime <= targetTime
                      ? "🐠"
                      : "🐡"}
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <div className="mb-2 flex items-center justify-between font-mono text-[0.7rem] font-black text-slate-400">
                  <span>cast timer</span>
                  <span>
                    {isFishing && currentWaitTime !== null
                      ? `${elapsedTime.toFixed(2)} / ${currentWaitTime.toFixed(
                          2
                        )} sec`
                      : "ready"}
                  </span>
                </div>

                <div className="h-4 border-2 border-slate-700 bg-slate-950">
                  <div
                    className={[
                      "h-full transition-[width] duration-75",
                      isFishing ? "bg-sky-300" : "bg-slate-700",
                    ].join(" ")}
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <StatBox
                label="Latest"
                value={latestWaitTime === null ? "—" : latestWaitTime.toFixed(2)}
              />
              <StatBox label="Expected" value={expectedWaitTime.toFixed(2)} />
              <StatBox label="Median" value={medianWaitTime.toFixed(2)} />
              <StatBox label="Casts" value={waitTimes.length.toString()} />
              <StatBox
                label={`P(T≤${targetTime.toFixed(1)})`}
                value={formatPercent(targetProbability)}
              />
            </div>

            <SelectedFishBinDetails
              selectedBin={selectedBin}
              runCount={waitTimes.length}
              averageObservedWait={averageObservedWait}
            />
          </CardContent>
        </Card>

        <Card className="rounded-none border-2 border-slate-600 bg-slate-950/80 text-slate-100 shadow-[6px_6px_0_#020617]">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="font-mono text-lg font-black">
                  Bite Waiting-Time Distribution
                </CardTitle>

                <CardDescription className="font-mono text-xs text-slate-400">
                  Blue bars = simulated waits, yellow pixels = theoretical exponential model.
                </CardDescription>
              </div>

              <Badge className="rounded-none bg-yellow-300 font-mono font-black text-slate-950 hover:bg-yellow-300">
                λ={biteRate.toFixed(2)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-none border-2 border-slate-700 bg-slate-900/80 p-3">
              <div
                className="grid h-[360px] w-full items-end gap-[3px]"
                style={{
                  gridTemplateColumns: `repeat(${EXPONENTIAL_BIN_COUNT}, minmax(0, 1fr))`,
                }}
              >
                {bins.map((bin) => {
                  const simulatedHeight = (bin.count / maxBinCount) * 100

                  const theoreticalHeight =
                    (bin.theoreticalProbability / maxTheoreticalProbability) *
                    100

                  const isSelected = selectedBinIndex === bin.index

                  return (
                    <div
                      key={bin.index}
                      className="grid h-full min-w-0 cursor-pointer grid-rows-[1fr_auto] gap-1 text-center"
                      onMouseEnter={() => setSelectedBinIndex(bin.index)}
                      onClick={() => setSelectedBinIndex(bin.index)}
                    >
                      <div
                        className={[
                          "relative flex h-full items-end justify-center border bg-slate-950",
                          isSelected
                            ? "border-sky-300 ring-2 ring-sky-300 ring-offset-2 ring-offset-slate-950"
                            : "border-slate-800",
                        ].join(" ")}
                      >
                        <div
                          className="absolute left-1/2 z-10 h-2 w-2 -translate-x-1/2 translate-y-1/2 bg-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.9)]"
                          style={{
                            bottom: `${theoreticalHeight}%`,
                          }}
                        />

                        <div
                          className="w-full border-t-2 border-sky-100 bg-sky-400 transition-all duration-300"
                          style={{
                            height: `${simulatedHeight}%`,
                            minHeight: bin.count > 0 ? "4px" : "0px",
                          }}
                        />
                      </div>

                      <span className="h-3 truncate font-mono text-[0.5rem] font-black text-slate-500">
                        {bin.index % 4 === 0 ? bin.start.toFixed(1) : ""}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-3 rounded-none border-2 border-slate-700 bg-slate-900/80 p-3 font-mono text-xs leading-5 text-slate-300">
              The exponential distribution models{" "}
              <strong className="text-sky-300">
                waiting time until the next bite
              </strong>
              . Short waits are most common, but long waits can still happen.
            </div>
          </CardContent>
        </Card>
      </div>

      {showDataTable && (
        <Card className="rounded-none border-2 border-sky-300 bg-slate-950/90 text-slate-100 shadow-[6px_6px_0_#0c4a6e]">
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-lg font-black text-sky-300">
              Fish Bite Data Table
            </CardTitle>

            <CardDescription className="font-mono text-xs text-slate-400">
              Each row shows a waiting-time interval and compares actual
              simulated probability against theoretical exponential probability.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="max-h-[360px] overflow-auto rounded-none border-2 border-slate-700">
              <table className="w-full min-w-[900px] border-collapse font-mono text-xs">
                <thead className="sticky top-0 z-10 bg-slate-900 text-slate-200">
                  <tr>
                    <th className="border border-slate-700 p-3 text-left">
                      Time interval
                    </th>
                    <th className="border border-slate-700 p-3 text-right">
                      Count
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
                  </tr>
                </thead>

                <tbody>
                  {bins.map((bin) => (
                    <tr
                      key={bin.index}
                      className="bg-slate-950 hover:bg-slate-900"
                    >
                      <td className="border border-slate-800 p-3 font-black text-yellow-300">
                        {bin.start.toFixed(2)} to {bin.end.toFixed(2)} sec
                      </td>

                      <td className="border border-slate-800 p-3 text-right text-sky-300">
                        {bin.count}
                      </td>

                      <td className="border border-slate-800 p-3 text-right text-sky-300">
                        {formatPercent(bin.actualProbability)}
                      </td>

                      <td className="border border-slate-800 p-3 text-right text-yellow-300">
                        {formatPercent(bin.theoreticalProbability)}
                      </td>

                      <td
                        className={[
                          "border border-slate-800 p-3 text-right",
                          bin.difference >= 0
                            ? "text-emerald-300"
                            : "text-red-300",
                        ].join(" ")}
                      >
                        {formatPercent(bin.difference)}
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
        @keyframes bobberBounce {
          0% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(8px);
          }

          100% {
            transform: translateY(-2px);
          }
        }

        @keyframes fishSwim {
          0% {
            transform: translateX(-50%) translate(0, 0);
          }

          50% {
            transform: translateX(-50%) translate(-8px, 4px);
          }

          100% {
            transform: translateX(-50%) translate(8px, -4px);
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

type SelectedFishBinDetailsProps = {
  selectedBin: ExponentialBinRow | null
  runCount: number
  averageObservedWait: number | null
}

function SelectedFishBinDetails({
  selectedBin,
  runCount,
  averageObservedWait,
}: SelectedFishBinDetailsProps) {
  if (selectedBin === null || runCount === 0) {
    return (
      <div className="rounded-none border-2 border-slate-700 bg-slate-900/90 p-4 font-mono shadow-[3px_3px_0_#020617]">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
          Selected interval details
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Start fishing, then hover or click a graph bar to compare simulated
          bite waits against the theoretical exponential model.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-none border-2 border-sky-300 bg-slate-900/90 p-4 font-mono shadow-[4px_4px_0_#0c4a6e]">
      <div className="mb-3">
        <p className="text-xs font-black uppercase tracking-wider text-sky-300">
          Selected interval details
        </p>

        <h3 className="mt-1 text-lg font-black text-white">
          {selectedBin.start.toFixed(2)} to {selectedBin.end.toFixed(2)} seconds
        </h3>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <DetailItem label="Actual count" value={selectedBin.count.toString()} />

        <DetailItem
          label="Actual probability"
          value={formatPercent(selectedBin.actualProbability)}
        />

        <DetailItem
          label="Theoretical probability"
          value={formatPercent(selectedBin.theoreticalProbability)}
        />

        <DetailItem
          label="Difference"
          value={formatPercent(selectedBin.difference)}
          valueClassName={
            selectedBin.difference >= 0 ? "text-emerald-300" : "text-red-300"
          }
        />

        <DetailItem
          label="Average observed wait"
          value={
            averageObservedWait === null ? "—" : averageObservedWait.toFixed(2)
          }
        />

        <DetailItem label="Total casts" value={runCount.toString()} />
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