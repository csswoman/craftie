'use client';

import type { CSSProperties, ReactNode } from 'react';

import type { PaletteRoleId, RolePalette } from '@lib/color/rolePalette';
import { buildPreviewTokens, type PreviewTokens } from '@lib/color/previewTokens';
import type { ThemeId } from '@lib/color/themePalette';
import {
  buttonEmphasisLabel,
  PRIMARY_BUTTON_VARIANTS,
  primaryButtonVariantLabel,
} from '@lib/utils/buttonVariants';
import { deriveNavbar } from '@lib/utils/deriveRoles';
import { SEMANTIC_CHIP_STATES } from '@lib/utils/semanticChips';

import { useRolePalette } from '@/context/RolePaletteContext';

export type PreviewViewProps = {
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
};

export function PreviewView({ onEditRole }: PreviewViewProps) {
  const { rolePalette, activeTheme, setActiveTheme } = useRolePalette();

  if (!rolePalette) {
    return null;
  }

  const tokens = buildPreviewTokens(rolePalette);

  return (
    <PreviewRoleTarget
      role="fondo"
      onEditRole={onEditRole}
      className="min-h-0 flex-1 overflow-y-auto"
      style={{ backgroundColor: rolePalette.fondo.hex }}
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-5 pb-8 sm:gap-5 sm:p-8">
        <ThemeToggle activeTheme={activeTheme} onChange={setActiveTheme} />
        {tokens.warnings.length > 0 ? <PreviewContrastWarnings warnings={tokens.warnings} /> : null}
        <BrandCard
          palette={rolePalette}
          tokens={tokens}
          activeTheme={activeTheme}
          onEditRole={onEditRole}
        />
        <SupportBanner palette={rolePalette} tokens={tokens} onEditRole={onEditRole} />
        <NavbarPreview
          palette={rolePalette}
          tokens={tokens}
          activeTheme={activeTheme}
          onEditRole={onEditRole}
        />
        <ChipsPreview palette={rolePalette} tokens={tokens} onEditRole={onEditRole} />
      </div>
    </PreviewRoleTarget>
  );
}

function PreviewRoleTarget({
  role,
  onEditRole,
  children,
  className,
  style,
}: {
  role: PaletteRoleId;
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={style}
      title={onEditRole ? 'Doble clic para editar color del rol' : undefined}
      onDoubleClick={(event) => {
        if (!onEditRole) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        onEditRole(role, event.currentTarget);
      }}
    >
      {children}
    </div>
  );
}

function PreviewContrastWarnings({ warnings }: { warnings: string[] }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-[0.8125rem] text-amber-950 dark:bg-amber-950/20 dark:text-amber-100"
    >
      <p className="font-semibold">Contraste en vista previa</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}

function ThemeToggle({
  activeTheme,
  onChange,
}: {
  activeTheme: ThemeId;
  onChange: (theme: ThemeId) => void;
}) {
  const options: Array<{ id: ThemeId; label: string }> = [
    { id: 'light', label: 'Claro' },
    { id: 'dark', label: 'Oscuro' },
  ];

  return (
    <div
      className="flex w-full items-center justify-center"
      role="group"
      aria-label="Tema de vista previa"
    >
      <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 shadow-sm">
        {options.map((option) => {
          const isActive = option.id === activeTheme;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.id)}
              className={`rounded-md px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BrandCard({
  palette,
  tokens,
  activeTheme,
  onEditRole,
}: {
  palette: RolePalette;
  tokens: PreviewTokens;
  activeTheme: ThemeId;
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
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
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] opacity-60">
          Variantes de botón
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] opacity-50">
            {buttonEmphasisLabel('brand')}
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

function SupportBanner({
  palette,
  tokens,
  onEditRole,
}: {
  palette: RolePalette;
  tokens: PreviewTokens;
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
}) {
  return (
    <PreviewRoleTarget
      role="secundario"
      onEditRole={onEditRole}
      className="w-full rounded-xl border px-4 py-4 sm:px-5"
      style={{
        backgroundColor: tokens.supportBanner.backgroundColor,
        borderColor: palette.borde.hex,
        color: tokens.supportBanner.color,
      }}
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] opacity-75">
        Sección de apoyo
      </p>
      <p className="mt-1 text-[0.875rem] leading-relaxed">
        El color secundario marca áreas informativas y banners — no compite con acciones primarias.
      </p>
    </PreviewRoleTarget>
  );
}

function NavbarPreview({
  palette,
  tokens,
  activeTheme,
  onEditRole,
}: {
  palette: RolePalette;
  tokens: PreviewTokens;
  activeTheme: ThemeId;
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
}) {
  const items = ['Inicio', 'Producto', 'Precios', 'Contacto'];
  const activeItem = 'Producto';
  const navbarBackground = deriveNavbar(
    palette.fondo.hex,
    palette.primario.hex,
    activeTheme,
  );

  return (
    <PreviewRoleTarget
      role="primario"
      onEditRole={onEditRole}
      className="w-full overflow-hidden rounded-xl border"
      style={{
        backgroundColor: navbarBackground,
        borderColor: palette.borde.hex,
        color: palette.texto.hex,
      }}
    >
      <p
        className="border-b px-4 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] opacity-60"
        style={{ borderColor: palette.borde.hex }}
      >
        Barra de navegación
      </p>
      <nav
        className="flex flex-wrap items-center gap-1 px-3 py-2.5 sm:gap-2 sm:px-4"
        aria-label="Vista previa de navegación"
      >
        {items.map((item) => {
          const isActive = item === activeItem;

          return (
            <span
              key={item}
              className={`rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium sm:px-3 ${
                isActive ? 'font-semibold' : 'opacity-75'
              }`}
              style={
                isActive
                  ? {
                      color: tokens.navbarActive.color,
                      boxShadow: `inset 0 0 0 1px ${tokens.navbarActive.borderColor}`,
                    }
                  : undefined
              }
            >
              {item}
            </span>
          );
        })}
      </nav>
    </PreviewRoleTarget>
  );
}

function ChipsPreview({
  palette,
  tokens,
  onEditRole,
}: {
  palette: RolePalette;
  tokens: PreviewTokens;
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
}) {
  return (
    <PreviewRoleTarget
      role="superficie"
      onEditRole={onEditRole}
      className="w-full rounded-xl border p-4 shadow-sm sm:p-5"
      style={{
        backgroundColor: palette.superficie.hex,
        borderColor: palette.borde.hex,
        color: palette.texto.hex,
      }}
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] opacity-60">
        Chips de estado
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SEMANTIC_CHIP_STATES.map((state) => {
          const chip = tokens.chips[state];

          return (
            <span
              key={state}
              className="rounded-full px-3 py-1 text-[0.75rem] font-semibold"
              style={{ backgroundColor: chip.backgroundColor, color: chip.color }}
            >
              {chip.label}
            </span>
          );
        })}
      </div>
    </PreviewRoleTarget>
  );
}
