type AnnuityActionButtonsProps = {
  onBackspace: () => void
  onClear: () => void
}

function AnnuityActionButtons({
  onBackspace,
  onClear,
}: AnnuityActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onBackspace()
        }}
        className="rounded-2xl border border-border bg-muted px-4 py-3 font-medium transition hover:bg-muted/80 active:scale-[0.98]"
      >
        Backspace
      </button>

      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onClear()
        }}
        className="rounded-2xl border border-border bg-destructive px-4 py-3 font-medium text-destructive-foreground transition hover:bg-destructive/90 active:scale-[0.98]"
      >
        Clear
      </button>
    </div>
  )
}

export default AnnuityActionButtons