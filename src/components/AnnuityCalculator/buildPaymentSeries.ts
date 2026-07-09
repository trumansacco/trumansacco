import type { AnnuityKind, AnnuityToken, PaymentSeries } from "./annuityTypes"
import {
  getAdjacentTrailingDiscountPowerAfterToken,
  getPaymentPrefixBeforeToken,
  isDeferredKind,
  isDueKind,
  isPerpetuityKind,
  kindLabel,
  parsePositiveInteger,
} from "./annuityHelpers"

type PromptValueGetter = (id?: string) => string

type BuildPaymentSeriesOptions = {
  expression: string
  tokens: AnnuityToken[]
  getPromptValue: PromptValueGetter
}

const cleanDisplayValue = (value: string | undefined) => {
  const cleaned = (value ?? "")
    .replace(/\\,/g, "")
    .replace(/[{}]/g, "")
    .trim()

  return cleaned
}

const getValuationDirection = (
  kind: AnnuityKind,
): PaymentSeries["valuationDirection"] => {
  if (
    kind === "sImmediate" ||
    kind === "sDue" ||
    kind === "sDeferred" ||
    kind === "sDeferredDue" ||
    kind === "sContinuous" ||
    kind === "sDeferredContinuous" ||
    kind === "increasingAccumulated" ||
    kind === "sIncreasingDue" ||
    kind === "sDeferredIncreasingImmediate" ||
    kind === "sDeferredIncreasingDue"
  ) {
    return "future"
  }

  return "present"
}

const getPaymentTiming = (kind: AnnuityKind): PaymentSeries["paymentTiming"] => {
  if (
    kind === "continuous" ||
    kind === "deferredContinuous" ||
    kind === "sContinuous" ||
    kind === "sDeferredContinuous"
  ) {
    return "continuous"
  }

  return isDueKind(kind) ? "due" : "immediate"
}

export const buildPaymentSeries = ({
  expression,
  tokens,
  getPromptValue,
}: BuildPaymentSeriesOptions): PaymentSeries[] => {
  const result: PaymentSeries[] = []

  tokens.forEach((token) => {
    const { sign, coefficient, discountPower } = getPaymentPrefixBeforeToken(
      expression,
      token,
    )

    const trailingDiscountPower = getAdjacentTrailingDiscountPowerAfterToken(
      expression,
      token,
    )

    const totalDiscountPower = discountPower + trailingDiscountPower

    const amount = sign * coefficient
    const label = kindLabel[token.kind]
    const typedDeferral = Math.max(0, Math.round(totalDiscountPower))

    const seriesMetadata = {
      iLabel: cleanDisplayValue(getPromptValue(token.iPromptId)),
      valuationDirection: getValuationDirection(token.kind),
      paymentTiming: getPaymentTiming(token.kind),
    } satisfies Pick<
      PaymentSeries,
      "iLabel" | "valuationDirection" | "paymentTiming"
    >

    if (
      token.kind === "deferredPerpetuity" ||
      token.kind === "deferredPerpetuityDue"
    ) {
      const m =
        parsePositiveInteger(getPromptValue(token.mPromptId), 0) +
        typedDeferral

      result.push({
        tokenId: token.id,
        kind: token.kind,
        label,
        amount,
        n: 20,
        m,
        ...seriesMetadata,
        events:
          token.kind === "deferredPerpetuityDue"
            ? Array.from({ length: 21 }, (_, index) => ({
                time: m + index,
                amount,
              }))
            : Array.from({ length: 20 }, (_, index) => ({
                time: m + index + 1,
                amount,
              })),
        isPerpetuity: true,
        infinityAfter: m + 20,
      })

      return
    }

    if (
      token.kind === "increasingPerpetuity" ||
      token.kind === "deferredIncreasingPerpetuity"
    ) {
      const m =
        parsePositiveInteger(getPromptValue(token.mPromptId), 0) +
        typedDeferral

      result.push({
        tokenId: token.id,
        kind: token.kind,
        label,
        amount,
        n: 20,
        m,
        ...seriesMetadata,
        events: Array.from({ length: 20 }, (_, index) => ({
          time: m + index + 1,
          amount: amount * (index + 1),
        })),
        isPerpetuity: true,
        infinityAfter: m + 20,
      })

      return
    }

    if (
      token.kind === "increasingPerpetuityDue" ||
      token.kind === "deferredIncreasingPerpetuityDue"
    ) {
      const m =
        parsePositiveInteger(getPromptValue(token.mPromptId), 0) +
        typedDeferral

      result.push({
        tokenId: token.id,
        kind: token.kind,
        label,
        amount,
        n: 20,
        m,
        ...seriesMetadata,
        events: Array.from({ length: 21 }, (_, index) => ({
          time: m + index,
          amount: amount * (index + 1),
        })),
        isPerpetuity: true,
        infinityAfter: m + 20,
      })

      return
    }

    if (isPerpetuityKind(token.kind)) {
      const m = typedDeferral

      result.push({
        tokenId: token.id,
        kind: token.kind,
        label,
        amount,
        n: 20,
        m,
        ...seriesMetadata,
        events:
          token.kind === "perpetuityDue"
            ? Array.from({ length: 21 }, (_, index) => ({
                time: m + index,
                amount,
              }))
            : Array.from({ length: 20 }, (_, index) => ({
                time: m + index + 1,
                amount,
              })),
        isPerpetuity: true,
        infinityAfter: m + 20,
      })

      return
    }

    const n = parsePositiveInteger(getPromptValue(token.nPromptId), 0)
    const m =
      parsePositiveInteger(getPromptValue(token.mPromptId), 0) + typedDeferral

    if (n <= 0) return

    if (
      token.kind === "increasingImmediate" ||
      token.kind === "increasingAccumulated"
    ) {
      result.push({
        tokenId: token.id,
        kind: token.kind,
        label,
        amount,
        n,
        m,
        ...seriesMetadata,
        events: Array.from({ length: n }, (_, index) => ({
          time: m + index + 1,
          amount: amount * (index + 1),
        })),
      })

      return
    }

    if (token.kind === "increasingDue" || token.kind === "sIncreasingDue") {
      result.push({
        tokenId: token.id,
        kind: token.kind,
        label,
        amount,
        n,
        m,
        ...seriesMetadata,
        events: Array.from({ length: n }, (_, index) => ({
          time: m + index,
          amount: amount * (index + 1),
        })),
      })

      return
    }

    if (
      token.kind === "deferredIncreasingImmediate" ||
      token.kind === "sDeferredIncreasingImmediate"
    ) {
      result.push({
        tokenId: token.id,
        kind: token.kind,
        label,
        amount,
        n,
        m,
        ...seriesMetadata,
        events: Array.from({ length: n }, (_, index) => ({
          time: m + index + 1,
          amount: amount * (index + 1),
        })),
      })

      return
    }

    if (
      token.kind === "deferredIncreasingDue" ||
      token.kind === "sDeferredIncreasingDue"
    ) {
      result.push({
        tokenId: token.id,
        kind: token.kind,
        label,
        amount,
        n,
        m,
        ...seriesMetadata,
        events: Array.from({ length: n }, (_, index) => ({
          time: m + index,
          amount: amount * (index + 1),
        })),
      })

      return
    }

    if (token.kind === "continuous" || token.kind === "sContinuous") {
      result.push({
        tokenId: token.id,
        kind: token.kind,
        label,
        amount,
        n,
        m,
        ...seriesMetadata,
        events: [],
        continuousStart: m,
        continuousEnd: m + n,
      })

      return
    }

    if (
      token.kind === "deferredContinuous" ||
      token.kind === "sDeferredContinuous"
    ) {
      result.push({
        tokenId: token.id,
        kind: token.kind,
        label,
        amount,
        n,
        m,
        ...seriesMetadata,
        events: [],
        continuousStart: m,
        continuousEnd: m + n,
      })

      return
    }

    if (isDeferredKind(token.kind)) {
      result.push({
        tokenId: token.id,
        kind: token.kind,
        label,
        amount,
        n,
        m,
        ...seriesMetadata,
        events: Array.from({ length: n }, (_, index) => ({
          time: isDueKind(token.kind) ? m + index : m + index + 1,
          amount,
        })),
      })

      return
    }

    if (isDueKind(token.kind)) {
      result.push({
        tokenId: token.id,
        kind: token.kind,
        label,
        amount,
        n,
        m,
        ...seriesMetadata,
        events: Array.from({ length: n }, (_, index) => ({
          time: m + index,
          amount,
        })),
      })

      return
    }

    result.push({
      tokenId: token.id,
      kind: token.kind,
      label,
      amount,
      n,
      m,
      ...seriesMetadata,
      events: Array.from({ length: n }, (_, index) => ({
        time: m + index + 1,
        amount,
      })),
    })
  })

  return result
}