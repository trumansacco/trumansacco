import React from "react"
import { InlineMath } from "react-katex"
import type { AnnuityKind, AnnuityToken } from "./annuityTypes"
import {
  findTokenStartIndex,
  getAdjacentTrailingAccumulationLatexAfterToken,
  getAdjacentTrailingDiscountPowerAfterToken,
  getPaymentPrefixBeforeToken,
  getReplacementEndAfterTrailingFactors,
} from "./annuityHelpers"

type PromptValueGetter = (id?: string) => string

export type InterestRateEquivalentItem = {
  key: string
  i: number
  d: number
  delta: number
  v: number
}

type FormulaEquivalentDropdownProps = {
  latex: string
  rateItems: InterestRateEquivalentItem[]
}

const cleanPromptValue = (value: string | undefined, fallback: string) => {
  const cleaned = (value ?? "").trim()

  return cleaned.length > 0 ? cleaned : fallback
}

const cleanNumericValue = (value: string | undefined) => {
  return (value ?? "")
    .replace(/\\,/g, "")
    .replace(/[{}()\s]/g, "")
    .replace(/−/g, "-")
}

const parseRate = (value: string | undefined) => {
  const cleaned = cleanNumericValue(value)
  const parsed = Number.parseFloat(cleaned)

  if (!Number.isFinite(parsed) || parsed <= -1) return null

  return parsed
}

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return "Error"

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 8,
  })
}

const formatPower = (value: number) => {
  if (Number.isInteger(value)) return String(value)

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 8,
  })
}

const wrap = (value: string) => {
  return `\\left(${value}\\right)`
}

const stripEmptyExponent = (value: string) => {
  return value.replace(/\^\{\}/g, "")
}

const findReplacementEndIndex = (
  expression: string,
  tokenEndIndex: number,
) => {
  let end = tokenEndIndex

  while (expression[end] === "}") {
    end += 1
  }

  return Math.min(expression.length, end)
}

const getFormulaForKind = ({
  kind,
  n,
  m,
  i,
}: {
  kind: AnnuityKind
  n: string
  m: string
  i: string
}) => {
  const v = "v"
  const d = "d"
  const delta = "\\delta"
  const onePlusI = `\\left(1+${i}\\right)`

  const aImmediate = `\\frac{1-${v}^{${n}}}{${i}}`
  const aDue = `\\frac{1-${v}^{${n}}}{${d}}`
  const sImmediate = `\\frac{${onePlusI}^{${n}}-1}{${i}}`
  const sDue = `\\frac{${onePlusI}^{${n}}-1}{${d}}`

  const increasingImmediate = `\\frac{${wrap(aDue)}-${n}${v}^{${n}}}{${i}}`
  const increasingDue = `\\frac{${wrap(aDue)}-${n}${v}^{${n}}}{${d}}`

  const increasingAccumulated = `\\frac{${wrap(sDue)}-${n}}{${i}}`
  const increasingAccumulatedDue = `\\frac{${wrap(sDue)}-${n}}{${d}}`

  const formulas: Record<AnnuityKind, string> = {
    immediate: aImmediate,
    due: aDue,
    continuous: `\\frac{1-${v}^{${n}}}{${delta}}`,

    deferredContinuous: `${v}^{${m}}\\frac{1-${v}^{${n}}}{${delta}}`,
    deferred: `${v}^{${m}}${wrap(aImmediate)}`,
    deferredDue: `${v}^{${m}}${wrap(aDue)}`,

    perpetuity: `\\frac{1}{${i}}`,
    perpetuityDue: `\\frac{1}{${d}}`,

    deferredPerpetuity: `${v}^{${m}}\\frac{1}{${i}}`,
    deferredPerpetuityDue: `${v}^{${m}}\\frac{1}{${d}}`,

    increasingImmediate,
    increasingDue,

    deferredIncreasingImmediate: `${v}^{${m}}${wrap(increasingImmediate)}`,
    deferredIncreasingDue: `${v}^{${m}}${wrap(increasingDue)}`,

    increasingPerpetuity: `\\frac{1+${i}}{${i}^{2}}`,
    increasingPerpetuityDue: `\\frac{${onePlusI}^{2}}{${i}^{2}}`,

    deferredIncreasingPerpetuity: `${v}^{${m}}\\frac{1+${i}}{${i}^{2}}`,
    deferredIncreasingPerpetuityDue: `${v}^{${m}}\\frac{${onePlusI}^{2}}{${i}^{2}}`,

    sImmediate,
    sDue,

    sDeferred: sImmediate,
    sDeferredDue: sDue,

    sContinuous: `\\frac{${onePlusI}^{${n}}-1}{${delta}}`,
    sDeferredContinuous: `\\frac{${onePlusI}^{${n}}-1}{${delta}}`,

    increasingAccumulated,
    sIncreasingDue: increasingAccumulatedDue,

    sDeferredIncreasingImmediate: increasingAccumulated,
    sDeferredIncreasingDue: increasingAccumulatedDue,
  }

  return formulas[kind]
}

const buildPrefixLatex = ({
  coefficient,
  discountPower,
  accumulationLatex,
  hasVariable,
}: {
  coefficient: number
  discountPower: number
  accumulationLatex: string
  hasVariable: boolean
}) => {
  const coefficientLatex =
    coefficient === 1
      ? hasVariable
        ? "x"
        : ""
      : hasVariable
        ? `${coefficient}x`
        : String(coefficient)

  const discountLatex =
    discountPower > 0
      ? discountPower === 1
        ? "v"
        : `v^{${formatPower(discountPower)}}`
      : ""

  return `${coefficientLatex}${discountLatex}${accumulationLatex}`
}

export const buildInterestRateEquivalentItems = ({
  tokens,
  getPromptValue,
}: {
  tokens: AnnuityToken[]
  getPromptValue: PromptValueGetter
}): InterestRateEquivalentItem[] => {
  const uniqueRates = new Map<string, InterestRateEquivalentItem>()

  tokens.forEach((token) => {
    const i = parseRate(getPromptValue(token.iPromptId))

    if (i === null) return

    const d = i / (1 + i)
    const delta = Math.log(1 + i)
    const v = 1 / (1 + i)
    const key = String(i)

    if (uniqueRates.has(key)) return

    uniqueRates.set(key, {
      key,
      i,
      d,
      delta,
      v,
    })
  })

  return Array.from(uniqueRates.values())
}

export const buildFormulaEquivalentLatex = ({
  expression,
  tokens,
  getPromptValue,
}: {
  expression: string
  tokens: AnnuityToken[]
  getPromptValue: PromptValueGetter
}) => {
  const cleanedExpression = stripEmptyExponent(expression)

  if (!cleanedExpression.trim()) return ""

  const replacements = tokens
    .map((token) => {
      const tokenStartIndex = findTokenStartIndex(cleanedExpression, token)

      if (tokenStartIndex === -1) return null

      const prefix = getPaymentPrefixBeforeToken(cleanedExpression, token)

      const replacementStartIndex = prefix.prefixStart
      const replacementEndIndex = findReplacementEndIndex(
        cleanedExpression,
        getReplacementEndAfterTrailingFactors(cleanedExpression, token),
      )

      const n = cleanPromptValue(getPromptValue(token.nPromptId), "n")
      const m = cleanPromptValue(getPromptValue(token.mPromptId), "m")
      const i = cleanPromptValue(getPromptValue(token.iPromptId), "i")

      const formula = wrap(
        getFormulaForKind({
          kind: token.kind,
          n,
          m,
          i,
        }),
      )

      const trailingDiscountPower = getAdjacentTrailingDiscountPowerAfterToken(
        cleanedExpression,
        token,
      )

      const trailingAccumulationLatex =
        getAdjacentTrailingAccumulationLatexAfterToken(cleanedExpression, token)

      const prefixLatex = buildPrefixLatex({
        coefficient: prefix.coefficient,
        discountPower: prefix.discountPower + trailingDiscountPower,
        accumulationLatex: `${prefix.accumulationLatex}${trailingAccumulationLatex}`,
        hasVariable: prefix.hasVariable,
      })

      return {
        start: replacementStartIndex,
        end: replacementEndIndex,
        latex: prefixLatex ? `${prefixLatex}\\!${formula}` : formula,
      }
    })
    .filter(
      (
        replacement,
      ): replacement is {
        start: number
        end: number
        latex: string
      } => replacement !== null,
    )
    .sort((a, b) => b.start - a.start)

  let equivalentExpression = cleanedExpression

  replacements.forEach((replacement) => {
    equivalentExpression =
      equivalentExpression.slice(0, replacement.start) +
      replacement.latex +
      equivalentExpression.slice(replacement.end)
  })

  return equivalentExpression
    .replace(/\\(?:,|;|:|!|quad|qquad)+(?=\\left)/g, "")
    .replace(/(\d)\s+(?=\\left)/g, "$1\\!")
    .replace(/(\})\s+(?=\\left)/g, "$1\\!")
    .replace(/(\))\s+(?=\\left)/g, "$1\\!")
}

function FormulaEquivalentDropdown({
  latex,
  rateItems,
}: FormulaEquivalentDropdownProps) {
  if (!latex.trim()) {
    return (
      <div className="rounded-2xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
        Add an annuity to see its formula equivalent.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-3">
      <div className="mb-3 text-sm font-semibold">Formula Equivalent</div>

      {rateItems.length > 0 && (
        <div className="mb-3 space-y-2 rounded-xl border border-border bg-background p-3">
          <div className="text-xs font-semibold text-muted-foreground">
            Calculated Interest Values
          </div>

          <div className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
            {rateItems.map((item, index) => (
              <React.Fragment key={item.key}>
                {rateItems.length > 1 && (
                  <div className="col-span-full text-xs font-medium text-muted-foreground">
                    Rate {index + 1}
                  </div>
                )}

                <div className="rounded-lg bg-muted/30 p-2">
                  <span className="font-mono">i</span> = {formatNumber(item.i)}
                </div>

                <div className="rounded-lg bg-muted/30 p-2">
                  <span className="font-mono">d</span> = {formatNumber(item.d)}
                </div>

                <div className="rounded-lg bg-muted/30 p-2">
                  <span className="font-mono">δ</span> ={" "}
                  {formatNumber(item.delta)}
                </div>

                <div className="rounded-lg bg-muted/30 p-2">
                  <span className="font-mono">v</span> = {formatNumber(item.v)}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-background p-3 text-base">
        <InlineMath math={latex} />
      </div>
    </div>
  )
}

export default FormulaEquivalentDropdown