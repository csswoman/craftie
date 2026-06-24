import { pickReadableTextColor } from '@lib/color/readableText';

import type { MockupPaletteProps } from './mockupTypes';

export function DashboardMockup({ tokens, variant = 'preview', fonts }: MockupPaletteProps) {
  const spacious = variant === 'expanded';
  const sidebarText = pickReadableTextColor(tokens.neutralDark);

  return (
    <div
      className={`flex h-full min-h-0 ${spacious ? 'text-sm' : 'text-[13px]'}`}
      style={{ backgroundColor: tokens.neutralLight, color: tokens.onSurface, fontFamily: fonts.bodyFamily }}
    >
      <aside
        className={`flex shrink-0 flex-col border-r ${spacious ? 'w-44 gap-3 p-4' : 'w-[34%] gap-1.5 p-2.5'}`}
        style={{ backgroundColor: tokens.neutralDark, borderColor: tokens.border, color: sidebarText }}
      >
        <span
          className={`font-semibold ${spacious ? 'text-sm' : 'text-[12px]'}`}
          style={{ fontFamily: fonts.headingFamily }}
        >
          Panel
        </span>
        {['Resumen', 'Proyectos', 'Ajustes'].map((item, index) => (
          <span
            key={item}
            className={`rounded ${spacious ? 'px-2 py-1 text-xs' : 'px-1.5 py-0.5 text-[10px]'} ${
              index === 0 ? 'font-semibold' : 'opacity-80'
            }`}
            style={
              index === 0
                ? { backgroundColor: tokens.primary, color: pickReadableTextColor(tokens.primary) }
                : undefined
            }
          >
            {item}
          </span>
        ))}
      </aside>

      <div className={`min-w-0 flex-1 ${spacious ? 'space-y-4 p-5' : 'space-y-2 p-3'}`}>
        <header
          className={`flex items-center justify-between border-b ${spacious ? 'pb-3' : 'pb-1.5'}`}
          style={{ borderColor: tokens.border }}
        >
          <span
            className={`font-semibold ${spacious ? 'text-base' : 'text-sm'}`}
            style={{ fontFamily: fonts.headingFamily, color: tokens.primary }}
          >
            Resumen
          </span>
          <span
            className={`rounded-full font-medium ${spacious ? 'px-2 py-0.5 text-xs' : 'px-1.5 py-0.5 text-[10px]'}`}
            style={{ backgroundColor: tokens.accent, color: pickReadableTextColor(tokens.accent) }}
          >
            Activo
          </span>
        </header>

        <div className={`grid grid-cols-3 ${spacious ? 'gap-3' : 'gap-1.5'}`}>
          {['Usuarios', 'Sesiones', 'Conversión'].map((label) => (
            <div
              key={label}
              className={`rounded border ${spacious ? 'p-3' : 'p-1.5'}`}
              style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
            >
              <p className={`opacity-70 ${spacious ? 'text-xs' : 'text-[10px]'}`}>{label}</p>
              <p
                className={`font-semibold ${spacious ? 'text-lg' : 'text-sm'}`}
                style={{ fontFamily: fonts.headingFamily, color: tokens.primary }}
              >
                128
              </p>
            </div>
          ))}
        </div>

        <div
          className={`rounded border ${spacious ? 'p-3' : 'p-1.5'}`}
          style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
        >
          <p
            className={`font-medium ${spacious ? 'text-xs' : 'text-[10px]'}`}
            style={{ fontFamily: fonts.headingFamily, color: tokens.primary }}
          >
            Actividad semanal
          </p>
          <div
            className={`mt-1 flex items-end ${spacious ? 'h-20 gap-1' : 'h-10 gap-0.5'}`}
            aria-hidden="true"
          >
            {[40, 65, 45, 80, 55, 70, 50].map((height, index) => (
              <span
                key={index}
                className="flex-1 rounded-sm"
                style={{
                  height: `${height}%`,
                  backgroundColor: index % 2 === 0 ? tokens.primary : tokens.accent,
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
        </div>

        <div
          className={`flex items-center justify-between rounded border ${spacious ? 'px-3 py-2' : 'px-1.5 py-1'}`}
          style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
        >
          <span className={spacious ? 'text-xs' : 'text-[10px]'}>Proyecto Aurora</span>
          <span
            className={`rounded font-medium ${spacious ? 'px-2 py-0.5 text-xs' : 'px-1.5 text-[10px]'}`}
            style={{ backgroundColor: tokens.neutralLight, color: tokens.neutralDark }}
          >
            En curso
          </span>
        </div>
      </div>
    </div>
  );
}
