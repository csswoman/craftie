import { useState, type ReactNode } from 'react';
import { AlertCircle, ChevronRight, Droplets, Layers, Palette, Sparkles, type LucideIcon } from 'lucide-react';

import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokens } from '@lib/color/semanticTokens';
import {
  STATUS_COLOR_DEFINITIONS,
  type UiStatusColorSet,
  type UiStatusRole,
} from '@lib/color/uiStatusColors';
import { useAutoHideScrollbar } from '@/lib/browser/useAutoHideScrollbar';
import { CreateBrandGuideFooter } from './CreateBrandGuideFooter';
import { NeutralScaleStrip } from './NeutralScaleStrip';
import { UiCompactRoleRow } from './UiCompactRoleRow';
import { UiCompactStatusSlot } from './UiCompactStatusSlot';
import { UiSourceColorGrid } from './UiSourceColorGrid';
import {
  COMPACT_ROLE_GROUPS,
  type CompactRoleGroupId,
} from './uiColorPanelGroups';
const GROUP_ICONS: Record<CompactRoleGroupId, LucideIcon> = {
  brand: Palette,
  foundations: Layers,
};
export function UiCompactColorPanel({
  tokens,
  colors,
  statusColors,
  showCreateGuide,
  canCreateGuide,
  creatingGuide,
  fillHeight = false,
  onOpenGroup,
  onGenerateStatus,
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
  /** Desktop tools column: scroll sections, pin create-guide footer. */
  fillHeight?: boolean;
  onOpenGroup: (
    group: CompactRoleGroupId,
    token: (typeof COMPACT_ROLE_GROUPS)[CompactRoleGroupId]['roles'][number]['token'],
  ) => void;
  onGenerateStatus: () => void;
  onOpenStatus: (role: UiStatusRole) => void;
  onOpenSources: () => void;
  onCreateGuide: () => void;
}) {
  const scrollRef = useAutoHideScrollbar<HTMLDivElement>();
  const missingGuideRoles = Object.values(COMPACT_ROLE_GROUPS)
    .flatMap((group) => group.roles)
    .filter((role) => tokens[role.token].gap)
    .map((role) => role.label);
  const sections = (
    <>
      {(['brand', 'foundations'] as const).map((groupId) => {
        const group = COMPACT_ROLE_GROUPS[groupId];
        return (
          <PanelSection
            key={groupId}
            title={group.title}
            icon={GROUP_ICONS[groupId]}
            collapsible
            trailing={(
              <EditAction onClick={() => onOpenGroup(groupId, group.roles[0].token)} />
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
            {groupId === 'foundations' ? <NeutralScaleStrip /> : null}
            {groupId === 'brand' && showCreateGuide && !canCreateGuide && missingGuideRoles.length > 0 ? (
              <p className="mt-2 rounded-md bg-surface px-3 py-2 text-tools-meta-scale leading-snug text-muted">
                Para ver la guía, asigna un color a: {missingGuideRoles.join(', ')}.
              </p>
            ) : null}
          </PanelSection>
        );
      })}

      <PanelSection
        title="Colores de estado"
        kicker="Semántico"
        icon={AlertCircle}
        collapsible
        breakBefore
        trailing={<span className="text-tools-meta-scale font-semibold text-muted">esencial</span>}
      >
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
        {!statusColors ? (
          <button
            type="button"
            onClick={onGenerateStatus}
            className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-md border border-line bg-bg px-3 text-tools-meta-scale font-semibold text-ink transition-colors hover:bg-line-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
          >
            <Sparkles size={14} strokeWidth={1.75} aria-hidden="true" />
            Generar colores de estado
          </button>
        ) : null}
      </PanelSection>

      <PanelSection
        title="Colores fuente"
        icon={Droplets}
        trailing={<span className="text-tools-meta-scale font-semibold text-muted">{colors.length} extraídos</span>}
      >
        <UiSourceColorGrid colors={colors} tokens={tokens} onOpen={onOpenSources} />
      </PanelSection>
    </>
  );

  const createGuide = showCreateGuide ? (
    <CreateBrandGuideFooter
      tokens={tokens}
      canCreateGuide={canCreateGuide}
      creatingGuide={creatingGuide}
      pinned
      onCreateGuide={onCreateGuide}
    />
  ) : null;

  if (!fillHeight) {
    return (
      <div>
        {sections}
        {createGuide}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="scrollbar-chrome min-h-0 flex-1 overflow-y-auto">
        {sections}
      </div>
      {createGuide}
    </div>
  );
}

function PanelSection({
  title,
  kicker,
  icon: Icon,
  trailing,
  children,
  collapsible = false,
  breakBefore = false,
}: {
  title: string;
  kicker?: string;
  icon: LucideIcon;
  trailing: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  breakBefore?: boolean;
}) {
  const [open, setOpen] = useState(true);

  const titleRow = (
    <>
      <Icon aria-hidden="true" size={18} strokeWidth={2} className="shrink-0 text-muted" />
      <h2 className="truncate font-display text-tools-section-label font-semibold text-ink">{title}</h2>
    </>
  );

  return (
    <section className={`border-b border-line-soft py-2.5 ${breakBefore ? '-mt-px border-t-2 border-line pt-3.5' : ''}`}>
      {kicker ? (
        <p className="mb-1 text-tools-meta-scale font-medium text-muted">{kicker}</p>
      ) : null}
      <div className="mb-1.5 flex min-h-9 items-center justify-between gap-3">
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="flex min-w-0 items-center gap-2 rounded-md py-1 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            {titleRow}
            <PanelChevron open={open} />
          </button>
        ) : (
          <div className="flex min-w-0 items-center gap-2">{titleRow}</div>
        )}
        {trailing}
      </div>
      {!collapsible || open ? children : null}
    </section>
  );
}

function EditAction({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex min-h-9 items-center gap-0.5 text-tools-meta-scale font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
    >
      Editar
      <ChevronRight size={14} strokeWidth={2.25} aria-hidden="true" className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
    </button>
  );
}

function PanelChevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`size-3 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
