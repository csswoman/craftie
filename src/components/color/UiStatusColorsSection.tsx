import { normalizeHex } from '@lib/color/normalizeHex';
import type { SelectableColor } from '@lib/color/selectableColors';
import {
  buildUiStatusCandidates,
  STATUS_COLOR_DEFINITIONS,
  type UiStatusColor,
  type UiStatusColorSet,
} from '@lib/color/uiStatusColors';

import { UiColorSectionHeader } from './UiColorSectionHeader';
import { UiStatusColorCard } from './UiStatusColorCard';

export function UiStatusColorsSection({
  colors,
  statusColors,
  backgroundHex,
  onGenerate,
  onSelect,
}: {
  colors: SelectableColor[];
  statusColors: UiStatusColorSet | null;
  backgroundHex: string;
  onGenerate: () => void;
  onSelect: (status: UiStatusColor) => void;
}) {
  const nameByHex = new Map(colors.map((color) => [normalizeHex(color.hex), color.name]));

  return (
    <section aria-labelledby="ui-status-title">
      <UiColorSectionHeader title="Colores de estado" />
      <h2 id="ui-status-title" className="sr-only">Colores de estado</h2>
      {!statusColors ? (
        <div className="mt-2">
          <p className="text-tools-meta leading-relaxed text-muted">
            Genera estados semánticos solo si tu interfaz necesita éxito, advertencia y peligro.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            className="mt-2 min-h-10 w-full rounded-md bg-[var(--chrome-green)] px-3 text-tools-meta font-semibold text-white hover:brightness-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            Generar colores de estado
          </button>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          {STATUS_COLOR_DEFINITIONS.map(({ role }) => {
            const status = statusColors[role];
            const sourceName = status.sourceHex
              ? nameByHex.get(normalizeHex(status.sourceHex))
              : undefined;
            const candidates = buildUiStatusCandidates({
              role,
              colors: colors.map((color) => ({ hex: color.hex, prominence: color.prominence ?? 1 })),
              backgroundHex,
              current: status,
            });
            return (
              <UiStatusColorCard
                key={role}
                status={status}
                sourceName={sourceName}
                candidates={candidates}
                nameByHex={nameByHex}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
