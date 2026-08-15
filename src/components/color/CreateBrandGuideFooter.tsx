'use client';

import type { SemanticTokens } from '@lib/color/semanticTokens';

import { COMPACT_ROLE_COUNT, COMPACT_ROLE_GROUPS } from './uiColorPanelGroups';

export function CreateBrandGuideFooter({
  tokens,
  canCreateGuide,
  creatingGuide,
  pinned = false,
  onCreateGuide,
}: {
  tokens: SemanticTokens;
  canCreateGuide: boolean;
  creatingGuide: boolean;
  /** Keep the action visible at the bottom of a scrollable tools panel. */
  pinned?: boolean;
  onCreateGuide: () => void;
}) {
  const readyCount = Object.values(COMPACT_ROLE_GROUPS)
    .flatMap((group) => group.roles)
    .filter((role) => !tokens[role.token].gap).length;
  const missingRoles = Object.values(COMPACT_ROLE_GROUPS)
    .flatMap((group) => group.roles)
    .filter((role) => tokens[role.token].gap)
    .map((role) => role.label);

  return (
    <section
      className={pinned
        ? 'sticky bottom-0 z-sticky shrink-0 border-t border-line-soft bg-bg py-3'
        : 'pt-4'}
    >
      <button
        id="generate-brand-guide"
        type="button"
        disabled={!canCreateGuide || creatingGuide}
        aria-busy={creatingGuide}
        aria-describedby="brand-guide-progress"
        onClick={onCreateGuide}
        className="min-h-12 w-full rounded-lg bg-forest px-4 text-base font-semibold text-white transition-colors hover:bg-forest-deep active:bg-forest-darker disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/30"
      >
        {creatingGuide ? 'Abriendo guía…' : 'Ver guía de marca'}
      </button>
      <div
        id="brand-guide-progress"
        className="mt-2 text-center text-tools-meta-scale"
      >
        {canCreateGuide ? (
          <p className="text-muted">
            {readyCount} de {COMPACT_ROLE_COUNT} roles listos para la guía
          </p>
        ) : missingRoles.length > 0 ? (
          <>
            <p className="font-medium text-ink">
              Completa {missingRoles.length} {missingRoles.length === 1 ? 'rol' : 'roles'} para ver la guía
            </p>
            <p className="mt-0.5 text-muted">Pendientes: {missingRoles.join(', ')}.</p>
          </>
        ) : (
          <p className="text-muted">Completa los roles de color para ver la guía.</p>
        )}
      </div>
    </section>
  );
}
