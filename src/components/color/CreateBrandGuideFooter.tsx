'use client';

import type { SemanticTokens } from '@lib/color/semanticTokens';

import { COMPACT_ROLE_COUNT, COMPACT_ROLE_GROUPS } from './uiColorPanelGroups';
import { useT, useTx } from '@/context/I18nContext';

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
  const tx = useTx();
  const t = useT();
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
        {creatingGuide ? t('ui.CreateBrandGuideFooter.abriendo-guia') : t('ui.CreateBrandGuideFooter.ver-guia-de-marca')}
      </button>
      <div
        id="brand-guide-progress"
        className="mt-2 text-center text-tools-meta-scale"
      >
        {canCreateGuide ? (
          <p className="text-muted">
            {t('ui.CreateBrandGuideFooter.de-roles-listos-para-la', { readyCount, COMPACT_ROLE_COUNT })}</p>
        ) : missingRoles.length > 0 ? (
          <>
            <p className="font-medium text-ink">{t('ui.CreateBrandGuideFooter.completa', { length: missingRoles.length })}{tx(missingRoles.length === 1 ? 'rol' : 'roles')}{' '}{t('ui.CreateBrandGuideFooter.para-ver-la-guia')}</p>
            <p className="mt-0.5 text-muted">{t('ui.CreateBrandGuideFooter.pendientes', { value: tx(missingRoles.join(', ')) })}</p>
          </>
        ) : (
          <p className="text-muted">{t('ui.CreateBrandGuideFooter.completa-los-roles-de-color')}</p>
        )}
      </div>
    </section>
  );
}
