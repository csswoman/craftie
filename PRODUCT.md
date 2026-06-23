# Product

## Register

product

## Users

Diseñadores, desarrolladores y creadores que construyen sistemas visuales (paletas, tipografía, guías de marca). Usan la herramienta en contexto de trabajo creativo: explorar colores, validar accesibilidad y exportar decisiones reutilizables. El foco inicial es uso personal y portfolio, no un producto enterprise.

## Product Purpose

Palette & Type Tool ayuda a generar paletas de color coherentes, evaluar contraste WCAG, recomendar combinaciones tipográficas y exportar guías de marca ligeras. El flujo guía en cinco pasos: inspiración → selección de color → accesibilidad → tipografía → guardar/exportar.

Éxito = decisiones de diseño claras, comprobables y exportables, sin abrumar con jerga innecesaria.

## Brand Personality

Clara · Precisa · Confiable

La interfaz debe sentirse como una herramienta de trabajo: directa, honesta sobre accesibilidad, sin postureo visual. La confianza viene de mostrar cálculos y resultados, no de efectos decorativos.

## Anti-references

- Clones o imitaciones de Coolors, Adobe Color u otras herramientas comerciales.
- SaaS genérico: Inter por defecto, gradientes morados, grids de cards idénticas, hero-metrics.
- Interfaces que esconden problemas de contraste detrás de estética “elegante”.
- Demasiados controles o terminología avanzada sin guía práctica.
- Dark mode por defecto sin relación con el contexto de uso.

## Design Principles

1. **Practice what you preach** — una herramienta de accesibilidad debe cumplir WCAG en su propia UI.
2. **Show, don't tell** — mostrar ratio, nivel AA/AAA y pass/fail con datos, no solo etiquetas vagas.
3. **Simplicity over spectacle** — priorizar claridad y flujo de trabajo sobre decoración.
4. **Deterministic core** — la lógica de color y contraste vive en `/lib`, testeable y predecible.
5. **Earned familiarity** — patrones de UI estándar de herramientas de producto; consistencia entre pantallas.

## Accessibility & Inclusion

- Objetivo: cumplir **WCAG 2.2 AA** como mínimo en toda la UI; evaluar y comunicar **AAA** donde aplique en el motor de contraste.
- Respetar `prefers-reduced-motion` en animaciones futuras.
- No depender solo del color para estados (pass/fail, errores, selección).
- Texto y placeholders con contraste verificable (≥4.5:1 cuerpo, ≥3:1 texto grande).
