export type DesignStyle = {
  id: string;
  name: string;
  description: string;
  seeds: string[];
  /** 1–2 tags: primary filter vibe + optional secondary label. */
  mood: string[];
  thumbnailColors: string[];
};

/**
 * Curated inspiration presets. Seeds must match `SELECTABLE_COLORS` hex values.
 * Filter chips use: cálido | frío | minimal | editorial | vibrante.
 */
export const CURATED_DESIGN_STYLES: DesignStyle[] = [
  {
    id: 'bosque-sereno',
    name: 'Bosque sereno',
    description: 'Verdes acuosos con un acento cálido y un neutro profundo equilibrado.',
    seeds: ['#9ADBD6', '#E8D44D', '#2C3E50'],
    mood: ['frío', 'sereno'],
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
    id: 'cielo-despejado',
    name: 'Cielo despejado',
    description: 'Azules luminosos, verde lima y gris pizarra para marcas frescas.',
    seeds: ['#7EC8E3', '#B8E986', '#3A3D40'],
    mood: ['frío', 'fresco'],
    thumbnailColors: ['#7EC8E3', '#B8E986', '#3A3D40'],
  },
  {
    id: 'neon-noche',
    name: 'Neón noche',
    description: 'Rosas y violetas intensos sobre un neutro casi negro.',
    seeds: ['#F2A0A8', '#C9A0DC', '#1A1C1E'],
    mood: ['vibrante', 'audaz'],
    thumbnailColors: ['#F2A0A8', '#C9A0DC', '#1A1C1E'],
  },
  {
    id: 'concreto',
    name: 'Concreto',
    description: 'Escala de grises fríos para sistemas minimalistas y técnicos.',
    seeds: ['#D9D7D0', '#E2E0DA', '#2E3133'],
    mood: ['minimal', 'neutro'],
    thumbnailColors: ['#D9D7D0', '#E2E0DA', '#2E3133'],
  },
  {
    id: 'nota-floral',
    name: 'Nota floral',
    description: 'Rosas y violetas suaves con un neutro boscoso de apoyo.',
    seeds: ['#F2A0A8', '#C9A0DC', '#1F3D2B'],
    mood: ['cálido', 'suave'],
    thumbnailColors: ['#F2A0A8', '#C9A0DC', '#1F3D2B'],
  },
  {
    id: 'atardecer-coral',
    name: 'Atardecer coral',
    description: 'Coral y azafrán con un marrón profundo de anclaje.',
    seeds: ['#E76F51', '#F4B942', '#4A3728'],
    mood: ['cálido', 'vibrante'],
    thumbnailColors: ['#E76F51', '#F4B942', '#4A3728'],
  },
  {
    id: 'bosque-profundo',
    name: 'Bosque profundo',
    description: 'Verdes de pradera y agua sobre un pino oscuro.',
    seeds: ['#6DB38B', '#9ADBD6', '#243B36'],
    mood: ['frío', 'natural'],
    thumbnailColors: ['#6DB38B', '#9ADBD6', '#243B36'],
  },
  {
    id: 'papel-tinta',
    name: 'Papel y tinta',
    description: 'Neutros de papel con tinta casi negra para lectura editorial.',
    seeds: ['#EFEFE8', '#E8E6DF', '#1A1C1E'],
    mood: ['editorial', 'minimal'],
    thumbnailColors: ['#EFEFE8', '#E8E6DF', '#1A1C1E'],
  },
  {
    id: 'limonada',
    name: 'Limonada',
    description: 'Amarillo y lima brillantes con un gris de contraste.',
    seeds: ['#E8D44D', '#B8E986', '#3A3D40'],
    mood: ['cálido', 'luminoso'],
    thumbnailColors: ['#E8D44D', '#B8E986', '#3A3D40'],
  },
  {
    id: 'oceano-noche',
    name: 'Océano noche',
    description: 'Azules costeros y un twilight profundo para marcas nocturnas.',
    seeds: ['#7EC8E3', '#9ADBD6', '#2C3E50'],
    mood: ['frío', 'profundo'],
    thumbnailColors: ['#7EC8E3', '#9ADBD6', '#2C3E50'],
  },
  {
    id: 'terracota',
    name: 'Terracota',
    description: 'Naranja y coral artesanales con un marrón de tierra.',
    seeds: ['#F4A261', '#E76F51', '#3D2B1F'],
    mood: ['cálido', 'artesanal'],
    thumbnailColors: ['#F4A261', '#E76F51', '#3D2B1F'],
  },
  {
    id: 'niebla-urbana',
    name: 'Niebla urbana',
    description: 'Blancos fríos y grafito para interfaces urbanas sobrias.',
    seeds: ['#FAFAFA', '#D9D7D0', '#2E3133'],
    mood: ['minimal', 'editorial'],
    thumbnailColors: ['#FAFAFA', '#D9D7D0', '#2E3133'],
  },
  {
    id: 'orchidea-digital',
    name: 'Orquídea digital',
    description: 'Violetas y rosas saturados sobre un neutro casi negro.',
    seeds: ['#C9A0DC', '#F2A0A8', '#2C3E50'],
    mood: ['vibrante', 'expresivo'],
    thumbnailColors: ['#C9A0DC', '#F2A0A8', '#2C3E50'],
  },
  {
    id: 'musgo-suave',
    name: 'Musgo suave',
    description: 'Verde pradera, lino claro y bosque profundo.',
    seeds: ['#6DB38B', '#F3F0E6', '#1F3D2B'],
    mood: ['frío', 'natural'],
    thumbnailColors: ['#6DB38B', '#F3F0E6', '#1F3D2B'],
  },
  {
    id: 'azafran-claro',
    name: 'Azafrán claro',
    description: 'Azafrán editorial sobre cáscara y dusk cálido.',
    seeds: ['#F4B942', '#F5F3EE', '#4A3728'],
    mood: ['editorial', 'cálido'],
    thumbnailColors: ['#F4B942', '#F5F3EE', '#4A3728'],
  },
  {
    id: 'carbono',
    name: 'Carbono',
    description: 'Escala técnica de ceniza y grafito sin acentos saturados.',
    seeds: ['#E2E0DA', '#2E3133', '#1A1C1E'],
    mood: ['minimal', 'técnico'],
    thumbnailColors: ['#E2E0DA', '#2E3133', '#1A1C1E'],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Lima y brisa con un ancla de pino para marcas energéticas.',
    seeds: ['#B8E986', '#7EC8E3', '#243B36'],
    mood: ['vibrante', 'fresco'],
    thumbnailColors: ['#B8E986', '#7EC8E3', '#243B36'],
  },
  {
    id: 'cafe-editorial',
    name: 'Café editorial',
    description: 'Lino, néctar y ember para marcas editoriales cálidas.',
    seeds: ['#F3F0E6', '#F4A261', '#3D2B1F'],
    mood: ['editorial', 'cálido'],
    thumbnailColors: ['#F3F0E6', '#F4A261', '#3D2B1F'],
  },
];
