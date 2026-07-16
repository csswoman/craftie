import { useState, type ReactNode } from 'react';
import { AlertCircle, Droplets, Layers, Palette, type LucideIcon } from 'lucide-react';

import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokens } from '@lib/color/semanticTokens';
import {
  STATUS_COLOR_DEFINITIONS,
  type UiStatusColorSet,
  type UiStatusRole,
} from '@lib/color/uiStatusColors';

import { useAutoHideScrollbar } from '@/lib/browser/useAutoHideScrollbar';

import { CreateBrandGuideFooter } from './CreateBrandGuideFooter';
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
  onOpenStatus: (role: UiStatusRole) => void;
  onOpenSources: () => void;
  onCreateGuide: () => void;
}) {
  const scrollRef = useAutoHideScrollbar<HTMLDivElement>();

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
              <button
                type="button"
                onClick={() => onOpenGroup(groupId, group.roles[0].token)}
                className="min-h-9 text-tools-meta-scale font-semibold text-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
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

      <PanelSection
        title="Colores de estado"
        icon={AlertCircle}
        collapsible
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
      </PanelSection>

      <PanelSection
        title="Colores fuente"
        icon={Droplets}
        trailing={(
          <span className="text-tools-meta-scale font-semibold text-muted">
            {colors.length} extraídos
          </span>
        )}
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
      pinned={fillHeight}
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
  icon: Icon,
  trailing,
  children,
  collapsible = false,
}: {
  title: string;
  icon: LucideIcon;
  trailing: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);

  const titleRow = (
    <>
      <Icon aria-hidden="true" size={18} strokeWidth={2} className="shrink-0 text-forest" />
      <h2 className="truncate font-display text-tools-section-label font-semibold text-ink">{title}</h2>
    </>
  );

  return (
    <section className="border-b border-line-soft py-2.5">
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
