'use client';

import type { CSSProperties, ReactNode } from 'react';

import type { TypeScalePalette, TypeScaleSpecimenLevel } from '@lib/typography/typeScalePreview';

type TypeScaleSpecimenProps = {
  levels: TypeScaleSpecimenLevel[];
  headingFamily: string;
  bodyFamily: string;
  palette: TypeScalePalette;
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
  onSelect: (id: string, rect: DOMRect) => void;
};

type TagProps = {
  id: string;
  as?: 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Top-level so hovering (which re-renders the parent) never remounts the text. */
function SpecimenTag({
  id,
  as: Tagname = 'p',
  className,
  style,
  children,
  levelStyle,
  activeId,
  inkColor,
  onActiveChange,
  onSelect,
}: TagProps & {
  levelStyle: (id: string, extra?: CSSProperties) => CSSProperties;
  activeId: string | null;
  inkColor: string;
  onActiveChange: (id: string | null) => void;
  onSelect: (id: string, rect: DOMRect) => void;
}) {
  return (
    <Tagname
      className={`cursor-pointer rounded-sm transition-[outline-color] duration-150 focus-visible:outline-none ${className ?? ''}`}
      style={{
        ...levelStyle(id, style),
        outline: `1.5px dashed ${activeId === id ? inkColor : 'transparent'}`,
        outlineOffset: 3,
      }}
      role={Tagname === 'p' || Tagname === 'div' ? 'button' : undefined}
      tabIndex={0}
      aria-label={`Editar nivel ${id}`}
      onMouseEnter={() => onActiveChange(id)}
      onMouseLeave={() => onActiveChange(null)}
      onFocus={() => onActiveChange(id)}
      onBlur={() => onActiveChange(null)}
      onClick={(event) => onSelect(id, event.currentTarget.getBoundingClientRect())}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(id, event.currentTarget.getBoundingClientRect());
        }
      }}
    >
      {children}
    </Tagname>
  );
}

/** A small page set in the user's scale: each level appears where it would really be used. */
export function TypeScaleSpecimen({
  levels,
  headingFamily,
  bodyFamily,
  palette,
  activeId,
  onActiveChange,
  onSelect,
}: TypeScaleSpecimenProps) {
  const byId = new Map(levels.map((level) => [level.id, level]));
  const larger = levels.filter((level) => level.id.startsWith('display-'));
  const micro = levels.filter((level) => level.id.startsWith('micro-'));

  function levelStyle(id: string, extra?: CSSProperties): CSSProperties {
    const level = byId.get(id);

    if (!level) {
      return {};
    }

    return {
      fontFamily: level.isHeading ? headingFamily : bodyFamily,
      fontSize: level.size,
      fontWeight: level.weight,
      lineHeight: level.lineHeight,
      letterSpacing: `${level.letterSpacing}em`,
      color: palette.ink,
      overflowWrap: 'anywhere',
      ...extra,
    };
  }

  const shared = { levelStyle, activeId, inkColor: palette.ink, onActiveChange, onSelect };

  return (
    <article className="min-w-0 space-y-8 px-5 py-6 @min-[900px]/scale:px-8 @min-[900px]/scale:py-8" aria-label="Escala aplicada a una página">
      {larger.length > 0 ? (
        <div className="space-y-2" aria-label="Pasos extra grandes">
          {larger.map((level) => (
            <SpecimenTag {...shared} key={level.id} id={level.id} as="div" className="truncate">
              Hola, marca
            </SpecimenTag>
          ))}
        </div>
      ) : null}

      <header>
        <SpecimenTag {...shared} id="small" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.3, color: palette.muted }}>
          Guía de marca · Tipografía
        </SpecimenTag>
        <SpecimenTag {...shared} id="display" as="h2" className="mt-3 text-balance">
          Diseño con intención
        </SpecimenTag>
        <SpecimenTag {...shared} id="lead" className="mt-4 max-w-[52ch] text-pretty" style={{ color: palette.muted }}>
          Una escala que ordena lo importante: de la portada al detalle más pequeño.
        </SpecimenTag>
      </header>

      <section>
        <SpecimenTag {...shared} id="h1" as="h3" className="text-balance">
          Cada nivel tiene su lugar
        </SpecimenTag>
        <SpecimenTag {...shared} id="body" className="mt-3 max-w-[62ch] text-pretty">
          Los tamaños crecen con una razón constante, de modo que titulares, párrafos y notas se sienten parte del
          mismo sistema. El ojo encuentra el orden sin esfuerzo y la lectura fluye.
        </SpecimenTag>
      </section>

      <section className="grid gap-x-8 gap-y-6 @min-[640px]/scale:grid-cols-2">
        <div className="min-w-0">
          <SpecimenTag {...shared} id="h2" as="h4" className="text-balance">
            Titulares que guían
          </SpecimenTag>
          <SpecimenTag {...shared} id="h3" as="h5" className="mt-2" style={{ color: palette.muted }}>
            Subtítulos de bloque
          </SpecimenTag>
          <SpecimenTag {...shared} id="body" className="mt-3 text-pretty">
            Un titular claro anuncia el tema y deja que el cuerpo haga el resto.
          </SpecimenTag>
        </div>

        <div className="min-w-0 rounded-xl p-5" style={{ backgroundColor: palette.chip }}>
          <SpecimenTag {...shared} id="h4" as="h6">
            Tarjeta de ejemplo
          </SpecimenTag>
          <SpecimenTag {...shared} id="h5" className="mt-2" style={{ color: palette.muted }}>
            Etiquetas de grupo
          </SpecimenTag>
          <ul className="mt-3 space-y-1.5">
            {['Paleta aprobada', 'Contraste AA', 'Fuentes cargadas'].map((item) => (
              <li key={item}>
                <SpecimenTag {...shared} id="h6">{item}</SpecimenTag>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-4" style={{ borderColor: palette.hairline }}>
        <SpecimenTag {...shared} id="small" style={{ color: palette.muted }}>
          Actualizado hoy · 4 min de lectura
        </SpecimenTag>
        {micro.map((level) => (
          <SpecimenTag {...shared} key={level.id} id={level.id} style={{ color: palette.muted }}>
            Texto legal y créditos
          </SpecimenTag>
        ))}
      </footer>
    </article>
  );
}
