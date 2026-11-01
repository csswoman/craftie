import { pickReadableTextColor } from '@lib/color/readableText';

import type { MockupPaletteProps } from './mockupTypes';
import { useT, useTx } from '@/context/I18nContext';

export function LandingPageMockup({ tokens, variant = 'preview', fonts }: MockupPaletteProps) {
  const tx = useTx();
  const t = useT();
  const spacious = variant === 'expanded';
  const primaryText = pickReadableTextColor(tokens.primary);

  return (
    <div
      className={`flex h-full min-h-0 flex-col ${spacious ? 'text-sm' : 'text-[13px]'}`}
      style={{ backgroundColor: tokens.surface, color: tokens.onSurface, fontFamily: fonts.bodyFamily }}
    >
      <header
        className={`flex items-center justify-between border-b ${spacious ? 'px-6 py-4' : 'px-4 py-2.5'}`}
        style={{ borderColor: tokens.border }}
      >
        <span
          className={`font-semibold ${spacious ? 'text-base' : 'text-sm'}`}
          style={{ fontFamily: fonts.headingFamily, color: tokens.primary }}
        >{t('ui.LandingPageMockup.craftie')}</span>
        <nav className={`flex ${spacious ? 'gap-4' : 'gap-2'}`} aria-hidden="true">
          {['Producto', 'Precios'].map((item) => (
            <span key={item} className={spacious ? 'text-xs' : 'text-[11px]'} style={{ color: tokens.onSurface }}>
              {tx(item)}
            </span>
          ))}
        </nav>
      </header>

      <div className={`flex-1 ${spacious ? 'space-y-4 p-8' : 'space-y-2.5 p-4'}`}>
        <h1
          className={`font-semibold leading-tight ${spacious ? 'text-2xl' : 'text-lg'}`}
          style={{ fontFamily: fonts.headingFamily, color: tokens.primary }}
        >{t('ui.LandingPageMockup.disena-marcas-con-confianza')}</h1>
        <p className={`leading-snug opacity-90 ${spacious ? 'text-sm' : 'text-[13px]'}`}>{t('ui.LandingPageMockup.paletas-accesibles-tipografia-y-guias')}</p>
        <div className={`flex items-center ${spacious ? 'gap-3' : 'gap-2'}`}>
          <span
            className={`inline-block rounded font-semibold ${spacious ? 'px-4 py-2 text-sm' : 'px-2.5 py-1 text-[11px]'}`}
            style={{ backgroundColor: tokens.primary, color: primaryText, fontFamily: fonts.headingFamily }}
          >{t('ui.LandingPageMockup.empezar-gratis')}</span>
          <span
            className={`font-medium ${spacious ? 'text-sm' : 'text-[12px]'}`}
            style={{ color: tokens.accent }}
          >{t('ui.LandingPageMockup.ver-demo')}</span>
        </div>

        <div className={`grid grid-cols-2 ${spacious ? 'gap-3 pt-2' : 'gap-2 pt-1'}`}>
          {[1, 2].map((card) => (
            <article
              key={card}
              className={`rounded border ${spacious ? 'p-3' : 'p-2'}`}
              style={{
                borderColor: tokens.border,
                backgroundColor: tokens.neutralLight,
              }}
            >
              <p
                className={`font-semibold ${spacious ? 'text-xs' : 'text-[11px]'}`}
                style={{ fontFamily: fonts.headingFamily, color: tokens.primary }}
              >{t('ui.LandingPageMockup.bloque', { card })}
              </p>
              <p className={`mt-0.5 opacity-80 ${spacious ? 'text-xs' : 'text-[10px]'}`}>{t('ui.LandingPageMockup.contenido-secundario-con-buen-contraste')}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
