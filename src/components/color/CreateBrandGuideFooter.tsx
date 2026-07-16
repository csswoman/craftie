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
  /** Pin to the bottom of a fill-height column. */
  pinned?: boolean;
  onCreateGuide: () => void;
}) {
  const readyCount = Object.values(COMPACT_ROLE_GROUPS)
    .flatMap((group) => group.roles)
    .filter((role) => !tokens[role.token].gap).length;

  return (
    <section className={pinned ? 'shrink-0 border-t border-line-soft bg-bg pt-3' : 'pt-4'}>
      <button
        id="generate-brand-guide"
        type="button"
        disabled={!canCreateGuide || creatingGuide}
        aria-busy={creatingGuide}
        onClick={onCreateGuide}
        className="min-h-12 w-full rounded-lg bg-forest px-4 text-base font-semibold text-white transition-colors hover:bg-forest-deep active:bg-forest-darker disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/30"
      >
        {creatingGuide ? 'Creando guía…' : 'Crear guía de marca'}
      </button>
      <p className="mt-2 text-center text-tools-meta-scale text-muted">
        {readyCount} de {COMPACT_ROLE_COUNT} listos
      </p>
    </section>
  );
}
