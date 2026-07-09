import type { AnnuityKind, AnnuityToken } from "./annuityTypes"

export const annuityButtons: {
  kind: AnnuityKind
  label: string
  displayLatex: string
}[] = [
  {
    kind: "immediate",
    label: "Annuity Immediate",
    displayLatex: "{a}_{\\overline{n|}i}",
  },
  {
    kind: "due",
    label: "Annuity Due",
    displayLatex: "{\\ddot{a}}_{\\overline{n|}i}",
  },
  {
    kind: "continuous",
    label: "Continuous Annuity",
    displayLatex: "{\\bar{a}}_{\\overline{n|}i}",
  },
  {
    kind: "increasingImmediate",
    label: "Increasing Annuity Immediate",
    displayLatex: "{(Ia)}_{\\overline{n|}i}",
  },
  {
    kind: "increasingDue",
    label: "Increasing Annuity Due",
    displayLatex: "{(I\\ddot{a})}_{\\overline{n|}i}",
  },
  {
    kind: "perpetuity",
    label: "Perpetuity",
    displayLatex: "{a}_{\\overline{\\infty|}i}",
  },
  {
    kind: "perpetuityDue",
    label: "Perpetuity Due",
    displayLatex: "{\\ddot{a}}_{\\overline{\\infty|}i}",
  },
  {
    kind: "increasingPerpetuity",
    label: "Increasing Perpetuity Immediate",
    displayLatex: "{(Ia)}_{\\overline{\\infty|}i}",
  },
  {
    kind: "increasingPerpetuityDue",
    label: "Increasing Perpetuity Due",
    displayLatex: "{(I\\ddot{a})}_{\\overline{\\infty|}i}",
  },
  {
    kind: "sImmediate",
    label: "S Immediate",
    displayLatex: "{s}_{\\overline{n|}i}",
  },
  {
    kind: "sDue",
    label: "S Due",
    displayLatex: "{\\ddot{s}}_{\\overline{n|}i}",
  },
  {
    kind: "sContinuous",
    label: "Continuous S",
    displayLatex: "{\\bar{s}}_{\\overline{n|}i}",
  },
  {
    kind: "increasingAccumulated",
    label: "Increasing S Immediate",
    displayLatex: "{(Is)}_{\\overline{n|}i}",
  },
  {
    kind: "sIncreasingDue",
    label: "Increasing S Due",
    displayLatex: "{(I\\ddot{s})}_{\\overline{n|}i}",
  },
]

export const annuityButtonGroups: {
  title: string
  description?: string
  buttons: typeof annuityButtons
}[] = [
  {
    title: "Present Value",
    description: "Annuity values using a",
    buttons: annuityButtons.filter((button) =>
      [
        "immediate",
        "due",
        "continuous",
        "increasingImmediate",
        "increasingDue",
      ].includes(button.kind),
    ),
  },
  {
    title: "Perpetuity",
    description: "Infinite payment streams",
    buttons: annuityButtons.filter((button) =>
      [
        "perpetuity",
        "perpetuityDue",
        "increasingPerpetuity",
        "increasingPerpetuityDue",
      ].includes(button.kind),
    ),
  },
  {
    title: "Accumulated / Future Value",
    description: "Accumulated values using s",
    buttons: annuityButtons.filter((button) =>
      [
        "sImmediate",
        "sDue",
        "sContinuous",
        "increasingAccumulated",
        "sIncreasingDue",
      ].includes(button.kind),
    ),
  },
]

export const kindLabel: Record<AnnuityKind, string> = {
  immediate: "Annuity Immediate",
  due: "Annuity Due",
  continuous: "Continuous Annuity",
  deferredContinuous: "Deferred Continuous Annuity",
  deferred: "Deferred Annuity",
  deferredDue: "Deferred Annuity Due",
  perpetuity: "Perpetuity",
  perpetuityDue: "Perpetuity Due",
  deferredPerpetuity: "Deferred Perpetuity Immediate",
  deferredPerpetuityDue: "Deferred Perpetuity Due",
  increasingImmediate: "Increasing Annuity Immediate",
  increasingDue: "Increasing Annuity Due",
  deferredIncreasingImmediate: "Deferred Increasing Annuity Immediate",
  deferredIncreasingDue: "Deferred Increasing Annuity Due",
  increasingAccumulated: "Increasing S Immediate",
  sContinuous: "Continuous S",
  sDeferredContinuous: "Deferred Continuous S",
  sIncreasingDue: "Increasing S Due",
  sDeferredIncreasingImmediate: "Deferred Increasing S Immediate",
  sDeferredIncreasingDue: "Deferred Increasing S Due",
  increasingPerpetuity: "Increasing Perpetuity Immediate",
  increasingPerpetuityDue: "Increasing Perpetuity Due",
  deferredIncreasingPerpetuity: "Deferred Increasing Perpetuity Immediate",
  deferredIncreasingPerpetuityDue: "Deferred Increasing Perpetuity Due",
  sImmediate: "S Immediate",
  sDue: "S Due",
  sDeferred: "Deferred S Immediate",
  sDeferredDue: "Deferred S Due",
}

export const isDeferredKind = (kind: AnnuityKind) => {
  return (
    kind === "deferred" ||
    kind === "deferredDue" ||
    kind === "deferredContinuous" ||
    kind === "deferredPerpetuity" ||
    kind === "deferredPerpetuityDue" ||
    kind === "deferredIncreasingImmediate" ||
    kind === "deferredIncreasingDue" ||
    kind === "deferredIncreasingPerpetuity" ||
    kind === "deferredIncreasingPerpetuityDue" ||
    kind === "sDeferred" ||
    kind === "sDeferredDue" ||
    kind === "sDeferredContinuous" ||
    kind === "sDeferredIncreasingImmediate" ||
    kind === "sDeferredIncreasingDue"
  )
}

export const isPerpetuityKind = (kind: AnnuityKind) => {
  return (
    kind === "perpetuity" ||
    kind === "perpetuityDue" ||
    kind === "deferredPerpetuity" ||
    kind === "deferredPerpetuityDue" ||
    kind === "increasingPerpetuity" ||
    kind === "increasingPerpetuityDue" ||
    kind === "deferredIncreasingPerpetuity" ||
    kind === "deferredIncreasingPerpetuityDue"
  )
}

export const isDueKind = (kind: AnnuityKind) => {
  return (
    kind === "due" ||
    kind === "deferredDue" ||
    kind === "perpetuityDue" ||
    kind === "deferredPerpetuityDue" ||
    kind === "increasingDue" ||
    kind === "deferredIncreasingDue" ||
    kind === "increasingPerpetuityDue" ||
    kind === "deferredIncreasingPerpetuityDue" ||
    kind === "sDue" ||
    kind === "sDeferredDue" ||
    kind === "sIncreasingDue" ||
    kind === "sDeferredIncreasingDue"
  )
}

export const isIncreasingKind = (kind: AnnuityKind) => {
  return (
    kind === "increasingImmediate" ||
    kind === "increasingDue" ||
    kind === "deferredIncreasingImmediate" ||
    kind === "deferredIncreasingDue" ||
    kind === "increasingAccumulated" ||
    kind === "sIncreasingDue" ||
    kind === "sDeferredIncreasingImmediate" ||
    kind === "sDeferredIncreasingDue" ||
    kind === "increasingPerpetuity" ||
    kind === "increasingPerpetuityDue" ||
    kind === "deferredIncreasingPerpetuity" ||
    kind === "deferredIncreasingPerpetuityDue"
  )
}

export const getAnnuityBaseLatex = (kind: AnnuityKind) => {
  if (
    kind === "due" ||
    kind === "deferredDue" ||
    kind === "perpetuityDue" ||
    kind === "deferredPerpetuityDue"
  ) {
    return "{\\ddot{a}}"
  }

  if (kind === "continuous" || kind === "deferredContinuous") {
    return "{\\bar{a}}"
  }

  if (kind === "perpetuity" || kind === "deferredPerpetuity") return "{a}"

  if (
    kind === "increasingImmediate" ||
    kind === "deferredIncreasingImmediate" ||
    kind === "increasingPerpetuity" ||
    kind === "deferredIncreasingPerpetuity"
  ) {
    return "{(Ia)}"
  }

  if (
    kind === "increasingDue" ||
    kind === "deferredIncreasingDue" ||
    kind === "increasingPerpetuityDue" ||
    kind === "deferredIncreasingPerpetuityDue"
  ) {
    return "{(I\\ddot{a})}"
  }

  if (kind === "sImmediate" || kind === "sDeferred") return "{s}"
  if (kind === "sDue" || kind === "sDeferredDue") return "{\\ddot{s}}"

  if (kind === "sContinuous" || kind === "sDeferredContinuous") {
    return "{\\bar{s}}"
  }

  if (
    kind === "increasingAccumulated" ||
    kind === "sDeferredIncreasingImmediate"
  ) {
    return "{(Is)}"
  }

  if (kind === "sIncreasingDue" || kind === "sDeferredIncreasingDue") {
    return "{(I\\ddot{s})}"
  }

  return "{a}"
}

export const makeAnnuityLatex = (id: number, kind: AnnuityKind) => {
  const nPrompt = `\\placeholder[n${id}]{}`
  const iPrompt = `\\placeholder[i${id}]{}`
  const mPrompt = `\\placeholder[m${id}]{}`
  const baseLatex = getAnnuityBaseLatex(kind)

  if (isDeferredKind(kind)) {
    const timePrompt = isPerpetuityKind(kind) ? "\\infty" : nPrompt

    return `{}_{${mPrompt}|}${baseLatex}_{\\overline{${timePrompt}|}${iPrompt}}`
  }

  if (isPerpetuityKind(kind)) {
    return `${baseLatex}_{\\overline{\\infty|}${iPrompt}}`
  }

  return `${baseLatex}_{\\overline{${nPrompt}|}${iPrompt}}`
}

export const parsePositiveInteger = (
  value: string | undefined,
  fallback = 0,
) => {
  const cleaned = (value ?? "").replace(/[^\d]/g, "")
  const parsed = Number.parseInt(cleaned, 10)

  if (!Number.isFinite(parsed) || parsed < 0) return fallback

  return parsed
}

const findFirstExistingIndex = (expression: string, markers: string[]) => {
  for (const marker of markers) {
    const index = expression.indexOf(marker)
    if (index !== -1) return index
  }

  return -1
}

const findLastExistingIndexBefore = (
  expression: string,
  markers: string[],
  beforeIndex: number,
) => {
  const indexes = markers
    .map((marker) => expression.lastIndexOf(marker, beforeIndex))
    .filter((index) => index !== -1)

  if (!indexes.length) return -1

  return Math.max(...indexes)
}

const findMatchingOpenBrace = (expression: string, closeBraceIndex: number) => {
  let depth = 0

  for (let index = closeBraceIndex; index >= 0; index--) {
    const character = expression[index]

    if (character === "}") {
      depth += 1
      continue
    }

    if (character === "{") {
      depth -= 1

      if (depth === 0) return index
    }
  }

  return -1
}

const findMatchingCloseBrace = (expression: string, openBraceIndex: number) => {
  let depth = 0

  for (let index = openBraceIndex; index < expression.length; index++) {
    const character = expression[index]

    if (character === "{") {
      depth += 1
      continue
    }

    if (character === "}") {
      depth -= 1

      if (depth === 0) return index
    }
  }

  return -1
}

const getPromptIndexForToken = (expression: string, token: AnnuityToken) => {
  return findFirstExistingIndex(
    expression,
    [
      token.mPromptId ? `\\placeholder[m${token.id}]` : "",
      token.nPromptId ? `\\placeholder[n${token.id}]` : "",
      `\\placeholder[i${token.id}]`,
    ].filter(Boolean),
  )
}

const getSubscriptStartBeforePrompt = (
  expression: string,
  promptIndex: number,
) => {
  const withClosingBase = expression.lastIndexOf("}_{\\overline{", promptIndex)
  const withoutClosingBase = expression.lastIndexOf("_{\\overline{", promptIndex)

  return Math.max(withClosingBase, withoutClosingBase)
}

export const getAnnuityEndIndexFromExpression = (
  expression: string,
  token: AnnuityToken,
) => {
  const promptIndex = getPromptIndexForToken(expression, token)

  if (promptIndex === -1) return token.end

  const subscriptStart = getSubscriptStartBeforePrompt(expression, promptIndex)

  if (subscriptStart === -1) return token.end

  const hasClosingBaseBrace = expression.startsWith(
    "}_{\\overline{",
    subscriptStart,
  )

  const subscriptUnderscoreIndex = hasClosingBaseBrace
    ? subscriptStart + 1
    : subscriptStart

  const subscriptOpenBraceIndex = expression.indexOf(
    "{",
    subscriptUnderscoreIndex,
  )

  if (subscriptOpenBraceIndex === -1) return token.end

  const subscriptCloseBraceIndex = findMatchingCloseBrace(
    expression,
    subscriptOpenBraceIndex,
  )

  if (subscriptCloseBraceIndex === -1) return token.end

  return subscriptCloseBraceIndex + 1
}

const getTermStartBeforeIndex = (expression: string, index: number) => {
  let termStart = index

  while (
    termStart > 0 &&
    expression[termStart - 1] !== "+" &&
    expression[termStart - 1] !== "-" &&
    expression[termStart - 1] !== "="
  ) {
    termStart -= 1
  }

  return termStart
}

const getAnnuityBaseRangeFromPrompt = (
  expression: string,
  token: AnnuityToken,
) => {
  const promptIndex = getPromptIndexForToken(expression, token)

  if (promptIndex === -1) return null

  const subscriptStart = getSubscriptStartBeforePrompt(expression, promptIndex)

  if (subscriptStart === -1) return null

  const hasClosingBaseBrace = expression.startsWith(
    "}_{\\overline{",
    subscriptStart,
  )

  if (hasClosingBaseBrace) {
    const openBraceIndex = findMatchingOpenBrace(expression, subscriptStart)

    if (openBraceIndex !== -1) {
      return {
        start: openBraceIndex,
        end: subscriptStart,
        subscriptStart,
        promptIndex,
      }
    }
  }

  const oldStyleStart = findLastExistingIndexBefore(
    expression,
    [
      "{\\ddot{a}}_{",
      "{\\bar{a}}_{",
      "{(I\\ddot{a})}_{",
      "{(Ia)}_{",
      "{a}_{",
      "{\\ddot{s}}_{",
      "{\\bar{s}}_{",
      "{(I\\ddot{s})}_{",
      "{(Is)}_{",
      "{s}_{",
      "\\ddot{a}_{",
      "\\bar{a}_{",
      "\\ddot{s}_{",
      "\\bar{s}_{",
      "(I\\ddot{a})_",
      "(Ia)_",
      "(I\\ddot{s})_",
      "(Is)_",
      "a_",
      "s_",
    ],
    promptIndex,
  )

  if (oldStyleStart !== -1) {
    return {
      start: oldStyleStart,
      end: subscriptStart,
      subscriptStart,
      promptIndex,
    }
  }

  return {
    start: getTermStartBeforeIndex(expression, subscriptStart),
    end: subscriptStart,
    subscriptStart,
    promptIndex,
  }
}

export const findTokenStartIndex = (
  expression: string,
  token: AnnuityToken,
) => {
  const id = token.id
  const promptIndex = getPromptIndexForToken(expression, token)

  if (promptIndex === -1) return -1

  if (isDeferredKind(token.kind)) {
    const deferredStart = findLastExistingIndexBefore(
      expression,
      [`{}_{\\placeholder[m${id}]`, "{}_{"],
      promptIndex,
    )

    if (deferredStart !== -1) return deferredStart
  }

  if (isPerpetuityKind(token.kind)) {
    const perpetuityStart = findLastExistingIndexBefore(
      expression,
      [
        "{\\ddot{a}}_{\\overline{",
        "{(I\\ddot{a})}_{\\overline{",
        "{(Ia)}_{\\overline{",
        "{a}_{\\overline{",
        "\\ddot{a}_{\\overline{",
        "(I\\ddot{a})_{\\overline{",
        "(Ia)_{\\overline{",
        "a_{\\overline{",
      ],
      promptIndex,
    )

    if (perpetuityStart !== -1) return perpetuityStart
  }

  const annuityStart = findLastExistingIndexBefore(
    expression,
    [
      "{\\ddot{a}}_{",
      "{\\bar{a}}_{",
      "{(I\\ddot{a})}_{",
      "{(Ia)}_{",
      "{a}_{",
      "{\\ddot{s}}_{",
      "{\\bar{s}}_{",
      "{(I\\ddot{s})}_{",
      "{(Is)}_{",
      "{s}_{",
      "(I\\ddot{a})_",
      "(Ia)_",
      "(I\\ddot{s})_",
      "(Is)_",
      "a_",
      "s_",
    ],
    promptIndex,
  )

  if (annuityStart !== -1) return annuityStart

  const baseRange = getAnnuityBaseRangeFromPrompt(expression, token)

  if (baseRange) return baseRange.start

  return promptIndex
}

export const getDiscountPrefixRangeBeforeToken = (
  expression: string,
  token: AnnuityToken,
) => {
  const baseRange = getAnnuityBaseRangeFromPrompt(expression, token)

  if (!baseRange) return null

  const rawBase = expression.slice(baseRange.start, baseRange.end)

  const matches = Array.from(
    rawBase.matchAll(
      /v(?:\^(?:\{(?:\\placeholder\[[^\]]+\]\{[^}]*\}|[-+]?\d*\.?\d*)\}|[-+]?\d*\.?\d*))?/gi,
    ),
  )

  const match = matches[matches.length - 1]

  if (!match || match.index === undefined) return null

  const fullMatch = match[0]
  const start = baseRange.start + match.index
  const end = start + fullMatch.length
  const placeholderInMatch = fullMatch.match(
    /\\placeholder\[([^\]]+)\]\{([^}]*)\}/,
  )

  if (placeholderInMatch?.index !== undefined) {
    const promptOpenBraceIndex = fullMatch.indexOf(
      "{",
      placeholderInMatch.index,
    )
    const promptCloseBraceIndex = fullMatch.indexOf(
      "}",
      promptOpenBraceIndex + 1,
    )

    if (promptOpenBraceIndex !== -1 && promptCloseBraceIndex !== -1) {
      return {
        start,
        exponentStart: start + promptOpenBraceIndex + 1,
        exponentEnd: start + promptCloseBraceIndex,
        end,
      }
    }
  }

  const exponentStartInMatch = fullMatch.indexOf("^")

  if (exponentStartInMatch === -1) {
    return {
      start,
      exponentStart: start,
      exponentEnd: start + 1,
      end,
    }
  }

  let exponentStart = start + exponentStartInMatch + 1
  let exponentEnd = end
  const exponentText = fullMatch.slice(exponentStartInMatch + 1)

  if (exponentText.startsWith("{")) {
    exponentStart += 1

    const closingBraceIndex = fullMatch.lastIndexOf("}")

    if (closingBraceIndex !== -1) {
      exponentEnd = start + closingBraceIndex
    }
  } else {
    const exponentMatch = exponentText.match(/^[-+]?\d*\.?\d*/)

    if (exponentMatch) {
      exponentEnd = exponentStart + exponentMatch[0].length
    }
  }

  return {
    start,
    exponentStart,
    exponentEnd,
    end,
  }
}

const collectDiscountPowers = (latex: string) => {
  let discountPower = 0

  const latexWithoutDiscounts = latex.replace(
    /v(?:\^\{(?:\\placeholder\[[^\]]+\]\{([^}]*)\}|([-+]?\d*\.?\d+))\}|\^([-+]?\d*\.?\d+))?/gi,
    (
      _match,
      placeholderPower: string | undefined,
      bracedPower: string | undefined,
      plainPower: string | undefined,
    ) => {
      const powerText = placeholderPower ?? bracedPower ?? plainPower
      const parsedPower = powerText ? Number.parseFloat(powerText) : 1

      discountPower += Number.isFinite(parsedPower) ? parsedPower : 1

      return ""
    },
  )

  return {
    discountPower,
    latexWithoutDiscounts,
  }
}

const ACCUMULATION_FACTOR_SOURCE = String.raw`(?:\\left)?\(\s*1\s*\+\s*(?:\\placeholder\[ai\d+\]\{([^}]*)\}|([^(){}^]+))\s*(?:\\right)?\)\s*\^\s*(?:\{\s*(?:\\placeholder\[ak\d+\]\{([^}]*)\}|([^{}]+))\s*\}|\(\s*([^()]+)\s*\)|([-+]?\d*\.?\d+))`

const ACCUMULATION_FACTOR_REGEX = new RegExp(
  ACCUMULATION_FACTOR_SOURCE,
  "gi",
)

const ACCUMULATION_FACTOR_START_REGEX = new RegExp(
  `^${ACCUMULATION_FACTOR_SOURCE}`,
  "i",
)

const cleanFactorPromptValue = (value: string | undefined, fallback: string) => {
  const cleaned = (value ?? "")
    .replace(/\\,/g, "")
    .replace(/[{}]/g, "")
    .trim()

  return cleaned.length > 0 ? cleaned : fallback
}

const parseFactorNumber = (value: string | undefined, fallback = 0) => {
  const cleaned = (value ?? "")
    .replace(/\\,/g, "")
    .replace(/[{}()\s]/g, "")
    .replace(/−/g, "-")

  const parsed = Number.parseFloat(cleaned)

  return Number.isFinite(parsed) ? parsed : fallback
}

const getAccumulationFactorValue = (
  iText: string | undefined,
  kText: string | undefined,
) => {
  const i = parseFactorNumber(iText, 0)
  const k = parseFactorNumber(kText, 0)

  if (i <= -1) return 1

  return Math.pow(1 + i, k)
}

const getAccumulationFactorLatex = (
  iText: string | undefined,
  kText: string | undefined,
) => {
  const i = cleanFactorPromptValue(iText, "i")
  const k = cleanFactorPromptValue(kText, "k")

  return `\\left(1+${i}\\right)^{${k}}`
}

const getAccumulationMatchValues = (match: RegExpMatchArray) => {
  const iText = match[1] ?? match[2]
  const kText = match[3] ?? match[4] ?? match[5] ?? match[6]

  return {
    iText,
    kText,
  }
}

const collectAccumulationFactors = (latex: string) => {
  let accumulationFactor = 1
  const accumulationLatexParts: string[] = []

  const latexWithoutAccumulations = latex.replace(
    ACCUMULATION_FACTOR_REGEX,
    (...args) => {
      const match = args as unknown as [
        string,
        string | undefined,
        string | undefined,
        string | undefined,
        string | undefined,
        string | undefined,
        string | undefined,
      ]

      const iText = match[1] ?? match[2]
      const kText = match[3] ?? match[4] ?? match[5] ?? match[6]

      accumulationFactor *= getAccumulationFactorValue(iText, kText)
      accumulationLatexParts.push(getAccumulationFactorLatex(iText, kText))

      return ""
    },
  )

  return {
    accumulationFactor,
    accumulationLatex: accumulationLatexParts.join(""),
    latexWithoutAccumulations,
  }
}

const getAdjacentTrailingFactors = (
  expression: string,
  startIndex: number,
) => {
  let index = startIndex
  let end = startIndex
  let discountPower = 0
  let accumulationFactor = 1
  const accumulationLatexParts: string[] = []

  const consumeSoftMultiplication = () => {
    while (index < expression.length) {
      const remaining = expression.slice(index)
      const match = remaining.match(/^(?:\s|\\,|\\;|\\:|\\!|\\cdot|\*)+/)

      if (!match) break

      index += match[0].length
    }
  }

  const parseDiscountPower = (
    placeholderPower: string | undefined,
    bracedPower: string | undefined,
    plainPower: string | undefined,
  ) => {
    const powerText = placeholderPower ?? bracedPower ?? plainPower
    const parsedPower = powerText ? Number.parseFloat(powerText) : 1

    return Number.isFinite(parsedPower) ? parsedPower : 1
  }

  while (index < expression.length) {
    const beforeSoftMultiplication = index

    consumeSoftMultiplication()

    const remaining = expression.slice(index)

    const discountMatch = remaining.match(
      /^v(?:\^\{(?:\\placeholder\[[^\]]+\]\{([^}]*)\}|([-+]?\d*\.?\d+))\}|\^([-+]?\d*\.?\d+))?/i,
    )

    if (discountMatch) {
      discountPower += parseDiscountPower(
        discountMatch[1],
        discountMatch[2],
        discountMatch[3],
      )

      index += discountMatch[0].length
      end = index
      continue
    }

    const accumulationMatch = remaining.match(ACCUMULATION_FACTOR_START_REGEX)

    if (accumulationMatch) {
      const { iText, kText } = getAccumulationMatchValues(accumulationMatch)

      accumulationFactor *= getAccumulationFactorValue(iText, kText)
      accumulationLatexParts.push(getAccumulationFactorLatex(iText, kText))

      index += accumulationMatch[0].length
      end = index
      continue
    }

    index = beforeSoftMultiplication
    break
  }

  return {
    discountPower,
    accumulationFactor,
    accumulationLatex: accumulationLatexParts.join(""),
    end,
    hasTrailingFactor: end > startIndex,
  }
}

export const getAdjacentTrailingDiscountPowerAfterToken = (
  expression: string,
  token: AnnuityToken,
) => {
  const annuityEndIndex = getAnnuityEndIndexFromExpression(expression, token)

  return getAdjacentTrailingFactors(expression, annuityEndIndex).discountPower
}

export const getAdjacentTrailingAccumulationFactorAfterToken = (
  expression: string,
  token: AnnuityToken,
) => {
  const annuityEndIndex = getAnnuityEndIndexFromExpression(expression, token)

  return getAdjacentTrailingFactors(expression, annuityEndIndex)
    .accumulationFactor
}

export const getAdjacentTrailingAccumulationLatexAfterToken = (
  expression: string,
  token: AnnuityToken,
) => {
  const annuityEndIndex = getAnnuityEndIndexFromExpression(expression, token)

  return getAdjacentTrailingFactors(expression, annuityEndIndex)
    .accumulationLatex
}

export const getReplacementEndAfterTrailingFactors = (
  expression: string,
  token: AnnuityToken,
) => {
  const annuityEndIndex = getAnnuityEndIndexFromExpression(expression, token)
  const trailingFactors = getAdjacentTrailingFactors(expression, annuityEndIndex)

  return trailingFactors.hasTrailingFactor ? trailingFactors.end : annuityEndIndex
}

export const getReplacementEndAfterTrailingDiscounts =
  getReplacementEndAfterTrailingFactors

export const getPaymentPrefixBeforeToken = (
  expression: string,
  token: AnnuityToken,
) => {
  const baseRange = getAnnuityBaseRangeFromPrompt(expression, token)

  if (!baseRange) {
    const tokenStartIndex = findTokenStartIndex(expression, token)

    return {
      sign: 1 as const,
      coefficient: 1,
      discountPower: 0,
      accumulationFactor: 1,
      accumulationLatex: "",
      hasVariable: false,
      prefixStart: Math.max(0, tokenStartIndex),
    }
  }

  let operatorIndex = baseRange.start - 1

  while (
    operatorIndex >= 0 &&
    expression[operatorIndex] !== "+" &&
    expression[operatorIndex] !== "-" &&
    expression[operatorIndex] !== "="
  ) {
    operatorIndex -= 1
  }

  const prefixStart = operatorIndex + 1
  const sign = expression[operatorIndex] === "-" ? -1 : 1

  const rawPrefix = expression.slice(prefixStart, baseRange.end)

  const prefixDiscounts = collectDiscountPowers(rawPrefix)
  const prefixAccumulations = collectAccumulationFactors(
    prefixDiscounts.latexWithoutDiscounts,
  )

  const cleanedPrefix = prefixAccumulations.latexWithoutAccumulations
    .replace(/\\left/g, "")
    .replace(/\\right/g, "")
    .replace(/\\,/g, "")
    .replace(/\\;/g, "")
    .replace(/\\:/g, "")
    .replace(/\\!/g, "")
    .replace(/\\quad/g, "")
    .replace(/\\qquad/g, "")
    .replace(/\\cdot/g, "")
    .replace(/\\ddot\{?[as]\}?/g, "")
    .replace(/\\bar\{?[as]\}?/g, "")
    .replace(/I\\ddot\{?[as]\}?/g, "")
    .replace(/I\\ddot[as]/g, "")
    .replace(/Ia/g, "")
    .replace(/Is/g, "")
    .replace(/[as]/g, "")
    .replace(/[{}\s()*·]/g, "")

  const hasVariable = /x/i.test(cleanedPrefix)

  const coefficientText = cleanedPrefix
    .replace(/x/gi, "")
    .replace(/[^\d.]/g, "")

  const parsedCoefficient = coefficientText
    ? Number.parseFloat(coefficientText)
    : 1

  return {
    sign: sign as 1 | -1,
    coefficient:
      Number.isFinite(parsedCoefficient) && parsedCoefficient > 0
        ? parsedCoefficient
        : 1,
    discountPower:
      Number.isFinite(prefixDiscounts.discountPower) &&
      prefixDiscounts.discountPower > 0
        ? prefixDiscounts.discountPower
        : 0,
    accumulationFactor:
      Number.isFinite(prefixAccumulations.accumulationFactor) &&
      prefixAccumulations.accumulationFactor > 0
        ? prefixAccumulations.accumulationFactor
        : 1,
    accumulationLatex: prefixAccumulations.accumulationLatex,
    hasVariable,
    prefixStart,
  }
}

export const getSignAndCoefficientBeforeToken = (
  expression: string,
  token: AnnuityToken,
) => {
  const prefix = getPaymentPrefixBeforeToken(expression, token)

  return {
    sign: prefix.sign,
    coefficient: prefix.coefficient,
  }
}

export const getPaymentAmountBeforeToken = (
  expression: string,
  token: AnnuityToken,
) => {
  return getSignAndCoefficientBeforeToken(expression, token).coefficient
}