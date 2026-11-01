import type { GeneratedPalette } from '@lib/color/formulas';
import { useT } from '@/context/I18nContext';

export function WebsiteMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  const t = useT();
  return (
    <div>
      <div className="border-b px-6 py-4" style={{ borderColor: palette.neutralLight }}>
        <p className="text-sm font-semibold" style={{ fontFamily: heading, color: palette.primary }}>{t('ui.StudioLayoutMocks.marca')}</p>
      </div>
      <div className="space-y-4 px-6 py-10">
        <h2 className="text-3xl font-semibold" style={{ fontFamily: heading, color: palette.primary }}>{t('ui.StudioLayoutMocks.propuesta-de-valor-clara')}</h2>
        <p className="max-w-xl text-base" style={{ fontFamily: body, color: palette.onSurface }}>{t('ui.StudioLayoutMocks.bloques-de-contenido-con-tu')}</p>
        <span
          className="inline-block rounded-md px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: palette.primary, fontFamily: heading }}
        >{t('ui.StudioLayoutMocks.empezar')}</span>
      </div>
    </div>
  );
}

export function UiGridMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  const t = useT();
  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-lg border p-4"
          style={{ borderColor: palette.neutralLight, fontFamily: body, color: palette.onSurface }}
        >
          <p className="text-sm font-semibold" style={{ fontFamily: heading, color: palette.primary }}>{t('ui.StudioLayoutMocks.modulo', { item })}
          </p>
          <p className="mt-2 text-sm">{t('ui.StudioLayoutMocks.tarjeta-de-producto-con-estados')}</p>
        </div>
      ))}
    </div>
  );
}

export function SlidesMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  const t = useT();
  return (
    <div className="aspect-video p-10" style={{ backgroundColor: palette.primary, color: palette.surface }}>
      <p className="text-sm font-medium opacity-80" style={{ fontFamily: body }}>{t('ui.StudioLayoutMocks.presentacion')}</p>
      <h2 className="mt-4 text-4xl font-semibold" style={{ fontFamily: heading }}>{t('ui.StudioLayoutMocks.slide-de-apertura')}</h2>
    </div>
  );
}

export function SocialMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  const t = useT();
  return (
    <div className="mx-auto aspect-[9/16] max-w-xs p-6" style={{ backgroundColor: palette.accent }}>
      <p className="text-xs font-medium text-white/80" style={{ fontFamily: body }}>{t('ui.StudioLayoutMocks.social')}</p>
      <h2 className="mt-6 text-2xl font-semibold text-white" style={{ fontFamily: heading }}>{t('ui.StudioLayoutMocks.post-vertical')}</h2>
    </div>
  );
}

export function NewsletterMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  const t = useT();
  return (
    <div className="space-y-4 p-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: heading, color: palette.primary }}>{t('ui.StudioLayoutMocks.boletin-semanal')}</h2>
      <div className="h-24 rounded-lg" style={{ backgroundColor: palette.neutralLight }} />
      <p style={{ fontFamily: body, color: palette.onSurface }}>{t('ui.StudioLayoutMocks.dos-columnas-de-contenido-con')}</p>
    </div>
  );
}

export function ResumeMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  const t = useT();
  return (
    <div className="grid gap-6 p-8 md:grid-cols-[1fr_2fr]">
      <div>
        <h2 className="text-xl font-semibold" style={{ fontFamily: heading, color: palette.primary }}>{t('ui.StudioLayoutMocks.nombre')}</h2>
        <p className="mt-2 text-sm" style={{ fontFamily: body, color: palette.onSurface }}>{t('ui.StudioLayoutMocks.rol-ciudad')}</p>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold" style={{ fontFamily: heading, color: palette.primary }}>{t('ui.StudioLayoutMocks.experiencia')}</p>
        <p className="text-sm" style={{ fontFamily: body, color: palette.onSurface }}>{t('ui.StudioLayoutMocks.resumen-de-logros-con-tipografia')}</p>
      </div>
    </div>
  );
}

export function BusinessCardMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  const t = useT();
  return (
    <div className="grid gap-4 p-8 sm:grid-cols-2">
      <div
        className="aspect-[1.75/1] rounded-lg p-5"
        style={{ backgroundColor: palette.primary, color: palette.surface, fontFamily: heading }}
      >
        <p className="text-lg font-semibold">{t('ui.StudioLayoutMocks.craftie-studio')}</p>
        <p className="mt-8 text-xs" style={{ fontFamily: body }}>{t('ui.StudioLayoutMocks.craftie-app')}</p>
      </div>
      <div
        className="aspect-[1.75/1] rounded-lg border p-5"
        style={{ borderColor: palette.neutralLight, fontFamily: body, color: palette.onSurface }}
      >
        <p className="text-sm font-semibold" style={{ fontFamily: heading, color: palette.primary }}>{t('ui.StudioLayoutMocks.tu-nombre')}</p>
        <p className="mt-2 text-xs">{t('ui.StudioLayoutMocks.diseno-marca-producto')}</p>
      </div>
    </div>
  );
}
