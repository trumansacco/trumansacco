import type { CalculationResult } from "./annuityValueHelpers"

type CalculationDisplayProps = {
  result: CalculationResult
}

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return "Error"

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 6,
  })
}

function CalculationDisplay({ result }: CalculationDisplayProps) {
  const isEquationMode = result.mode === "equation"
  const isNumericSolve = result.solveMethod === "numeric"

  return (
    <div className="flex h-full min-h-[140px] flex-col justify-center rounded-2xl border border-border bg-card p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {isEquationMode ? "Solved Value" : "Calculated Value"}
      </div>

      <div className="mt-2 text-3xl font-semibold">
        {result.error
          ? "Error"
          : isEquationMode
            ? `x = ${formatNumber(result.xValue ?? result.total)}`
            : formatNumber(result.total)}
      </div>

      {result.error && (
        <div className="mt-2 text-xs text-destructive">{result.error}</div>
      )}

      {!result.error && isEquationMode && (
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {isNumericSolve ? (
            <div>
              Solved numerically because{" "}
              <span className="font-mono">x</span> is inside{" "}
              <span className="font-mono">m</span>,{" "}
              <span className="font-mono">n</span>, or{" "}
              <span className="font-mono">i</span>.
            </div>
          ) : (
            <div>
              Solved from{" "}
              <span className="font-mono">
                ({formatNumber(result.leftXCoefficient ?? 0)})x +{" "}
                {formatNumber(result.leftConstant ?? 0)}
              </span>{" "}
              ={" "}
              <span className="font-mono">
                ({formatNumber(result.rightXCoefficient ?? 0)})x +{" "}
                {formatNumber(result.rightConstant ?? 0)}
              </span>
            </div>
          )}

          {result.terms.length > 0 && (
            <div className="pt-1">
              {result.terms.map((term) => (
                <div key={term.tokenId} className="flex justify-between gap-3">
                  <span>
                    {term.sign === -1 ? "- " : "+ "}
                    {term.isVariable ? "x × " : ""}
                    {term.coefficient !== 1 ? `${term.coefficient} × ` : ""}
                    {term.label}
                  </span>
                  <span className="font-mono">
                    {term.isVariable
                      ? `${formatNumber(term.signedValue)}x`
                      : formatNumber(term.signedValue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!result.error && !isEquationMode && result.terms.length > 0 && (
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {result.terms.map((term) => (
            <div key={term.tokenId} className="flex justify-between gap-3">
              <span>
                {term.sign === -1 ? "- " : "+ "}
                {term.coefficient !== 1 ? `${term.coefficient} × ` : ""}
                {term.label}
              </span>
              <span className="font-mono">
                {formatNumber(term.signedValue)}
              </span>
            </div>
          ))}
        </div>
      )}

      {!result.error && !isEquationMode && result.terms.length === 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Enter an annuity with an <span className="font-mono">n</span> and{" "}
          <span className="font-mono">i</span> value, or use{" "}
          <span className="font-mono">x</span> with{" "}
          <span className="font-mono">=</span> to solve.
        </div>
      )}
    </div>
  )
}

export default CalculationDisplay