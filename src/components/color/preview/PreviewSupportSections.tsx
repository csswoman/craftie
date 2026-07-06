import type { RolePalette } from '@lib/color/rolePalette';
import type { PreviewTokens } from '@lib/color/previewTokens';
import type { ThemeId } from '@lib/color/themePalette';
import { deriveNavbar } from '@lib/utils/deriveRoles';
import { SEMANTIC_CHIP_STATES } from '@lib/utils/semanticChips';

import { PreviewRoleTarget, type PreviewRoleEditHandler } from './PreviewRoleTarget';

export function PreviewSupportBanner({
  palette,
  tokens,
  onEditRole,
}: {
  palette: RolePalette;
  tokens: PreviewTokens;
  onEditRole?: PreviewRoleEditHandler;
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

export function PreviewNavbar({
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
  const items = ['Inicio', 'Producto', 'Precios', 'Contacto'];
  const activeItem = 'Producto';
  const navbarBackground = deriveNavbar(palette.fondo.hex, palette.primario.hex, activeTheme);

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

export function PreviewChips({
  palette,
  tokens,
  onEditRole,
}: {
  palette: RolePalette;
  tokens: PreviewTokens;
  onEditRole?: PreviewRoleEditHandler;
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
