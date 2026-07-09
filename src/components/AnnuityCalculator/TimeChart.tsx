import React, { useMemo } from "react"
import type { PaymentSeries } from "./annuityTypes"

type TimeChartProps = {
  series: PaymentSeries[]
}

const formatAmount = (value: number, compact = false) => {
  if (!Number.isFinite(value)) return "0"

  if (compact) {
    return value.toLocaleString(undefined, {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    })
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })
}

const getDirectionLabel = (
  direction: PaymentSeries["valuationDirection"],
) => {
  return direction === "future" ? "AV / FV" : "PV"
}

const getIntervalLabel = ({
  direction,
  iLabel,
}: {
  direction: PaymentSeries["valuationDirection"]
  iLabel?: string
}) => {
  const safeILabel = iLabel?.trim()

  if (!safeILabel) return ""

  if (direction === "future") {
    return `i = ${safeILabel} →`
  }

  return `← i = ${safeILabel}`
}

function TimeChart({ series }: TimeChartProps) {
  const chart = useMemo(() => {
    const totalsByTime = new Map<number, number>()

    series.forEach((item) => {
      item.events.forEach((event) => {
        totalsByTime.set(
          event.time,
          (totalsByTime.get(event.time) ?? 0) + event.amount,
        )
      })
    })

    const totalEvents = Array.from(totalsByTime.entries())
      .map(([time, amount]) => ({
        time,
        amount,
      }))
      .sort((a, b) => a.time - b.time)

    const allEvents = [...series.flatMap((item) => item.events), ...totalEvents]

    const largestEventTime = allEvents.reduce((largest, event) => {
      return Math.max(largest, event.time)
    }, 0)

    const largestContinuousEnd = series.reduce((largest, item) => {
      return Math.max(largest, item.continuousEnd ?? 0)
    }, 0)

    const largestInfinityAfter = series.reduce((largest, item) => {
      return Math.max(largest, item.infinityAfter ?? 0)
    }, 0)

    const largestAmount = allEvents.reduce((largest, event) => {
      return Math.max(largest, Math.abs(event.amount))
    }, 1)

    const maxTime = Math.ceil(
      Math.max(1, largestEventTime, largestContinuousEnd, largestInfinityAfter),
    )

    const maxAmount = Math.max(1, largestAmount)
    const ticks = Array.from({ length: maxTime + 1 }, (_, index) => index)
    const intervals = Array.from({ length: maxTime }, (_, index) => index)

    return {
      maxTime,
      maxAmount,
      ticks,
      intervals,
      totalEvents,
    }
  }, [series])

  const getLeftPercent = (time: number) => {
    return `${(time / chart.maxTime) * 100}%`
  }

  if (!series.length) {
    return (
      <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
        Add an annuity and enter an <span className="font-mono">n</span> value
        to see the payment timeline.
      </div>
    )
  }

  const totalRows = series.length + 1

  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <div className="mb-3">
        <div className="text-sm font-semibold">Payment Timeline</div>
        <div className="text-xs text-muted-foreground">
          The first row shows the net total at each time. Each annuity row shows
          whether the value is moving toward present value or accumulated value.
          Perpetuities are shown through{" "}
          <span className="font-mono">t = 20</span> and then continue to
          infinity.
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div
          className="relative min-w-[860px]"
          style={{
            height: `${142 + totalRows * 98}px`,
          }}
        >
          <div className="absolute left-[8.5rem] right-4 top-14 h-px bg-border" />

          {chart.ticks.map((tick) => (
            <div
              key={tick}
              className="absolute top-[48px] flex -translate-x-1/2 flex-col items-center"
              style={{
                left: `calc(8.5rem + (${getLeftPercent(tick)} * 0.85))`,
              }}
            >
              <div className="h-4 w-px bg-border" />

              <div className="mt-1 text-[10px] text-muted-foreground">
                {tick}
              </div>
            </div>
          ))}

          <div className="absolute left-0 top-[45px] text-[10px] font-medium text-muted-foreground">
            time
          </div>

          <TimelineRow
            label="Total"
            rowTop={110}
            events={chart.totalEvents}
            maxAmount={chart.maxAmount}
            getLeftPercent={getLeftPercent}
          />

          {series.map((item, index) => {
            const rowTop = 110 + (index + 1) * 98
            const intervalLabel = getIntervalLabel({
              direction: item.valuationDirection,
              iLabel: item.iLabel,
            })

            return (
              <div key={item.tokenId}>
                <TimelineRow
                  label={item.label}
                  subLabel={getDirectionLabel(item.valuationDirection)}
                  rowTop={rowTop}
                  events={item.events}
                  maxAmount={chart.maxAmount}
                  getLeftPercent={getLeftPercent}
                  intervalLabels={
                    intervalLabel
                      ? chart.intervals.map((interval) => ({
                          interval,
                          label: intervalLabel,
                        }))
                      : []
                  }
                />

                {item.continuousStart !== undefined &&
                  item.continuousEnd !== undefined && (
                    <div
                      className="absolute rounded-full border border-border bg-card"
                      style={{
                        top: `${rowTop + 28}px`,
                        height: "28px",
                        left: `calc(8.5rem + (${getLeftPercent(
                          item.continuousStart,
                        )} * 0.85))`,
                        width: `calc(${
                          ((item.continuousEnd - item.continuousStart) /
                            chart.maxTime) *
                          85
                        }% - 0.25rem)`,
                      }}
                      title={`${item.label}: continuous payments of ${formatAmount(
                        item.amount,
                      )} from ${item.continuousStart} to ${
                        item.continuousEnd
                      }`}
                    >
                      <div className="flex h-full items-center justify-center text-[10px] font-medium">
                        {formatAmount(item.amount, true)}
                      </div>
                    </div>
                  )}

                {item.isPerpetuity && item.infinityAfter !== undefined && (
                  <div
                    className="absolute flex -translate-x-1/2 items-center gap-1 text-xs font-semibold"
                    style={{
                      left: `calc(8.5rem + (${getLeftPercent(
                        item.infinityAfter,
                      )} * 0.85))`,
                      top: `${rowTop + 30}px`,
                    }}
                    title={`${item.label}: continues forever after t = ${item.infinityAfter}`}
                  >
                    <span>...</span>
                    <span className="text-base leading-none">∞</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TimelineRow({
  label,
  subLabel,
  rowTop,
  events,
  maxAmount,
  getLeftPercent,
  intervalLabels = [],
}: {
  label: string
  subLabel?: string
  rowTop: number
  events: {
    time: number
    amount: number
  }[]
  maxAmount: number
  getLeftPercent: (time: number) => string
  intervalLabels?: {
    interval: number
    label: string
  }[]
}) {
  const axisTop = rowTop + 44

  return (
    <div>
      <div
        className="absolute left-0 w-32 pr-2 text-right"
        style={{
          top: `${axisTop - 14}px`,
        }}
        title={subLabel ? `${label}: ${subLabel}` : label}
      >
        <div className="truncate text-[10px] font-medium text-muted-foreground">
          {label}
        </div>

        {subLabel && (
          <div className="truncate text-[9px] text-muted-foreground/80">
            {subLabel}
          </div>
        )}
      </div>

      <div
        className="absolute left-[8.5rem] right-4 h-px bg-border/70"
        style={{
          top: `${axisTop}px`,
        }}
      />

      {intervalLabels.map((item) => (
        <div
          key={`${label}-${item.interval}`}
          className="absolute flex -translate-x-1/2 items-center whitespace-nowrap text-[9px] leading-none text-muted-foreground"
          style={{
            left: `calc(8.5rem + (${getLeftPercent(item.interval + 0.5)} * 0.85))`,
            top: `${axisTop - 27}px`,
          }}
          title={item.label}
        >
          {item.label}
        </div>
      ))}

      {events.map((event, index) => {
        const isPositive = event.amount >= 0
        const barHeight = Math.max(
          14,
          Math.round((Math.abs(event.amount) / maxAmount) * 46),
        )

        return (
          <div
            key={`${label}-${event.time}-${index}`}
            className="absolute flex -translate-x-1/2 flex-col items-center"
            style={{
              left: `calc(8.5rem + (${getLeftPercent(event.time)} * 0.85))`,
              top: isPositive ? `${axisTop - barHeight}px` : `${axisTop}px`,
            }}
            title={`${label}: ${formatAmount(event.amount)} at t = ${
              event.time
            }`}
          >
            {isPositive && (
              <div className="mb-1 text-[9px] font-medium">
                {formatAmount(event.amount, true)}
              </div>
            )}

            <div
              className="w-4 rounded-full border border-border bg-card"
              style={{
                height: `${barHeight}px`,
              }}
            />

            {!isPositive && (
              <div className="mt-1 text-[9px] font-medium">
                {formatAmount(event.amount, true)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default TimeChart