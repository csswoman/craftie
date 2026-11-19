'use client';

import { useMemo } from 'react';
import { Check, ChevronRight, X } from 'lucide-react';

import {
  explainRoleColor,
  NEUTRAL_CHROMA_LIMIT,
  type DerivationStep,
} from '@lib/color/roleDerivation';
import { ROLE_LABELS, type PaletteRoleId, type RolePalette } from '@lib/color/roleTypes';
import type { Translate } from '@lib/i18n/translate';
import { useT, useTx } from '@/context/I18nContext';

type TranslateText = (text: string) => string;

function signed(value: number, digits: number): string {
  const fixed = value.toFixed(digits);
  return value > 0 && Number(fixed) !== 0 ? `+${fixed}` : fixed;
}

function chromaText(step: Extract<DerivationStep, { kind: 'chroma' }>, t: Translate): string {
  const params = {
    value: step.chroma.toFixed(3),
    limit: NEUTRAL_CHROMA_LIMIT.toFixed(3),
    area: step.area === null ? '' : Math.round(step.area * 100),
  };
  const withArea = step.area !== null;

  if (!step.neutral) {
    return t(withArea ? 'ui.RoleDerivation.croma-marca-area' : 'ui.RoleDerivation.croma-marca', params);
  }
  if (step.withinLimit) {
    return t(withArea ? 'ui.RoleDerivation.croma-neutro-area' : 'ui.RoleDerivation.croma-neutro', params);
  }
  return t(withArea ? 'ui.RoleDerivation.croma-excedido-area' : 'ui.RoleDerivation.croma-excedido', params);
}

/** Plain-language sentence for one derivation step. */
function stepText(step: DerivationStep, t: Translate, tx: TranslateText): string {
  const role = (id: PaletteRoleId) => tx(ROLE_LABELS[id]);

  switch (step.kind) {
    case 'origin':
      return t(`ui.RoleDerivation.origen-${step.source}`);
    case 'hue':
      return t('ui.RoleDerivation.matiz', {
        hue: Math.round(step.hue),
        delta: Math.round(step.delta),
        anchor: role(step.anchorRole),
      });
    case 'achromatic':
      return t('ui.RoleDerivation.acromatico');
    case 'lightness':
      return t('ui.RoleDerivation.luminosidad', {
        value: step.lightness.toFixed(2),
        delta: signed(step.deltaPoints, 0),
        reference: role(step.referenceRole),
      });
    case 'chroma':
      return chromaText(step, t);
    case 'contrast':
      return step.against === 'text'
        ? t('ui.RoleDerivation.contraste-texto', { ratio: step.ratio.toFixed(2), required: step.required })
        : t('ui.RoleDerivation.contraste-rol', {
            other: role(step.against),
            ratio: step.ratio.toFixed(2),
            required: step.required,
          });
    case 'correction':
      return t('ui.RoleDerivation.ajuste', {
        hex: step.fromHex.toUpperCase(),
        lightness: signed(step.deltaLightnessPoints, 1),
        chroma: signed(step.deltaChroma, 3),
        hue: Math.round(step.deltaHue),
      });
  }
}

function stepStatus(step: DerivationStep): boolean | null {
  if (step.kind === 'contrast') return step.passes;
  if (step.kind === 'chroma' && step.neutral) return step.withinLimit;
  return null;
}

function StatusMark({ passes, t }: { passes: boolean | null; t: Translate }) {
  if (passes === null) {
    return <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted" aria-hidden="true" />;
  }
  const Icon = passes ? Check : X;
  return (
    <span className={passes ? 'shrink-0 text-pass' : 'shrink-0 text-fail'}>
      <Icon size={14} className="mt-0.5" aria-hidden="true" />
      <span className="sr-only">
        {passes ? t('ui.RoleDerivation.cumple') : t('ui.RoleDerivation.no-cumple')}
      </span>
    </span>
  );
}

/**
 * Collapsible «¿Por qué este color?» panel: every fact is measured on the
 * current palette by `explainRoleColor`, so it always matches the engine.
 */
export function RoleDerivationDetails({
  palette,
  role,
}: {
  palette: RolePalette;
  role: PaletteRoleId;
}) {
  const t = useT();
  const tx = useTx();
  const derivation = useMemo(() => explainRoleColor(palette, role), [palette, role]);

  return (
    <details className="group rounded-[var(--chrome-radius-card)] border border-border bg-surface">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 px-3 font-sans text-tools-meta font-semibold text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 [&::-webkit-details-marker]:hidden">
        <ChevronRight
          size={14}
          className="shrink-0 text-muted transition-transform group-open:rotate-90 motion-reduce:transition-none"
          aria-hidden="true"
        />
        {t('ui.RoleDerivation.titulo')}
      </summary>
      <ol className="space-y-1.5 px-3 pb-3">
        {derivation.steps.map((step, index) => (
          <li
            key={`${step.kind}-${index}`}
            className="flex gap-2 font-sans text-tools-meta leading-snug text-ink"
          >
            <StatusMark passes={stepStatus(step)} t={t} />
            <span>{stepText(step, t, tx)}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}
