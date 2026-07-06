import type { PaletteRoleId, RolePalette } from '@lib/color/rolePalette';
import type { PreviewTokens } from '@lib/color/previewTokens';
import type { ThemeId } from '@lib/color/themePalette';
import {
  buttonEmphasisLabel,
  PRIMARY_BUTTON_VARIANTS,
  primaryButtonVariantLabel,
} from '@lib/utils/buttonVariants';

import { PreviewRoleTarget, type PreviewRoleEditHandler } from './PreviewRoleTarget';

export function PreviewBrandCard({
  palette,
  tokens,
  activeTheme,
  onEditRole,
}: {
  palette: RolePalette;
  tokens: PreviewTokens;
  activeTheme: ThemeId;
  onEditRole?: PreviewRoleEditHandler;
}) {
  return (
    <PreviewRoleTarget
      role="superficie"
      onEditRole={onEditRole}
      className="w-full rounded-xl border p-5 sm:p-6"
      style={{
        backgroundColor: palette.superficie.hex,
        borderColor: palette.borde.hex,
        color: palette.texto.hex,
        boxShadow:
          activeTheme === 'light'
            ? '0 1px 2px rgb(0 0 0 / 0.06), 0 4px 12px rgb(0 0 0 / 0.04)'
            : undefined,
      }}
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] opacity-60">
        Tarjeta
      </p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Tu marca</h3>
      <p className="mt-2 text-[0.875rem] leading-relaxed opacity-80">
        Jerarquía de acciones derivada del primario; acento reservado para enlaces y estados.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <ButtonVariantGroup
          label={buttonEmphasisLabel('brand')}
          tokens={tokens}
          onEditRole={onEditRole}
        />
        <div className="flex flex-col gap-2">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] opacity-50">
            {buttonEmphasisLabel('neutral')}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-[0.8125rem] font-semibold shadow-sm"
              style={{
                backgroundColor: tokens.neutralFilled.backgroundColor,
                color: tokens.neutralFilled.color,
              }}
            >
              {primaryButtonVariantLabel('filled')}
            </button>
          </div>
        </div>
      </div>

      <PreviewRoleTarget
        role="acento"
        onEditRole={onEditRole}
        className="mt-4 inline-block text-[0.8125rem] font-semibold underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          color: tokens.accentLink.color,
          outlineColor: tokens.accentLink.outlineColor,
        }}
      >
        Enlace de acento →
      </PreviewRoleTarget>
    </PreviewRoleTarget>
  );
}

function ButtonVariantGroup({
  label,
  tokens,
  onEditRole,
}: {
  label: string;
  tokens: PreviewTokens;
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] opacity-50">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {PRIMARY_BUTTON_VARIANTS.map((variant) => {
          const styles = tokens.buttons[variant];

          return (
            <PreviewRoleTarget
              key={variant}
              role="primario"
              onEditRole={onEditRole}
              className={`rounded-lg px-4 py-2 text-[0.8125rem] font-semibold ${
                variant === 'filled' ? 'shadow-sm' : variant === 'ghost' ? 'border' : ''
              }`}
              style={{
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                borderColor: styles.borderColor,
              }}
            >
              {primaryButtonVariantLabel(variant)}
            </PreviewRoleTarget>
          );
        })}
      </div>
    </div>
  );
}
