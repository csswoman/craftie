export function PaletteCanvasNotices({
  contrastFailure,
  warnings = [],
}: {
  contrastFailure: boolean;
  warnings?: string[];
}) {
  if (!contrastFailure) {
    return null;
  }

  return (
    <div className="absolute left-4 top-4 z-30 grid max-w-sm gap-2">
      <div
        role="alert"
        className="rounded-lg border border-fail/30 bg-bg/95 px-3 py-2 text-[0.75rem] font-semibold text-fail"
      >
        <p>Hay pares de contraste que no alcanzan AA. Toca el rol marcado para corregirlo en contexto.</p>
        {warnings.length > 0 ? (
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4 font-medium text-fail/90">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
