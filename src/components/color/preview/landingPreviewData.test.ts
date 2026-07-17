import { describe, expect, it } from 'vitest';

import {
  CRAFTIE_QUOTE,
  HERO_COPY,
  LANDING_NAV,
  PLANS,
  STUDIO_STEPS,
  STUDIO_TRAIL,
} from './landingPreviewData';
import { LANDING_CONTAINER_CLASS } from './LandingLayoutPreview';

describe('Craftie landing content', () => {
  it('uses its own preview width as the responsive breakpoint context', () => {
    expect(LANDING_CONTAINER_CLASS).toContain('@container/landing');
  });

  it('brands the preview as Craftie the dog designer studio', () => {
    expect(HERO_COPY.kicker.toLowerCase()).toContain('perro');
    expect(HERO_COPY.headline.toLowerCase()).toContain('paleta');
    expect(LANDING_NAV).toEqual(['Estudio', 'Paletas', 'Guías']);
  });

  it('walks a studio trail instead of fake partner logos', () => {
    expect(STUDIO_TRAIL.map((item) => item.label)).toEqual([
      'Semilla',
      'Roles',
      'Contraste',
      'Export',
    ]);
    expect(STUDIO_TRAIL.map((item) => item.slot)).toEqual([
      'data1',
      'data2',
      'data3',
      'data4',
    ]);
  });

  it('describes Craftie process steps, not SaaS feature cards', () => {
    expect(STUDIO_STEPS.map((step) => step.title)).toEqual([
      'Mezclar',
      'Contrastar',
      'Entregar',
    ]);
  });

  it('offers studio kits named for Craftie work', () => {
    expect(PLANS.map((plan) => plan.name)).toEqual(['Boceto', 'Estudio', 'Atelier']);
    expect(PLANS.some((plan) => 'featured' in plan && plan.featured)).toBe(true);
  });

  it('quotes a designer about Craftie the dog', () => {
    expect(CRAFTIE_QUOTE.text.toLowerCase()).toContain('perro');
    expect(CRAFTIE_QUOTE.author.length).toBeGreaterThan(0);
  });
});
