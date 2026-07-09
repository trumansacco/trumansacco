import { InlineMath } from "react-katex"

import type { AnnuityKind } from "./annuityTypes"
import { annuityButtonGroups } from "./annuityHelpers"

type AnnuityButtonPanelProps = {
    onInsertAnnuity: (kind: AnnuityKind) => void
    onInsertDiscountToken: () => void
    onInsertAccumulationToken: () => void
}

function AnnuityButtonPanel({
    onInsertAnnuity,
    onInsertDiscountToken,
    onInsertAccumulationToken,
}: AnnuityButtonPanelProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div>
                    <div className="text-sm font-semibold">Interest Factors</div>
                    <div className="text-xs text-muted-foreground">
                        Move forwards or backwards in time
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    <button
                        type="button"
                        title="Accumulation Factor"
                        onPointerDown={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            onInsertAccumulationToken()
                        }}
                        className="flex min-h-[82px] items-center justify-center rounded-2xl border border-border bg-card px-2 py-4 text-center transition hover:bg-muted active:scale-[0.98]"
                    >
                        <div className="text-[2rem] leading-none [&_.katex]:!text-[1em]">
                            <InlineMath math="(1+i)^{k}" />
                        </div>
                    </button>
                    <button
                        type="button"
                        title="Discount Factor"
                        onPointerDown={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            onInsertDiscountToken()
                        }}
                        className="flex min-h-[82px] items-center justify-center rounded-2xl border border-border bg-card px-2 py-4 text-center transition hover:bg-muted active:scale-[0.98]"
                    >
                        <div className="text-[2rem] leading-none [&_.katex]:!text-[1em]">
                            <InlineMath math="v^{k}" />
                        </div>
                    </button>
                </div>
            </div>

            {annuityButtonGroups.map((group) => (
                <div key={group.title} className="space-y-2">
                    <div>
                        <div className="text-sm font-semibold">{group.title}</div>

                        {group.description && (
                            <div className="text-xs text-muted-foreground">
                                {group.description}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                        {group.buttons.map((button) => (
                            <button
                                key={button.kind}
                                type="button"
                                title={button.label}
                                onPointerDown={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    onInsertAnnuity(button.kind)
                                }}
                                className="flex min-h-[82px] items-center justify-center rounded-2xl border border-border bg-card px-2 py-4 text-center transition hover:bg-muted active:scale-[0.98]"
                            >
                                <div className="text-[2rem] leading-none [&_.katex]:!text-[1em]">
                                    <InlineMath math={button.displayLatex} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AnnuityButtonPanel