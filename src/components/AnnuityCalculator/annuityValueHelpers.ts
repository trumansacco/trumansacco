import type { AnnuityToken } from "./annuityTypes"
import {
  findTokenStartIndex,
  getAdjacentTrailingAccumulationFactorAfterToken,
  getAdjacentTrailingDiscountPowerAfterToken,
  getPaymentPrefixBeforeToken,
  getReplacementEndAfterTrailingFactors,
  isDeferredKind,
  isPerpetuityKind,
} from "./annuityHelpers"

type PromptValueGetter = (id?: string) => string

export type CalculationTerm = {
  tokenId: number
  label: string
  sign: 1 | -1
  coefficient: number
  value: number
  signedValue: number
  isVariable?: boolean
}

export type CalculationResult = {
  mode: "value" | "equation"
  total: number
  terms: CalculationTerm[]
  error: string | null
  xValue?: number
  leftConstant?: number
  rightConstant?: number
  leftXCoefficient?: number
  rightXCoefficient?: number
  solveMethod?: "linear" | "numeric"
}

type LinearSide = {
  constant: number
  xCoefficient: number
}

const cleanNumber = (value: string | undefined) => {
  return (value ?? "").replace(/[^\d.-]/g, "")
}

const valueContainsX = (value: string | undefined) => {
  return /x/i.test(value ?? "")
}

const expressionContainsPromptX = ({
  tokens,
  getPromptValue,
}: {
  tokens: AnnuityToken[]
  getPromptValue: PromptValueGetter
}) => {
  return tokens.some((token) => {
    return (
      valueContainsX(getPromptValue(token.mPromptId)) ||
      valueContainsX(getPromptValue(token.nPromptId)) ||
      valueContainsX(getPromptValue(token.iPromptId))
    )
  })
}

const parseNumber = (
  value: string | undefined,
  fallback = 0,
  xValue?: number,
) => {
  const rawValue = value ?? ""

  if (valueContainsX(rawValue)) {
    if (xValue === undefined) return fallback

    const normalized = rawValue
      .replace(/\\,/g, "")
      .replace(/\\cdot/g, "*")
      .replace(/[{}\s]/g, "")
      .replace(/−/g, "-")

    if (/^[-+]?x$/i.test(normalized)) {
      return normalized.startsWith("-") ? -xValue : xValue
    }

    const coefficientMatch = normalized.match(/^([-+]?\d*\.?\d*)x$/i)

    if (coefficientMatch) {
      const coefficientText = coefficientMatch[1]
      const coefficient =
        coefficientText === "" || coefficientText === "+"
          ? 1
          : coefficientText === "-"
            ? -1
            : Number.parseFloat(coefficientText)

      return Number.isFinite(coefficient) ? coefficient * xValue : fallback
    }

    const linearMatch = normalized.match(
      /^([-+]?\d*\.?\d*)x([+-]\d*\.?\d+)?$/i,
    )

    if (linearMatch) {
      const coefficientText = linearMatch[1]
      const constantText = linearMatch[2]

      const coefficient =
        coefficientText === "" || coefficientText === "+"
          ? 1
          : coefficientText === "-"
            ? -1
            : Number.parseFloat(coefficientText)

      const constant = constantText ? Number.parseFloat(constantText) : 0

      if (Number.isFinite(coefficient) && Number.isFinite(constant)) {
        return coefficient * xValue + constant
      }
    }

    return fallback
  }

  const parsed = Number.parseFloat(cleanNumber(rawValue))

  if (!Number.isFinite(parsed)) return fallback

  return parsed
}

const parsePositiveTerm = (
  value: string | undefined,
  fallback = 0,
  xValue?: number,
) => {
  const parsed = parseNumber(value, fallback, xValue)

  if (!Number.isFinite(parsed) || parsed < 0) return fallback

  return parsed
}

const getAnnuityValue = ({
  kind,
  n,
  m,
  i,
}: {
  kind: AnnuityToken["kind"]
  n: number
  m: number
  i: number
}) => {
  if (i <= -1) {
    throw new Error("Interest rate must be greater than -1.")
  }

  const onePlusI = 1 + i
  const v = 1 / onePlusI

  if (
    kind === "perpetuity" ||
    kind === "perpetuityDue" ||
    kind === "deferredPerpetuity" ||
    kind === "deferredPerpetuityDue" ||
    kind === "increasingPerpetuity" ||
    kind === "increasingPerpetuityDue" ||
    kind === "deferredIncreasingPerpetuity" ||
    kind === "deferredIncreasingPerpetuityDue"
  ) {
    if (i <= 0) {
      throw new Error("Perpetuity interest rate must be greater than 0.")
    }
  }

  if (kind === "perpetuity") return 1 / i
  if (kind === "perpetuityDue") return onePlusI / i

  if (kind === "deferredPerpetuity") {
    return Math.pow(v, m) * (1 / i)
  }

  if (kind === "deferredPerpetuityDue") {
    return Math.pow(v, m) * (onePlusI / i)
  }

  if (kind === "increasingPerpetuity") {
    return onePlusI / Math.pow(i, 2)
  }

  if (kind === "increasingPerpetuityDue") {
    return Math.pow(onePlusI, 2) / Math.pow(i, 2)
  }

  if (kind === "deferredIncreasingPerpetuity") {
    return Math.pow(v, m) * (onePlusI / Math.pow(i, 2))
  }

  if (kind === "deferredIncreasingPerpetuityDue") {
    return Math.pow(v, m) * (Math.pow(onePlusI, 2) / Math.pow(i, 2))
  }

  if (n <= 0) return 0

  const aImmediate = i === 0 ? n : (1 - Math.pow(v, n)) / i
  const aDue = onePlusI * aImmediate

  const sImmediate = i === 0 ? n : (Math.pow(onePlusI, n) - 1) / i
  const sDue = onePlusI * sImmediate

  const increasingImmediate =
    i === 0 ? (n * (n + 1)) / 2 : (aDue - n * Math.pow(v, n)) / i

  const increasingDue = onePlusI * increasingImmediate

  const increasingAccumulated =
    i === 0 ? (n * (n + 1)) / 2 : (sDue - n) / i

  const sIncreasingDue = onePlusI * increasingAccumulated

  const continuous =
    i === 0 ? n : (1 - Math.exp(-Math.log(onePlusI) * n)) / Math.log(onePlusI)

  const sContinuous =
    i === 0 ? n : (Math.pow(onePlusI, n) - 1) / Math.log(onePlusI)

  if (kind === "immediate") return aImmediate
  if (kind === "due") return aDue

  if (kind === "continuous") return continuous
  if (kind === "deferredContinuous") return Math.pow(v, m) * continuous

  if (kind === "deferred") return Math.pow(v, m) * aImmediate
  if (kind === "deferredDue") return Math.pow(v, m) * aDue

  if (kind === "increasingImmediate") return increasingImmediate
  if (kind === "increasingDue") return increasingDue

  if (kind === "deferredIncreasingImmediate") {
    return Math.pow(v, m) * increasingImmediate
  }

  if (kind === "deferredIncreasingDue") {
    return Math.pow(v, m) * increasingDue
  }

  if (kind === "sImmediate") return sImmediate
  if (kind === "sDue") return sDue

  if (kind === "sDeferred") return sImmediate
  if (kind === "sDeferredDue") return sDue

  if (kind === "sContinuous") return sContinuous
  if (kind === "sDeferredContinuous") return sContinuous

  if (kind === "increasingAccumulated") return increasingAccumulated
  if (kind === "sIncreasingDue") return sIncreasingDue

  if (kind === "sDeferredIncreasingImmediate") {
    return increasingAccumulated
  }

  if (kind === "sDeferredIncreasingDue") {
    return sIncreasingDue
  }

  return 0
}

const replaceRangeWithSpaces = (
  expression: string,
  startIndex: number,
  endIndex: number,
) => {
  return (
    expression.slice(0, startIndex) +
    " ".repeat(Math.max(0, endIndex - startIndex)) +
    expression.slice(endIndex)
  )
}

const parseLinearText = (text: string): LinearSide => {
  const normalized = text
    .replace(/\\,/g, "")
    .replace(/\\cdot/g, "")
    .replace(/[{}()*·\s]/g, "")

  let textWithoutXTerms = normalized
  let xCoefficient = 0

  const xTermMatches = normalized.match(/[+-]?(?:\d*\.?\d+)?x/gi) ?? []

  xTermMatches.forEach((term) => {
    const cleanedTerm = term.replace(/x/gi, "")
    const sign = cleanedTerm.startsWith("-") ? -1 : 1
    const numericPart = cleanedTerm.replace(/[+-]/g, "")
    const parsedCoefficient = numericPart ? Number.parseFloat(numericPart) : 1

    xCoefficient +=
      sign *
      (Number.isFinite(parsedCoefficient) && parsedCoefficient > 0
        ? parsedCoefficient
        : 1)

    textWithoutXTerms = textWithoutXTerms.replace(term, "")
  })

  const numberMatches = textWithoutXTerms.match(/[+-]?\d*\.?\d+/g) ?? []

  const constant = numberMatches.reduce((sum, numberText) => {
    const parsed = Number.parseFloat(numberText)

    if (!Number.isFinite(parsed)) return sum

    return sum + parsed
  }, 0)

  return {
    constant,
    xCoefficient,
  }
}

const buildTerms = ({
  expression,
  tokens,
  getPromptValue,
  getLabel,
  xValue,
}: {
  expression: string
  tokens: AnnuityToken[]
  getPromptValue: PromptValueGetter
  getLabel: (kind: AnnuityToken["kind"]) => string
  equationIndex: number
  xValue?: number
}) => {
  return tokens
    .map((token): CalculationTerm | null => {
      const tokenStartIndex = findTokenStartIndex(expression, token)

      if (tokenStartIndex === -1) return null

      const n = isPerpetuityKind(token.kind)
        ? 0
        : parsePositiveTerm(getPromptValue(token.nPromptId), 0, xValue)

      const promptM = isDeferredKind(token.kind)
        ? parsePositiveTerm(getPromptValue(token.mPromptId), 0, xValue)
        : 0

      const i = parseNumber(getPromptValue(token.iPromptId), 0, xValue)

      if (!isPerpetuityKind(token.kind) && n <= 0) return null

      const prefix = getPaymentPrefixBeforeToken(expression, token)

      const trailingDiscountPower = getAdjacentTrailingDiscountPowerAfterToken(
        expression,
        token,
      )

      const trailingAccumulationFactor =
        getAdjacentTrailingAccumulationFactorAfterToken(expression, token)

      const onePlusI = 1 + i
      const v = 1 / onePlusI

      const extraDiscountFactor = Math.pow(
        v,
        prefix.discountPower + trailingDiscountPower,
      )

      const extraAccumulationFactor =
        prefix.accumulationFactor * trailingAccumulationFactor

      const baseValue = getAnnuityValue({
        kind: token.kind,
        n,
        m: promptM,
        i,
      })

      const value =
        prefix.coefficient *
        extraDiscountFactor *
        extraAccumulationFactor *
        baseValue

      return {
        tokenId: token.id,
        label: getLabel(token.kind),
        sign: prefix.sign,
        coefficient: prefix.coefficient,
        value,
        signedValue: prefix.sign * value,
        isVariable: prefix.hasVariable,
      }
    })
    .filter((term): term is CalculationTerm => term !== null)
    .sort((a, b) => a.tokenId - b.tokenId)
}

const getMaskedExpression = ({
  expression,
  tokens,
}: {
  expression: string
  tokens: AnnuityToken[]
}) => {
  let maskedExpression = expression

  tokens.forEach((token) => {
    const tokenStartIndex = findTokenStartIndex(expression, token)

    if (tokenStartIndex === -1) return

    const prefix = getPaymentPrefixBeforeToken(expression, token)
    const replacementEndIndex = getReplacementEndAfterTrailingFactors(
      expression,
      token,
    )

    maskedExpression = replaceRangeWithSpaces(
      maskedExpression,
      prefix.prefixStart,
      replacementEndIndex,
    )
  })

  return maskedExpression
}

const evaluateEquationAtX = ({
  xValue,
  expression,
  tokens,
  getPromptValue,
  getLabel,
  equationIndex,
  maskedExpression,
}: {
  xValue: number
  expression: string
  tokens: AnnuityToken[]
  getPromptValue: PromptValueGetter
  getLabel: (kind: AnnuityToken["kind"]) => string
  equationIndex: number
  maskedExpression: string
}) => {
  const terms = buildTerms({
    expression,
    tokens,
    getPromptValue,
    getLabel,
    equationIndex,
    xValue,
  })

  const leftText = maskedExpression.slice(0, equationIndex)
  const rightText = maskedExpression.slice(equationIndex + 1)

  const leftSide = parseLinearText(leftText)
  const rightSide = parseLinearText(rightText)

  tokens.forEach((token) => {
    const tokenStartIndex = findTokenStartIndex(expression, token)

    if (tokenStartIndex === -1) return

    const matchingTerm = terms.find((term) => term.tokenId === token.id)

    if (!matchingTerm) return

    const side = tokenStartIndex < equationIndex ? leftSide : rightSide

    if (matchingTerm.isVariable) {
      side.xCoefficient += matchingTerm.signedValue
    } else {
      side.constant += matchingTerm.signedValue
    }
  })

  const leftValue = leftSide.constant + leftSide.xCoefficient * xValue
  const rightValue = rightSide.constant + rightSide.xCoefficient * xValue

  return {
    value: leftValue - rightValue,
    terms,
    leftSide,
    rightSide,
  }
}

const findNumericRoot = (fn: (x: number) => number) => {
  const tolerance = 1e-7
  const guesses = [
    0,
    0.0001,
    0.001,
    0.01,
    0.05,
    0.1,
    0.25,
    0.5,
    1,
    2,
    5,
    10,
    20,
    50,
    100,
  ]

  for (const guess of guesses) {
    const value = fn(guess)

    if (Number.isFinite(value) && Math.abs(value) < tolerance) {
      return guess
    }
  }

  const ranges = [
    [-100, 100],
    [-10, 10],
    [0, 100],
    [0, 10],
    [-1, 10],
    [-1, 1],
  ]

  for (const [rangeStart, rangeEnd] of ranges) {
    const steps = 400
    let previousX = rangeStart
    let previousValue = fn(previousX)

    for (let index = 1; index <= steps; index++) {
      const currentX =
        rangeStart + ((rangeEnd - rangeStart) * index) / steps
      const currentValue = fn(currentX)

      if (
        Number.isFinite(previousValue) &&
        Number.isFinite(currentValue) &&
        previousValue * currentValue <= 0
      ) {
        let low = previousX
        let high = currentX
        let lowValue = previousValue

        for (let iteration = 0; iteration < 80; iteration++) {
          const mid = (low + high) / 2
          const midValue = fn(mid)

          if (!Number.isFinite(midValue)) break

          if (Math.abs(midValue) < tolerance) return mid

          if (lowValue * midValue <= 0) {
            high = mid
          } else {
            low = mid
            lowValue = midValue
          }
        }

        return (low + high) / 2
      }

      previousX = currentX
      previousValue = currentValue
    }
  }

  return null
}

export const calculateExpressionValue = ({
  expression,
  tokens,
  getPromptValue,
  getLabel,
}: {
  expression: string
  tokens: AnnuityToken[]
  getPromptValue: PromptValueGetter
  getLabel: (kind: AnnuityToken["kind"]) => string
}): CalculationResult => {
  try {
    const equationIndex = expression.indexOf("=")
    const isEquation = equationIndex !== -1

    if (!isEquation) {
      const terms = buildTerms({
        expression,
        tokens,
        getPromptValue,
        getLabel,
        equationIndex: -1,
      })

      const total = terms.reduce((sum, term) => {
        return sum + term.signedValue
      }, 0)

      return {
        mode: "value",
        total,
        terms,
        error: null,
      }
    }

    const maskedExpression = getMaskedExpression({
      expression,
      tokens,
    })

    if (expressionContainsPromptX({ tokens, getPromptValue })) {
      const root = findNumericRoot((xValue) => {
        return evaluateEquationAtX({
          xValue,
          expression,
          tokens,
          getPromptValue,
          getLabel,
          equationIndex,
          maskedExpression,
        }).value
      })

      if (root === null) {
        return {
          mode: "equation",
          total: 0,
          terms: [],
          error: "Could not solve for x.",
          solveMethod: "numeric",
        }
      }

      const evaluated = evaluateEquationAtX({
        xValue: root,
        expression,
        tokens,
        getPromptValue,
        getLabel,
        equationIndex,
        maskedExpression,
      })

      return {
        mode: "equation",
        total: root,
        terms: evaluated.terms,
        error: null,
        xValue: root,
        leftConstant: evaluated.leftSide.constant,
        rightConstant: evaluated.rightSide.constant,
        leftXCoefficient: evaluated.leftSide.xCoefficient,
        rightXCoefficient: evaluated.rightSide.xCoefficient,
        solveMethod: "numeric",
      }
    }

    const evaluatedAtZero = evaluateEquationAtX({
      xValue: 0,
      expression,
      tokens,
      getPromptValue,
      getLabel,
      equationIndex,
      maskedExpression,
    })

    const leftConstant = evaluatedAtZero.leftSide.constant
    const rightConstant = evaluatedAtZero.rightSide.constant
    const leftXCoefficient = evaluatedAtZero.leftSide.xCoefficient
    const rightXCoefficient = evaluatedAtZero.rightSide.xCoefficient

    const denominator = leftXCoefficient - rightXCoefficient

    if (Math.abs(denominator) < 1e-12) {
      return {
        mode: "equation",
        total: 0,
        terms: evaluatedAtZero.terms,
        error: "Equation does not have a unique linear solution.",
        leftConstant,
        rightConstant,
        leftXCoefficient,
        rightXCoefficient,
        solveMethod: "linear",
      }
    }

    const xValue = (rightConstant - leftConstant) / denominator

    return {
      mode: "equation",
      total: xValue,
      terms: evaluatedAtZero.terms,
      error: null,
      xValue,
      leftConstant,
      rightConstant,
      leftXCoefficient,
      rightXCoefficient,
      solveMethod: "linear",
    }
  } catch (error) {
    return {
      mode: expression.includes("=") ? "equation" : "value",
      total: 0,
      terms: [],
      error: error instanceof Error ? error.message : "Could not calculate.",
    }
  }
}