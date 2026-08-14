'use client';

import type { CSSProperties } from 'react';

import type { TypeScaleRowTone } from '@lib/typography/typeScalePreview';

type TypeScalePreviewRowProps = {
  label: string;
  usage: string;
  token: string;
  size: number;
  isHeading: boolean;
  family: string;
  weight: number;
  tone: TypeScaleRowTone;
  showHairline: boolean;
};

export function TypeScalePreviewRow({
  label,
  usage,
  token,
  size,
  isHeading,
  family,
  weight,
  tone,
  showHairline,
}: TypeScalePreviewRowProps) {
  const sample = isHeading ? 'Diseño con intención' : 'Una guía clara se lee sin esfuerzo.';
  const rowStyle: CSSProperties = {
    backgroundColor: tone.background,
    paddingTop: tone.paddingY,
    paddingBottom: tone.paddingY,
    boxShadow: showHairline ? `inset 0 -1px 0 ${tone.hairline}` : undefined,
  };

  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)_4.75rem] items-start gap-x-4 gap-y-2 px-5 transition-colors duration-200 ease-out motion-reduce:transition-none sm:grid-cols-[12.5rem_minmax(0,1fr)_4.75rem] sm:px-8"
      style={rowStyle}
      title={token}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold" style={{ color: tone.ink }}>
          {label}
        </p>
        <p className="mt-0.5 text-[0.6875rem] leading-snug text-pretty" style={{ color: tone.muted }}>
          {usage}
        </p>
      </div>
      <p
        className="col-span-2 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap sm:col-span-1 sm:col-start-2 sm:row-start-1"
        style={{
          color: tone.ink,
          fontFamily: family,
          fontSize: `${size}px`,
          fontWeight: weight,
          lineHeight: `var(--${isHeading ? 'heading' : 'body'}-line-height)`,
          letterSpacing: `var(--${isHeading ? 'heading' : 'body'}-letter-spacing)`,
        }}
      >
        {sample}
      </p>
      <p
        className="col-start-2 row-start-1 flex w-[4.75rem] items-baseline justify-end gap-0.5 font-mono tabular-nums sm:col-start-3"
        aria-label={`${size} píxeles`}
      >
        <span className="text-[1.125rem] font-semibold leading-none" style={{ color: tone.ink }}>
          {size}
        </span>
        <span className="text-[0.625rem] font-medium leading-none" style={{ color: tone.muted }}>
          px
        </span>
      </p>
    </div>
  );
}
