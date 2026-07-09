import CalculationDisplay from "./CalculationDisplay"
import FormulaEquivalentDropdown from "./FormulaEquivalentDropdown"
import TimeChart from "./TimeChart"
import AnnuityActionButtons from "./AnnuityActionButtons"
import AnnuityButtonPanel from "./AnnuityButtonPanel"
import AnnuityMathField from "./AnnuityMathField"
import { useAnnuityCalculator } from "./useAnnuityCalculator"

function AnnuityCalculator() {
  const {
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
  } = useAnnuityCalculator()

  return (
    <div className="flex h-full w-full flex-col overflow-visible rounded-2xl border border-border bg-background p-4 text-[11px]">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <TimeChart series={paymentSeries} />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex min-h-[140px] items-center justify-center rounded-2xl border border-border bg-card p-4">
            <AnnuityMathField
              ref={mathFieldRef}
              value={expression}
              onBeforeInput={handleBeforeInput}
              onInput={handleInput}
              className="min-h-[86px] w-full rounded-xl border border-border bg-background px-4 py-5 text-center text-2xl outline-none transition focus-within:border-primary"
            />
          </div>

          <CalculationDisplay result={calculationResult} />
        </div>

        <FormulaEquivalentDropdown latex={formulaLatex} rateItems={rateItems} />

        <AnnuityButtonPanel
          onInsertAnnuity={insertAnnuity}
          onInsertDiscountToken={insertDiscountToken}
          onInsertAccumulationToken={insertAccumulationToken}
        />

        <AnnuityActionButtons
          onBackspace={backspaceExpression}
          onClear={clearExpression}
        />
      </div>
    </div>
  )
}

export default AnnuityCalculator