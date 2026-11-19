'use client';

import { useT } from '@/context/I18nContext';

const CASE_STUDY_PILLARS = [
  { termKey: 'start.pillar1', detailKey: 'start.pillar1Desc' },
  { termKey: 'start.pillar2', detailKey: 'start.pillar2Desc' },
  { termKey: 'start.pillar3', detailKey: 'start.pillar3Desc' },
] as const;

/** Swatch dots echo the sample palette strip (decorative; never carry meaning). */
const PILLAR_DOTS = ['#5fb7ab', '#f2b49a', '#f3d98b'] as const;

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
        className="max-w-[22ch] text-balance font-display text-[clamp(2rem,3.4vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.01em] text-ink"
      >
        {t('start.headline')}
      </h2>
      <p className="mt-3 max-w-[52ch] text-pretty text-chrome-section leading-snug text-muted">
        {t('start.subhead')}
      </p>

      <dl className="mt-7 grid gap-5 text-left sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
        {CASE_STUDY_PILLARS.map((pillar, index) => (
          <div key={pillar.termKey}>
            <dt className="flex items-center text-left gap-2.5 font-body text-chrome-body font-semibold text-ink">
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-[3px]"
                style={{ backgroundColor: PILLAR_DOTS[index] }}
              />
              {t(pillar.termKey)}
            </dt>
            <dd className="mt-0.5 text-pretty text-[0.875rem] leading-snug text-muted pl-5 text-left">
              {t(pillar.detailKey)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
