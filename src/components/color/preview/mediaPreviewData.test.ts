import { describe, expect, it } from 'vitest';

import {
  getMediaSessionLabel,
  MEDIA_CONTAINER_CLASS,
  MEDIA_MOODS,
  MEDIA_NOW_PLAYING,
  MEDIA_QUEUE,
  MEDIA_STATS,
} from './mediaPreviewData';

describe('Craftie media content', () => {
  it('uses its own preview width as the responsive breakpoint context', () => {
    expect(MEDIA_CONTAINER_CLASS).toContain('@container/media');
  });

  it('models Craftie studio radio instead of a generic music app', () => {
    expect(MEDIA_NOW_PLAYING.title).toBe('Pigmento fresco');
    expect(MEDIA_NOW_PLAYING.artist.toLowerCase()).toContain('craftie');
    expect(MEDIA_MOODS.map((mood) => mood.label)).toEqual(['Mezcla', 'Foco', 'Secado']);
  });

  it('queues studio tracks that exercise data colors', () => {
    expect(MEDIA_QUEUE.map((item) => item.track)).toEqual([
      'Huella naranja',
      'Contraste AA',
      'Guía en seco',
    ]);
    expect(MEDIA_STATS.map((stat) => stat.label)).toEqual(['En cola', 'Guardadas']);
  });

  it('names the session by time of day', () => {
    expect(getMediaSessionLabel(9)).toBe('Sesión de mañana');
    expect(getMediaSessionLabel(15)).toBe('Sesión de tarde');
    expect(getMediaSessionLabel(21)).toBe('Sesión nocturna');
  });
});
