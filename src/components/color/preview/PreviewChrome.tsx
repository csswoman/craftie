export function PreviewContrastWarnings({ warnings }: { warnings: string[] }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-[0.8125rem] text-amber-950 dark:bg-amber-950/20 dark:text-amber-100"
    >
      <p className="font-semibold">Contraste en vista previa</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}
