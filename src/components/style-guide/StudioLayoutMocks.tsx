import type { GeneratedPalette } from '@lib/color/formulas';

export function WebsiteMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  return (
    <div>
      <div className="border-b px-6 py-4" style={{ borderColor: palette.neutralLight }}>
        <p className="text-sm font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
          Marca
        </p>
      </div>
      <div className="space-y-4 px-6 py-10">
        <h2 className="text-3xl font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
          Propuesta de valor clara
        </h2>
        <p className="max-w-xl text-base" style={{ fontFamily: body, color: palette.onSurface }}>
          Bloques de contenido con tu paleta aplicada a titular, cuerpo y acciones.
        </p>
        <span
          className="inline-block rounded-md px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: palette.primary, fontFamily: heading }}
        >
          Empezar
        </span>
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
  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-lg border p-4"
          style={{ borderColor: palette.neutralLight, fontFamily: body, color: palette.onSurface }}
        >
          <p className="text-sm font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
            Módulo {item}
          </p>
          <p className="mt-2 text-sm">Tarjeta de producto con estados hover y foco.</p>
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
  return (
    <div className="aspect-video p-10" style={{ backgroundColor: palette.primary, color: palette.surface }}>
      <p className="text-sm font-medium opacity-80" style={{ fontFamily: body }}>
        Presentación
      </p>
      <h2 className="mt-4 text-4xl font-semibold" style={{ fontFamily: heading }}>
        Slide de apertura
      </h2>
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
  return (
    <div className="mx-auto aspect-[9/16] max-w-xs p-6" style={{ backgroundColor: palette.accent }}>
      <p className="text-xs font-medium text-white/80" style={{ fontFamily: body }}>
        Social
      </p>
      <h2 className="mt-6 text-2xl font-semibold text-white" style={{ fontFamily: heading }}>
        Post vertical
      </h2>
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
  return (
    <div className="space-y-4 p-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
        Boletín semanal
      </h2>
      <div className="h-24 rounded-lg" style={{ backgroundColor: palette.neutralLight }} />
      <p style={{ fontFamily: body, color: palette.onSurface }}>
        Dos columnas de contenido con jerarquía editorial.
      </p>
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
  return (
    <div className="grid gap-6 p-8 md:grid-cols-[1fr_2fr]">
      <div>
        <h2 className="text-xl font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
          Nombre
        </h2>
        <p className="mt-2 text-sm" style={{ fontFamily: body, color: palette.onSurface }}>
          Rol · Ciudad
        </p>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
          Experiencia
        </p>
        <p className="text-sm" style={{ fontFamily: body, color: palette.onSurface }}>
          Resumen de logros con tipografía de cuerpo legible.
        </p>
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
  return (
    <div className="grid gap-4 p-8 sm:grid-cols-2">
      <div
        className="aspect-[1.75/1] rounded-lg p-5"
        style={{ backgroundColor: palette.primary, color: palette.surface, fontFamily: heading }}
      >
        <p className="text-lg font-semibold">Craftie Studio</p>
        <p className="mt-8 text-xs" style={{ fontFamily: body }}>
          craftie.app
        </p>
      </div>
      <div
        className="aspect-[1.75/1] rounded-lg border p-5"
        style={{ borderColor: palette.neutralLight, fontFamily: body, color: palette.onSurface }}
      >
        <p className="text-sm font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
          Tu nombre
        </p>
        <p className="mt-2 text-xs">Diseño · Marca · Producto</p>
      </div>
    </div>
  );
}
