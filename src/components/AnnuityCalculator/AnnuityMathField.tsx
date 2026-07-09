import React from "react"
import "mathlive"

import type { MathFieldElement } from "./annuityTypes"

type AnnuityMathFieldProps = {
  value: string
  className?: string
  onBeforeInput?: React.FormEventHandler<HTMLElement>
  onInput?: React.FormEventHandler<HTMLElement>
}

const AnnuityMathField = React.forwardRef<
  MathFieldElement,
  AnnuityMathFieldProps
>(function AnnuityMathField({ value, className, onBeforeInput, onInput }, ref) {
  return React.createElement("math-field" as any, {
    ref,
    value,
    className,
    onBeforeInput,
    onInput,
    tabIndex: 0,
  })
})

export default AnnuityMathField