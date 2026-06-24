export type DesignStyle = {
  id: string;
  name: string;
  description: string;
  seeds: string[];
  mood: string[];
  thumbnailColors: string[];
};

/** Original curated inspiration presets mapped to catalog HEX seeds. */
export const CURATED_DESIGN_STYLES: DesignStyle[] = [
  {
    id: 'bosque-sereno',
    name: 'Bosque sereno',
    description: 'Verdes acuosos con un acento cálido y un neutro profundo equilibrado.',
    seeds: ['#9ADBD6', '#E8D44D', '#2C3E50'],
    mood: ['sereno', 'natural'],
    thumbnailColors: ['#9ADBD6', '#E8D44D', '#2C3E50'],
  },
  {
    id: 'editorial-claro',
    name: 'Editorial claro',
    description: 'Neutros amplios, acento fresco y texto profundo para interfaces limpias.',
    seeds: ['#F7F7F5', '#9ADBD6', '#1A1C1E'],
    mood: ['editorial', 'minimal'],
    thumbnailColors: ['#F7F7F5', '#9ADBD6', '#1A1C1E'],
  },
  {
    id: 'calor-suave',
    name: 'Calor suave',
    description: 'Tonos cálidos y acogedores con contraste suficiente para producto digital.',
    seeds: ['#F4A261', '#E8D44D', '#3D2B1F'],
    mood: ['cálido', 'acogedor'],
    thumbnailColors: ['#F4A261', '#E8D44D', '#3D2B1F'],
  },
  {
    id: 'brisa-costera',
    name: 'Brisa costera',
    description: 'Azules luminosos, verde menta y gris pizarra para marcas frescas.',
    seeds: ['#7EC8E3', '#B8E986', '#3A3D40'],
    mood: ['fresco', 'luminoso'],
    thumbnailColors: ['#7EC8E3', '#B8E986', '#3A3D40'],
  },
  {
    id: 'nota-floral',
    name: 'Nota floral',
    description: 'Rosas y violetas suaves con un neutro boscoso de apoyo.',
    seeds: ['#F2A0A8', '#C9A0DC', '#1F3D2B'],
    mood: ['expresivo', 'suave'],
    thumbnailColors: ['#F2A0A8', '#C9A0DC', '#1F3D2B'],
  },
];
