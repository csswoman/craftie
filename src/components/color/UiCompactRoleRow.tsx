import { normalizeHex } from '@lib/color/normalizeHex';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticToken } from '@lib/color/semanticTokens';

export function UiCompactRoleRow({
  label,
  token,
  colors,
  onOpen,
}: {
  label: string;
  token: SemanticToken;
  colors: SelectableColor[];
  onOpen: () => void;
}) {
  const unassigned = Boolean(token.gap);
  const sourceHexes = new Set(colors.map((color) => normalizeHex(color.hex)));
  const fromSource = token.source === 'extracted' || sourceHexes.has(normalizeHex(token.hex));
  const origin = fromSource ? 'fuente' : 'sintético';

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${unassigned ? 'Asignar' : 'Editar'} ${label}`}
        className="group flex min-h-11 w-full items-center gap-2.5 rounded-md px-1.5 text-left transition-colors duration-200 hover:bg-line-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25 dark:hover:bg-line-soft"
      >
        <span
          className={`size-[22px] shrink-0 rounded-full ${unassigned ? 'border border-dashed border-attention' : 'ring-1 ring-inset ring-ink/10'}`}
          style={unassigned ? {
            background: 'repeating-linear-gradient(45deg,#fff,#fff 4px,#fbf1e4 4px,#fbf1e4 8px)',
          } : { backgroundColor: token.hex }}
          aria-hidden="true"
        />
        <span className={`truncate text-tools-role font-semibold ${unassigned ? 'text-attention' : 'text-ink'}`}>
          {label}
        </span>
        {!unassigned ? (
          <span className="ml-auto shrink-0 rounded-full bg-line-soft px-1.5 py-0.5 text-tools-micro font-semibold text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-surface-raised">
            {origin}
          </span>
        ) : <span className="ml-auto" />}
        {unassigned ? (
          <span className="mr-1 size-1.5 shrink-0 rounded-full bg-attention" aria-label="Sin asignar" />
        ) : (
          <span className="w-[5.25rem] shrink-0 text-right font-mono text-tools-meta-scale tabular-nums text-muted">
            {token.hex.toUpperCase()}
          </span>
        )}
      </button>
    </li>
  );
}
