import { pickReadableTextColor } from '@lib/color/readableText';

import type { MockupPaletteProps } from './mockupTypes';

const STRIP_ROLES = [
  'primary',
  'accent',
  'surface',
  'onSurface',
  'neutralLight',
  'neutralDark',
] as const;

export function BrandCardMockup({ tokens, variant = 'preview', fonts }: MockupPaletteProps) {
  const spacious = variant === 'expanded';
  const primaryText = pickReadableTextColor(tokens.primary);

  return (
    <div
      className={`flex h-full min-h-0 flex-col justify-between ${spacious ? 'p-8 text-sm' : 'p-4 text-[13px]'}`}
      style={{ backgroundColor: tokens.surface, color: tokens.onSurface, fontFamily: fonts.bodyFamily }}
    >
      <div>
        <p
          className={`font-semibold ${spacious ? 'text-xs' : 'text-[10px]'}`}
          style={{ color: tokens.accent }}
        >
          Identidad de marca
        </p>
        <h2
          className={`mt-1 font-semibold leading-tight ${spacious ? 'text-2xl' : 'text-lg'}`}
          style={{ fontFamily: fonts.headingFamily, color: tokens.primary }}
        >
          Craftie Studio
        </h2>
        <p className={`mt-1 opacity-85 ${spacious ? 'text-sm' : 'text-[12px]'}`}>
          Herramientas claras para equipos de producto y marca.
        </p>
      </div>

      <span
        className={`inline-flex w-fit items-center rounded font-semibold ${spacious ? 'mt-4 px-4 py-2 text-sm' : 'mt-2 px-2.5 py-1 text-[11px]'}`}
        style={{ backgroundColor: tokens.primary, color: primaryText, fontFamily: fonts.headingFamily }}
      >
        Conocer más
      </span>

      <div className={spacious ? 'mt-6' : 'mt-3'}>
        <p
          className={`font-medium ${spacious ? 'mb-2 text-xs' : 'mb-1 text-[10px]'}`}
          style={{ color: tokens.neutralDark }}
        >
          Paleta
        </p>
        <ul
          className={`flex overflow-hidden rounded border ${spacious ? 'h-4' : 'h-2.5'}`}
          style={{ borderColor: tokens.border }}
          aria-label="Mini paleta de marca"
        >
          {STRIP_ROLES.map((role) => (
            <li key={role} className="min-w-0 flex-1" style={{ backgroundColor: tokens[role] }} />
          ))}
        </ul>
      </div>
    </div>
  );
}
