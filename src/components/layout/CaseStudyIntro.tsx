'use client';

import { useT } from '@/context/I18nContext';

const CASE_STUDY_PILLARS = [
  { termKey: 'start.pillar1', detailKey: 'start.pillar1Desc' },
  { termKey: 'start.pillar2', detailKey: 'start.pillar2Desc' },
  { termKey: 'start.pillar3', detailKey: 'start.pillar3Desc' },
] as const;

/**
 * Welcoming intro shown on the empty home screen, beside the dog illustration
 * and the inspiration card. Quiet Gallery aesthetic: Lora display for the
 * headline, Nunito body, primary used only as a thin accent, no dividers,
 * WCAG-AA prose. Plain language for non-technical users. Presentation only.
 */
export function CaseStudyIntro() {
  const t = useT();
  return (
    <section aria-labelledby="case-study-title" className="w-full">
      <h2
        id="case-study-title"
        className="max-w-[16ch] text-balance font-display text-[2.25rem] font-medium leading-[1.1] text-ink"
      >
        {t('start.headline')}
      </h2>
      <p className="mt-4 max-w-[52ch] text-pretty text-chrome-section leading-relaxed text-muted">
        {t('start.subhead')}
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
        {CASE_STUDY_PILLARS.map((pillar) => (
          <div key={pillar.termKey}>
            <dt className="font-display text-chrome-section font-medium text-ink">{t(pillar.termKey)}</dt>
            <dd className="mt-1 text-pretty text-chrome-label leading-relaxed text-muted">
              {t(pillar.detailKey)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
