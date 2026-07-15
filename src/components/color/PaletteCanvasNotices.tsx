export function PaletteCanvasNotices({
  contrastFailure,
}: {
  contrastFailure: boolean;
}) {
  if (!contrastFailure) {
    return null;
  }

  return (
    <div className="absolute left-4 top-4 z-30 grid max-w-sm gap-2">
      {contrastFailure ? (
        <p role="alert" className="rounded-lg border border-fail/30 bg-bg/95 px-3 py-2 text-[0.75rem] font-semibold text-fail">
          Hay pares de contraste que no alcanzan AA. Toca el rol marcado para corregirlo en contexto.
        </p>
      ) : null}
    </div>
  );
}
