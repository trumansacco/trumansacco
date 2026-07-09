import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"

import {
  buildFormulaEquivalentLatex,
  buildInterestRateEquivalentItems,
  type InterestRateEquivalentItem,
} from "./FormulaEquivalentDropdown"
import type {
  AccumulationToken,
  AnnuityKind,
  AnnuityToken,
  BeforeInputState,
  DiscountToken,
  MathFieldElement,
  PaymentSeries,
} from "./annuityTypes"
import {
  getDiscountPrefixRangeBeforeToken,
  isDeferredKind,
  isPerpetuityKind,
  kindLabel,
  makeAnnuityLatex,
} from "./annuityHelpers"
import { calculateExpressionValue } from "./annuityValueHelpers"
import { buildPaymentSeries } from "./buildPaymentSeries"

const createEmptyCalculationResult = () =>
  calculateExpressionValue({
    expression: "",
    tokens: [],
    getPromptValue: () => "",
    getLabel: (kind) => kindLabel[kind],
  })

export function useAnnuityCalculator() {
  const mathFieldRef = useRef<MathFieldElement | null>(null)
  const annuityTokensRef = useRef<AnnuityToken[]>([])
  const discountTokensRef = useRef<DiscountToken[]>([])
  const accumulationTokensRef = useRef<AccumulationToken[]>([])
  const nextAnnuityIdRef = useRef(1)
  const nextDiscountIdRef = useRef(1)
  const nextAccumulationIdRef = useRef(1)

  const beforeInputRef = useRef<BeforeInputState>({
    value: "",
    position: 0,
    lastOffset: 0,
  })

  const [expression, setExpression] = useState("")
  const [paymentSeries, setPaymentSeries] = useState<PaymentSeries[]>([])
  const [formulaLatex, setFormulaLatex] = useState("")
  const [rateItems, setRateItems] = useState<InterestRateEquivalentItem[]>([])
  const [calculationResult, setCalculationResult] = useState(
    createEmptyCalculationResult,
  )

  const getMathField = () => mathFieldRef.current

  const preserveScroll = () => {
    const x = window.scrollX
    const y = window.scrollY

    return () => {
      window.scrollTo(x, y)

      requestAnimationFrame(() => {
        window.scrollTo(x, y)
      })
    }
  }

  const focusMathField = () => {
    const mathField = getMathField()
    if (!mathField) return

    mathField.focus?.({ preventScroll: true })
  }

  const getRange = (id?: string): [number, number] | null => {
    if (!id) return null

    const mathField = getMathField()
    if (!mathField?.getPromptRange) return null

    try {
      const range = mathField.getPromptRange(id)

      if (!range || range.length !== 2) return null

      return range
    } catch {
      return null
    }
  }

  const getPromptValue = (id?: string) => {
    const mathField = getMathField()
    if (!id || !mathField?.getPromptValue) return ""

    try {
      return mathField.getPromptValue(id) ?? ""
    } catch {
      return ""
    }
  }

  const makeDiscountLatex = (id: number) => {
    return `v^{\\placeholder[v${id}]{}}`
  }

  const makeAccumulationLatex = (id: number) => {
    return `\\left(1+\\placeholder[ai${id}]{}\\right)^{\\placeholder[ak${id}]{}}`
  }

  const rebuildDiscountTokens = () => {
    const rebuiltTokens = discountTokensRef.current
      .map((token) => {
        const exponentRange = getRange(token.promptId)

        if (!exponentRange) return null

        return {
          ...token,
          exponentRange,
        }
      })
      .filter((token): token is DiscountToken => token !== null)
      .sort((a, b) => a.start - b.start)

    discountTokensRef.current = rebuiltTokens
    return rebuiltTokens
  }

  const rebuildAccumulationTokens = () => {
    const rebuiltTokens = accumulationTokensRef.current
      .map((token) => {
        const iRange = getRange(token.iPromptId)
        const kRange = getRange(token.kPromptId)

        if (!iRange && !kRange) return null

        return {
          ...token,
          iRange,
          kRange,
        }
      })
      .filter((token): token is AccumulationToken => token !== null)
      .sort((a, b) => a.start - b.start)

    accumulationTokensRef.current = rebuiltTokens
    return rebuiltTokens
  }

  const shiftTokenCollectionAfterInput = <
    T extends { start: number; end: number },
  >(
    tokens: T[],
    oldPosition: number,
    delta: number,
  ) => {
    return tokens.map((token) => {
      if (oldPosition <= token.start) {
        return {
          ...token,
          start: token.start + delta,
          end: token.end + delta,
        }
      }

      if (oldPosition > token.start && oldPosition < token.end) {
        return {
          ...token,
          end: token.end + delta,
        }
      }

      return token
    })
  }

  const rebuildAnnuityTokens = () => {
    const rebuiltTokens = annuityTokensRef.current
      .map((token) => {
        const mRange = getRange(token.mPromptId)
        const nRange = getRange(token.nPromptId)
        const iRange = getRange(token.iPromptId)

        if (!mRange && !nRange && !iRange) return null

        return {
          ...token,
          mRange,
          nRange,
          iRange,
        }
      })
      .filter((token): token is AnnuityToken => token !== null)
      .sort((a, b) => a.start - b.start)

    annuityTokensRef.current = rebuiltTokens
    return rebuiltTokens
  }

  const updateCalculatorState = () => {
    const mathField = getMathField()
    if (!mathField) return

    const tokens = rebuildAnnuityTokens()
    rebuildDiscountTokens()
    rebuildAccumulationTokens()

    const currentExpression = mathField.value ?? ""

    setExpression(currentExpression)

    setPaymentSeries(
      buildPaymentSeries({
        expression: currentExpression,
        tokens,
        getPromptValue,
      }),
    )

    setCalculationResult(
      calculateExpressionValue({
        expression: currentExpression,
        tokens,
        getPromptValue,
        getLabel: (kind) => kindLabel[kind],
      }),
    )

    setFormulaLatex(
      buildFormulaEquivalentLatex({
        expression: currentExpression,
        tokens,
        getPromptValue,
      }),
    )

    setRateItems(
      buildInterestRateEquivalentItems({
        tokens,
        getPromptValue,
      }),
    )
  }

  const setCaretPosition = (position: number) => {
    const mathField = getMathField()
    if (!mathField) return

    focusMathField()

    mathField.position = Math.max(
      0,
      Math.min(position, mathField.lastOffset ?? 0),
    )

    updateCalculatorState()
  }

  const shiftTokensAfterInput = (
    oldPosition: number,
    oldLastOffset: number,
    newLastOffset: number,
  ) => {
    const delta = newLastOffset - oldLastOffset
    if (delta === 0) return

    annuityTokensRef.current = shiftTokenCollectionAfterInput(
      annuityTokensRef.current,
      oldPosition,
      delta,
    )

    discountTokensRef.current = shiftTokenCollectionAfterInput(
      discountTokensRef.current,
      oldPosition,
      delta,
    )

    accumulationTokensRef.current = shiftTokenCollectionAfterInput(
      accumulationTokensRef.current,
      oldPosition,
      delta,
    )
  }

  const insertMathSpace = () => {
    const mathField = getMathField()
    if (!mathField) return false

    beforeInputRef.current = {
      value: mathField.value ?? "",
      position: mathField.position ?? 0,
      lastOffset: mathField.lastOffset ?? 0,
    }

    let inserted = false

    if (mathField.insert) {
      inserted = mathField.insert("\\,", {
        selectionMode: "after",
        insertionMode: "replaceSelection",
        focus: true,
      })
    }

    if (!inserted) {
      mathField.executeCommand?.(["insert", "\\,"])
    }

    requestAnimationFrame(() => {
      const newLastOffset = mathField.lastOffset ?? 0

      shiftTokensAfterInput(
        beforeInputRef.current.position,
        beforeInputRef.current.lastOffset,
        newLastOffset,
      )

      updateCalculatorState()

      beforeInputRef.current = {
        value: mathField.value ?? "",
        position: mathField.position ?? 0,
        lastOffset: mathField.lastOffset ?? 0,
      }
    })

    return true
  }

  const getTokenStops = (token: AnnuityToken) => {
    const mathField = getMathField()
    const currentExpression = mathField?.value ?? ""
    const stops: number[] = []

    const discountRange = getDiscountPrefixRangeBeforeToken(
      currentExpression,
      token,
    )

    if (discountRange) {
      stops.push(
        discountRange.start,
        discountRange.exponentStart,
        discountRange.exponentEnd,
        discountRange.end,
      )
    }

    stops.push(token.start)

    if (isDeferredKind(token.kind) && token.mRange) {
      stops.push(token.mRange[0], token.mRange[1])
    }

    if (token.nRange) {
      stops.push(token.nRange[0], token.nRange[1])
    }

    if (token.iRange) {
      stops.push(token.iRange[0], token.iRange[1])
    }

    stops.push(token.end)

    return stops
      .filter((stop) => Number.isFinite(stop))
      .filter((stop, index, allStops) => allStops.indexOf(stop) === index)
      .sort((a, b) => a - b)
  }

  const getDiscountTokenStops = (token: DiscountToken) => {
    const stops: number[] = [token.start]

    if (token.exponentRange) {
      stops.push(token.exponentRange[0], token.exponentRange[1])
    }

    stops.push(token.end)

    return stops
      .filter((stop) => Number.isFinite(stop))
      .filter((stop, index, allStops) => allStops.indexOf(stop) === index)
      .sort((a, b) => a - b)
  }

  const getAccumulationTokenStops = (token: AccumulationToken) => {
    const stops: number[] = [token.start]

    if (token.iRange) {
      stops.push(token.iRange[0], token.iRange[1])
    }

    if (token.kRange) {
      stops.push(token.kRange[0], token.kRange[1])
    }

    stops.push(token.end)

    return stops
      .filter((stop) => Number.isFinite(stop))
      .filter((stop, index, allStops) => allStops.indexOf(stop) === index)
      .sort((a, b) => a - b)
  }

  const moveThroughDiscountToken = (key: "ArrowLeft" | "ArrowRight") => {
    const mathField = getMathField()
    if (!mathField) return false

    const tokens = rebuildDiscountTokens()
    const position = mathField.position ?? 0

    for (const token of tokens) {
      const promptRange = token.exponentRange

      if (promptRange) {
        const [start, end] = promptRange

        const shouldLetMathLiveHandleArrow =
          key === "ArrowLeft"
            ? position > start && position <= end
            : position >= start && position < end

        if (shouldLetMathLiveHandleArrow) {
          return false
        }
      }

      const stops = getDiscountTokenStops(token)
      const index = stops.indexOf(position)

      if (index === -1) continue

      if (key === "ArrowRight" && index < stops.length - 1) {
        setCaretPosition(stops[index + 1])
        return true
      }

      if (key === "ArrowLeft" && index > 0) {
        setCaretPosition(stops[index - 1])
        return true
      }
    }

    return false
  }

  const moveThroughAccumulationToken = (key: "ArrowLeft" | "ArrowRight") => {
    const mathField = getMathField()
    if (!mathField) return false

    const tokens = rebuildAccumulationTokens()
    const position = mathField.position ?? 0

    for (const token of tokens) {
      const promptRanges = [token.iRange, token.kRange].filter(
        (range): range is [number, number] => range !== null,
      )

      const shouldLetMathLiveHandleArrow = promptRanges.some(([start, end]) => {
        if (key === "ArrowLeft") {
          return position > start && position <= end
        }

        return position >= start && position < end
      })

      if (shouldLetMathLiveHandleArrow) {
        return false
      }

      const stops = getAccumulationTokenStops(token)
      const index = stops.indexOf(position)

      if (index === -1) continue

      if (key === "ArrowRight" && index < stops.length - 1) {
        setCaretPosition(stops[index + 1])
        return true
      }

      if (key === "ArrowLeft" && index > 0) {
        setCaretPosition(stops[index - 1])
        return true
      }
    }

    return false
  }

  const moveThroughAnnuity = (key: "ArrowLeft" | "ArrowRight") => {
    const mathField = getMathField()
    if (!mathField) return false

    const tokens = rebuildAnnuityTokens()
    rebuildDiscountTokens()
    rebuildAccumulationTokens()

    const currentExpression = mathField.value ?? ""
    const position = mathField.position ?? 0

    for (const token of tokens) {
      const discountRange = getDiscountPrefixRangeBeforeToken(
        currentExpression,
        token,
      )

      const promptRanges = [
        discountRange
          ? ([discountRange.exponentStart, discountRange.exponentEnd] as [
              number,
              number,
            ])
          : null,
        token.mRange,
        token.nRange,
        token.iRange,
      ].filter((range): range is [number, number] => range !== null)

      const shouldLetMathLiveHandleArrow = promptRanges.some(([start, end]) => {
        if (key === "ArrowLeft") {
          return position > start && position <= end
        }

        return position >= start && position < end
      })

      if (shouldLetMathLiveHandleArrow) {
        return false
      }

      const stops = getTokenStops(token)
      const index = stops.indexOf(position)

      if (index === -1) continue

      if (key === "ArrowRight" && index < stops.length - 1) {
        setCaretPosition(stops[index + 1])
        return true
      }

      if (key === "ArrowLeft" && index > 0) {
        setCaretPosition(stops[index - 1])
        return true
      }
    }

    return false
  }

  const moveOutOfTrackedTokenBeforeInsert = () => {
    const mathField = getMathField()
    if (!mathField) return

    const annuityTokens = rebuildAnnuityTokens()
    const discountTokens = rebuildDiscountTokens()
    const accumulationTokens = rebuildAccumulationTokens()
    const position = mathField.position ?? 0

    const containingAnnuityToken = annuityTokens.find(
      (token) => position > token.start && position < token.end,
    )

    if (containingAnnuityToken) {
      mathField.position = containingAnnuityToken.end
      return
    }

    const containingDiscountToken = discountTokens.find(
      (token) => position > token.start && position < token.end,
    )

    if (containingDiscountToken) {
      mathField.position = containingDiscountToken.end
      return
    }

    const containingAccumulationToken = accumulationTokens.find(
      (token) => position > token.start && position < token.end,
    )

    if (containingAccumulationToken) {
      mathField.position = containingAccumulationToken.end
    }
  }

  const deleteWholeAnnuityIfAtEnd = () => {
    const mathField = getMathField()
    if (!mathField) return false

    const tokens = rebuildAnnuityTokens()
    const position = mathField.position ?? 0

    const tokenToDelete = [...tokens]
      .reverse()
      .find((token) => position === token.end)

    if (!tokenToDelete) return false

    const beforeLastOffset = mathField.lastOffset ?? 0

    let safetyCounter = 0

    while (
      (mathField.position ?? 0) > tokenToDelete.start &&
      safetyCounter < 150
    ) {
      const beforeValue = mathField.value ?? ""
      const beforePosition = mathField.position ?? 0

      mathField.executeCommand?.("deleteBackward")

      const afterValue = mathField.value ?? ""
      const afterPosition = mathField.position ?? 0

      if (beforeValue === afterValue && beforePosition === afterPosition) {
        break
      }

      safetyCounter++
    }

    const afterLastOffset = mathField.lastOffset ?? 0
    const delta = afterLastOffset - beforeLastOffset

    annuityTokensRef.current = annuityTokensRef.current
      .filter((token) => token.id !== tokenToDelete.id)
      .map((token) => {
        if (token.start > tokenToDelete.start) {
          return {
            ...token,
            start: token.start + delta,
            end: token.end + delta,
          }
        }

        return token
      })

    discountTokensRef.current = discountTokensRef.current.map((token) => {
      if (token.start > tokenToDelete.start) {
        return {
          ...token,
          start: token.start + delta,
          end: token.end + delta,
        }
      }

      return token
    })

    accumulationTokensRef.current = accumulationTokensRef.current.map((token) => {
      if (token.start > tokenToDelete.start) {
        return {
          ...token,
          start: token.start + delta,
          end: token.end + delta,
        }
      }

      return token
    })

    updateCalculatorState()

    return true
  }

  const deleteWholeDiscountTokenIfAtEnd = () => {
    const mathField = getMathField()
    if (!mathField) return false

    const tokens = rebuildDiscountTokens()
    const position = mathField.position ?? 0

    const tokenToDelete = [...tokens]
      .reverse()
      .find((token) => position === token.end)

    if (!tokenToDelete) return false

    const beforeLastOffset = mathField.lastOffset ?? 0

    let safetyCounter = 0

    while (
      (mathField.position ?? 0) > tokenToDelete.start &&
      safetyCounter < 150
    ) {
      const beforeValue = mathField.value ?? ""
      const beforePosition = mathField.position ?? 0

      mathField.executeCommand?.("deleteBackward")

      const afterValue = mathField.value ?? ""
      const afterPosition = mathField.position ?? 0

      if (beforeValue === afterValue && beforePosition === afterPosition) {
        break
      }

      safetyCounter++
    }

    const afterLastOffset = mathField.lastOffset ?? 0
    const delta = afterLastOffset - beforeLastOffset

    discountTokensRef.current = discountTokensRef.current
      .filter((token) => token.id !== tokenToDelete.id)
      .map((token) => {
        if (token.start > tokenToDelete.start) {
          return {
            ...token,
            start: token.start + delta,
            end: token.end + delta,
          }
        }

        return token
      })

    annuityTokensRef.current = annuityTokensRef.current.map((token) => {
      if (token.start > tokenToDelete.start) {
        return {
          ...token,
          start: token.start + delta,
          end: token.end + delta,
        }
      }

      if (token.start < tokenToDelete.start && token.end > tokenToDelete.start) {
        return {
          ...token,
          end: token.end + delta,
        }
      }

      return token
    })

    accumulationTokensRef.current = accumulationTokensRef.current.map((token) => {
      if (token.start > tokenToDelete.start) {
        return {
          ...token,
          start: token.start + delta,
          end: token.end + delta,
        }
      }

      return token
    })

    updateCalculatorState()

    return true
  }

  const deleteWholeAccumulationTokenIfAtEnd = () => {
    const mathField = getMathField()
    if (!mathField) return false

    const tokens = rebuildAccumulationTokens()
    const position = mathField.position ?? 0

    const tokenToDelete = [...tokens]
      .reverse()
      .find((token) => position === token.end)

    if (!tokenToDelete) return false

    const beforeLastOffset = mathField.lastOffset ?? 0

    let safetyCounter = 0

    while (
      (mathField.position ?? 0) > tokenToDelete.start &&
      safetyCounter < 150
    ) {
      const beforeValue = mathField.value ?? ""
      const beforePosition = mathField.position ?? 0

      mathField.executeCommand?.("deleteBackward")

      const afterValue = mathField.value ?? ""
      const afterPosition = mathField.position ?? 0

      if (beforeValue === afterValue && beforePosition === afterPosition) {
        break
      }

      safetyCounter++
    }

    const afterLastOffset = mathField.lastOffset ?? 0
    const delta = afterLastOffset - beforeLastOffset

    accumulationTokensRef.current = accumulationTokensRef.current
      .filter((token) => token.id !== tokenToDelete.id)
      .map((token) => {
        if (token.start > tokenToDelete.start) {
          return {
            ...token,
            start: token.start + delta,
            end: token.end + delta,
          }
        }

        return token
      })

    annuityTokensRef.current = annuityTokensRef.current.map((token) => {
      if (token.start > tokenToDelete.start) {
        return {
          ...token,
          start: token.start + delta,
          end: token.end + delta,
        }
      }

      if (token.start < tokenToDelete.start && token.end > tokenToDelete.start) {
        return {
          ...token,
          end: token.end + delta,
        }
      }

      return token
    })

    discountTokensRef.current = discountTokensRef.current.map((token) => {
      if (token.start > tokenToDelete.start) {
        return {
          ...token,
          start: token.start + delta,
          end: token.end + delta,
        }
      }

      return token
    })

    updateCalculatorState()

    return true
  }

  useEffect(() => {
    const mathField = getMathField()
    if (!mathField) return

    mathField.setOptions?.({
      virtualKeyboardMode: "manual",
      smartFence: true,
      smartMode: false,
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      const path = event.composedPath()
      const isInsideMathField =
        document.activeElement === mathField || path.includes(mathField)

      if (!isInsideMathField) return

      beforeInputRef.current = {
        value: mathField.value ?? "",
        position: mathField.position ?? 0,
        lastOffset: mathField.lastOffset ?? 0,
      }

      const isHandledKey =
        event.key === "Backspace" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.code === "Space" ||
        event.key.toLowerCase() === "v"

      if (!isHandledKey) return

      const restoreScroll = preserveScroll()

      if (event.key.toLowerCase() === "v" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()

        insertDiscountToken()
        restoreScroll()

        return
      }

      if (event.code === "Space") {
        const insertedSpace = insertMathSpace()

        if (insertedSpace) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          restoreScroll()
        }

        return
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const moved =
          moveThroughDiscountToken(event.key) ||
          moveThroughAccumulationToken(event.key) ||
          moveThroughAnnuity(event.key)

        if (moved) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          restoreScroll()
        }

        return
      }

      const deletedWholeToken =
        deleteWholeDiscountTokenIfAtEnd() ||
        deleteWholeAccumulationTokenIfAtEnd() ||
        deleteWholeAnnuityIfAtEnd()

      if (!deletedWholeToken) return

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      restoreScroll()
    }

    const handleSelectionChange = () => {
      updateCalculatorState()
    }

    const handlePointerUp = () => {
      requestAnimationFrame(updateCalculatorState)
    }

    const handleKeyUp = () => {
      requestAnimationFrame(updateCalculatorState)
    }

    document.addEventListener("keydown", handleKeyDown, true)
    mathField.addEventListener("selection-change", handleSelectionChange)
    mathField.addEventListener("pointerup", handlePointerUp)
    mathField.addEventListener("keyup", handleKeyUp)

    updateCalculatorState()

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
      mathField.removeEventListener("selection-change", handleSelectionChange)
      mathField.removeEventListener("pointerup", handlePointerUp)
      mathField.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const insertAnnuity = (kind: AnnuityKind) => {
    const mathField = getMathField()
    if (!mathField) return

    const restoreScroll = preserveScroll()

    focusMathField()
    moveOutOfTrackedTokenBeforeInsert()

    const id = nextAnnuityIdRef.current
    nextAnnuityIdRef.current += 1

    const latex = makeAnnuityLatex(id, kind)
    const start = mathField.position ?? mathField.lastOffset ?? 0
    const beforeLastOffset = mathField.lastOffset ?? 0

    let inserted = false

    if (mathField.insert) {
      inserted = mathField.insert(latex, {
        selectionMode: "after",
        insertionMode: "replaceSelection",
        focus: true,
      })
    }

    if (!inserted) {
      mathField.executeCommand?.(["insert", latex])
    }

    restoreScroll()

    requestAnimationFrame(() => {
      focusMathField()

      const afterLastOffset = mathField.lastOffset ?? beforeLastOffset
      const delta = afterLastOffset - beforeLastOffset
      const end = start + delta

      annuityTokensRef.current = shiftTokenCollectionAfterInput(
        annuityTokensRef.current,
        start,
        delta,
      )

      discountTokensRef.current = shiftTokenCollectionAfterInput(
        discountTokensRef.current,
        start,
        delta,
      )

      accumulationTokensRef.current = shiftTokenCollectionAfterInput(
        accumulationTokensRef.current,
        start,
        delta,
      )

      const mPromptId = isDeferredKind(kind) ? `m${id}` : undefined
      const nPromptId = isPerpetuityKind(kind) ? "" : `n${id}`
      const iPromptId = `i${id}`

      const mRange = getRange(mPromptId)
      const nRange = getRange(nPromptId)
      const iRange = getRange(iPromptId)

      annuityTokensRef.current = [
        ...annuityTokensRef.current,
        {
          id,
          kind,
          start,
          mPromptId,
          nPromptId,
          iPromptId,
          mRange,
          nRange,
          iRange,
          end,
        },
      ].sort((a, b) => a.start - b.start)

      if (mRange) {
        mathField.position = mRange[0]
      } else if (nRange) {
        mathField.position = nRange[0]
      } else if (iRange) {
        mathField.position = iRange[0]
      }

      beforeInputRef.current = {
        value: mathField.value ?? "",
        position: mathField.position ?? 0,
        lastOffset: mathField.lastOffset ?? 0,
      }

      updateCalculatorState()
      restoreScroll()
    })
  }

  const insertDiscountToken = () => {
    const mathField = getMathField()
    if (!mathField) return

    const restoreScroll = preserveScroll()

    focusMathField()
    moveOutOfTrackedTokenBeforeInsert()

    const id = nextDiscountIdRef.current
    nextDiscountIdRef.current += 1

    const promptId = `v${id}`
    const latex = makeDiscountLatex(id)
    const start = mathField.position ?? mathField.lastOffset ?? 0
    const beforeLastOffset = mathField.lastOffset ?? 0

    let inserted = false

    if (mathField.insert) {
      inserted = mathField.insert(latex, {
        selectionMode: "after",
        insertionMode: "replaceSelection",
        focus: true,
      })
    }

    if (!inserted) {
      mathField.executeCommand?.(["insert", latex])
    }

    restoreScroll()

    requestAnimationFrame(() => {
      focusMathField()

      const afterLastOffset = mathField.lastOffset ?? beforeLastOffset
      const delta = afterLastOffset - beforeLastOffset
      const end = start + delta

      annuityTokensRef.current = shiftTokenCollectionAfterInput(
        annuityTokensRef.current,
        start,
        delta,
      )

      discountTokensRef.current = shiftTokenCollectionAfterInput(
        discountTokensRef.current,
        start,
        delta,
      )

      accumulationTokensRef.current = shiftTokenCollectionAfterInput(
        accumulationTokensRef.current,
        start,
        delta,
      )

      const exponentRange = getRange(promptId)

      discountTokensRef.current = [
        ...discountTokensRef.current,
        {
          id,
          promptId,
          start,
          exponentRange,
          end,
        },
      ].sort((a, b) => a.start - b.start)

      if (exponentRange) {
        mathField.position = exponentRange[0]
      }

      beforeInputRef.current = {
        value: mathField.value ?? "",
        position: mathField.position ?? 0,
        lastOffset: mathField.lastOffset ?? 0,
      }

      updateCalculatorState()
      restoreScroll()
    })
  }

  const insertAccumulationToken = () => {
    const mathField = getMathField()
    if (!mathField) return

    const restoreScroll = preserveScroll()

    focusMathField()
    moveOutOfTrackedTokenBeforeInsert()

    const id = nextAccumulationIdRef.current
    nextAccumulationIdRef.current += 1

    const iPromptId = `ai${id}`
    const kPromptId = `ak${id}`
    const latex = makeAccumulationLatex(id)
    const start = mathField.position ?? mathField.lastOffset ?? 0
    const beforeLastOffset = mathField.lastOffset ?? 0

    let inserted = false

    if (mathField.insert) {
      inserted = mathField.insert(latex, {
        selectionMode: "after",
        insertionMode: "replaceSelection",
        focus: true,
      })
    }

    if (!inserted) {
      mathField.executeCommand?.(["insert", latex])
    }

    restoreScroll()

    requestAnimationFrame(() => {
      focusMathField()

      const afterLastOffset = mathField.lastOffset ?? beforeLastOffset
      const delta = afterLastOffset - beforeLastOffset
      const end = start + delta

      annuityTokensRef.current = shiftTokenCollectionAfterInput(
        annuityTokensRef.current,
        start,
        delta,
      )

      discountTokensRef.current = shiftTokenCollectionAfterInput(
        discountTokensRef.current,
        start,
        delta,
      )

      accumulationTokensRef.current = shiftTokenCollectionAfterInput(
        accumulationTokensRef.current,
        start,
        delta,
      )

      const iRange = getRange(iPromptId)
      const kRange = getRange(kPromptId)

      accumulationTokensRef.current = [
        ...accumulationTokensRef.current,
        {
          id,
          iPromptId,
          kPromptId,
          start,
          iRange,
          kRange,
          end,
        },
      ].sort((a, b) => a.start - b.start)

      if (iRange) {
        mathField.position = iRange[0]
      } else if (kRange) {
        mathField.position = kRange[0]
      }

      beforeInputRef.current = {
        value: mathField.value ?? "",
        position: mathField.position ?? 0,
        lastOffset: mathField.lastOffset ?? 0,
      }

      updateCalculatorState()
      restoreScroll()
    })
  }

  const clearExpression = () => {
    const mathField = getMathField()
    if (!mathField) return

    const restoreScroll = preserveScroll()

    mathField.value = ""
    mathField.position = 0
    annuityTokensRef.current = []
    discountTokensRef.current = []
    accumulationTokensRef.current = []
    nextAnnuityIdRef.current = 1
    nextDiscountIdRef.current = 1
    nextAccumulationIdRef.current = 1

    beforeInputRef.current = {
      value: "",
      position: 0,
      lastOffset: 0,
    }

    setExpression("")
    setPaymentSeries([])
    setFormulaLatex("")
    setRateItems([])
    setCalculationResult(createEmptyCalculationResult())

    focusMathField()
    restoreScroll()
  }

  const backspaceExpression = () => {
    const mathField = getMathField()
    if (!mathField) return

    const restoreScroll = preserveScroll()

    focusMathField()

    beforeInputRef.current = {
      value: mathField.value ?? "",
      position: mathField.position ?? 0,
      lastOffset: mathField.lastOffset ?? 0,
    }

    const deletedWholeToken =
      deleteWholeDiscountTokenIfAtEnd() ||
      deleteWholeAccumulationTokenIfAtEnd() ||
      deleteWholeAnnuityIfAtEnd()

    if (deletedWholeToken) {
      restoreScroll()
      return
    }

    mathField.executeCommand?.("deleteBackward")

    requestAnimationFrame(() => {
      const newLastOffset = mathField.lastOffset ?? 0

      shiftTokensAfterInput(
        beforeInputRef.current.position,
        beforeInputRef.current.lastOffset,
        newLastOffset,
      )

      updateCalculatorState()

      beforeInputRef.current = {
        value: mathField.value ?? "",
        position: mathField.position ?? 0,
        lastOffset: mathField.lastOffset ?? 0,
      }

      restoreScroll()
    })
  }

  const handleBeforeInput = (event: FormEvent<HTMLElement>) => {
    const target = event.currentTarget as MathFieldElement

    beforeInputRef.current = {
      value: target.value ?? "",
      position: target.position ?? 0,
      lastOffset: target.lastOffset ?? 0,
    }
  }

  const handleInput = (event: FormEvent<HTMLElement>) => {
    const target = event.currentTarget as MathFieldElement
    const newValue = target.value ?? ""
    const newLastOffset = target.lastOffset ?? 0

    shiftTokensAfterInput(
      beforeInputRef.current.position,
      beforeInputRef.current.lastOffset,
      newLastOffset,
    )

    setExpression(newValue)

    requestAnimationFrame(() => {
      updateCalculatorState()

      beforeInputRef.current = {
        value: target.value ?? "",
        position: target.position ?? 0,
        lastOffset: target.lastOffset ?? 0,
      }
    })
  }

  return {
    mathFieldRef,
    expression,
    paymentSeries,
    formulaLatex,
    rateItems,
    calculationResult,
    insertAnnuity,
    insertDiscountToken,
    insertAccumulationToken,
    clearExpression,
    backspaceExpression,
    handleBeforeInput,
    handleInput,
  }
}