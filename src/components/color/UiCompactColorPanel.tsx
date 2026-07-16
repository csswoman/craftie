import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokens } from '@lib/color/semanticTokens';
import {
  STATUS_COLOR_DEFINITIONS,
  type UiStatusColorSet,
  type UiStatusRole,
} from '@lib/color/uiStatusColors';

import { UiCompactRoleRow } from './UiCompactRoleRow';
import { UiCompactStatusSlot } from './UiCompactStatusSlot';
import { UiSourceColorGrid } from './UiSourceColorGrid';
import {
  COMPACT_ROLE_COUNT,
  COMPACT_ROLE_GROUPS,
  type CompactRoleGroupId,
} from './uiColorPanelGroups';

export function UiCompactColorPanel({
  tokens,
  colors,
  statusColors,
  showCreateGuide,
  canCreateGuide,
  creatingGuide,
  onOpenGroup,
  onOpenStatus,
  onOpenSources,
  onCreateGuide,
}: {
  tokens: SemanticTokens;
  colors: SelectableColor[];
  statusColors: UiStatusColorSet | null;
  showCreateGuide: boolean;
  canCreateGuide: boolean;
  creatingGuide: boolean;
  onOpenGroup: (group: CompactRoleGroupId, token: (typeof COMPACT_ROLE_GROUPS)[CompactRoleGroupId]['roles'][number]['token']) => void;
  onOpenStatus: (role: UiStatusRole) => void;
  onOpenSources: () => void;
  onCreateGuide: () => void;
}) {
  const readyCount = Object.values(COMPACT_ROLE_GROUPS)
    .flatMap((group) => group.roles)
    .filter((role) => !tokens[role.token].gap).length;

  return (
    <div>
      {(['brand', 'foundations'] as const).map((groupId) => {
        const group = COMPACT_ROLE_GROUPS[groupId];
        return (
          <PanelSection
            key={groupId}
            title={group.title}
            trailing={(
              <button
                type="button"
                onClick={() => onOpenGroup(groupId, group.roles[0].token)}
                className="min-h-8 text-xs font-semibold text-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
              >
                Editar ›
              </button>
            )}
          >
            <ul aria-label={group.title}>
              {group.roles.map((role) => (
                <UiCompactRoleRow
                  key={role.token}
                  label={role.label}
                  token={tokens[role.token]}
                  colors={colors}
                  onOpen={() => onOpenGroup(groupId, role.token)}
                />
              ))}
            </ul>
          </PanelSection>
        );
      })}

      <PanelSection title="Colores de estado" trailing={<span className="text-[0.6875rem] font-semibold text-muted">esencial</span>}>
        <ul className="space-y-1.5">
          {STATUS_COLOR_DEFINITIONS.map(({ role }) => (
            <UiCompactStatusSlot
              key={role}
              role={role}
              status={statusColors?.[role] ?? null}
              onOpen={() => onOpenStatus(role)}
            />
          ))}
        </ul>
      </PanelSection>

      <PanelSection title="Colores fuente" trailing={<span className="text-[0.6875rem] font-semibold text-muted">{colors.length} extraídos</span>}>
        <UiSourceColorGrid colors={colors} tokens={tokens} onOpen={onOpenSources} />
      </PanelSection>

      {showCreateGuide ? (
        <section className="pt-4">
          <button
            id="generate-brand-guide"
            type="button"
            disabled={!canCreateGuide || creatingGuide}
            aria-busy={creatingGuide}
            onClick={onCreateGuide}
            className="min-h-11 w-full rounded-lg bg-forest px-4 text-sm font-semibold text-white transition-colors hover:bg-forest-deep active:bg-forest-darker disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/30"
          >
            {creatingGuide ? 'Creando guía…' : 'Crear guía de marca'}
          </button>
          <p className="mt-2 text-center text-[0.71875rem] text-muted">
            {readyCount} de {COMPACT_ROLE_COUNT} listos
          </p>
        </section>
      ) : null}
    </div>
  );
}

function PanelSection({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line-soft py-3">
      <div className="mb-1.5 flex min-h-8 items-center justify-between gap-3">
        <h2 className="font-display text-[0.9375rem] font-semibold text-ink">{title}</h2>
        {trailing}
      </div>
      {children}
    </section>
  );
}
