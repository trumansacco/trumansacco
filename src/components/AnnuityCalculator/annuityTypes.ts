export type MathFieldElement = HTMLElement & {
  value: string
  position?: number
  lastOffset?: number
  setOptions?: (options: Record<string, unknown>) => void
  insert?: (
    latex: string,
    options?: {
      selectionMode?: "placeholder" | "after" | "before" | "item"
      insertionMode?:
        | "replaceSelection"
        | "replaceAll"
        | "insertBefore"
        | "insertAfter"
      focus?: boolean
    },
  ) => boolean
  executeCommand?: (command: string | [string, string]) => void
  focus?: (options?: FocusOptions) => void
  getPromptRange?: (id: string) => [number, number]
  getPrompts?: () => string[]
  getPromptValue?: (id: string, format?: string) => string
}

export type AnnuityKind =
  | "immediate"
  | "due"
  | "continuous"
  | "deferredContinuous"
  | "deferred"
  | "deferredDue"
  | "perpetuity"
  | "perpetuityDue"
  | "deferredPerpetuity"
  | "deferredPerpetuityDue"
  | "increasingImmediate"
  | "increasingDue"
  | "deferredIncreasingImmediate"
  | "deferredIncreasingDue"
  | "increasingAccumulated"
  | "sContinuous"
  | "sDeferredContinuous"
  | "sIncreasingDue"
  | "sDeferredIncreasingImmediate"
  | "sDeferredIncreasingDue"
  | "increasingPerpetuity"
  | "increasingPerpetuityDue"
  | "deferredIncreasingPerpetuity"
  | "deferredIncreasingPerpetuityDue"
  | "sImmediate"
  | "sDue"
  | "sDeferred"
  | "sDeferredDue"

export type AnnuityToken = {
  id: number
  kind: AnnuityKind
  start: number
  mPromptId?: string
  nPromptId: string
  iPromptId: string
  mRange: [number, number] | null
  nRange: [number, number] | null
  iRange: [number, number] | null
  end: number
}

export type DiscountToken = {
  id: number
  promptId: string
  start: number
  exponentRange: [number, number] | null
  end: number
}

export type AccumulationToken = {
  id: number
  iPromptId: string
  kPromptId: string
  start: number
  iRange: [number, number] | null
  kRange: [number, number] | null
  end: number
}

export type BeforeInputState = {
  value: string
  position: number
  lastOffset: number
}

export type PaymentEvent = {
  time: number
  amount: number
}

export type PaymentSeries = {
  tokenId: number
  kind: AnnuityKind
  label: string
  amount: number
  n: number
  m: number
  events: PaymentEvent[]
  iLabel?: string
  valuationDirection?: "present" | "future"
  paymentTiming?: "immediate" | "due" | "continuous"
  continuousStart?: number
  continuousEnd?: number
  isPerpetuity?: boolean
  infinityAfter?: number
}