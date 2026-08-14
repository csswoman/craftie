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
    seeds: ['#F7F7F5', '#9ADBD6', '#E8D44D', '#6DB38B', '#2C3E50'],
    mood: ['frío', 'sereno'],
    thumbnailColors: ['#F7F7F5', '#9ADBD6', '#E8D44D', '#6DB38B', '#2C3E50'],
  },
  {
    id: 'editorial-claro',
    name: 'Editorial claro',
    description: 'Neutros amplios, acento fresco y texto profundo para interfaces limpias.',
    seeds: ['#F7F7F5', '#EFEFE8', '#9ADBD6', '#7EC8E3', '#1A1C1E'],
    mood: ['editorial', 'minimal'],
    thumbnailColors: ['#F7F7F5', '#EFEFE8', '#9ADBD6', '#7EC8E3', '#1A1C1E'],
  },
  {
    id: 'calor-suave',
    name: 'Calor suave',
    description: 'Tonos cálidos y acogedores con contraste suficiente para producto digital.',
    seeds: ['#F5F3EE', '#F4A261', '#E8D44D', '#E76F51', '#3D2B1F'],
    mood: ['cálido', 'acogedor'],
    thumbnailColors: ['#F5F3EE', '#F4A261', '#E8D44D', '#E76F51', '#3D2B1F'],
  },
  {
    id: 'cielo-despejado',
    name: 'Cielo despejado',
    description: 'Azules luminosos, verde lima y gris pizarra para marcas frescas.',
    seeds: ['#F7F7F5', '#7EC8E3', '#B8E986', '#9ADBD6', '#3A3D40'],
    mood: ['frío', 'fresco'],
    thumbnailColors: ['#F7F7F5', '#7EC8E3', '#B8E986', '#9ADBD6', '#3A3D40'],
  },
  {
    id: 'neon-noche',
    name: 'Neón noche',
    description: 'Rosas y violetas intensos sobre un neutro casi negro.',
    seeds: ['#1A1C1E', '#C9A0DC', '#F2A0A8', '#E76F51', '#2C3E50'],
    mood: ['vibrante', 'audaz'],
    thumbnailColors: ['#1A1C1E', '#C9A0DC', '#F2A0A8', '#E76F51', '#2C3E50'],
  },
  {
    id: 'concreto',
    name: 'Concreto',
    description: 'Escala de grises fríos para sistemas minimalistas y técnicos.',
    seeds: ['#FAFAFA', '#D9D7D0', '#E2E0DA', '#2E3133', '#1A1C1E'],
    mood: ['minimal', 'neutro'],
    thumbnailColors: ['#FAFAFA', '#D9D7D0', '#E2E0DA', '#2E3133', '#1A1C1E'],
  },
  {
    id: 'nota-floral',
    name: 'Nota floral',
    description: 'Rosas y violetas suaves con un neutro boscoso de apoyo.',
    seeds: ['#F3F0E6', '#F2A0A8', '#C9A0DC', '#6DB38B', '#1F3D2B'],
    mood: ['cálido', 'suave'],
    thumbnailColors: ['#F3F0E6', '#F2A0A8', '#C9A0DC', '#6DB38B', '#1F3D2B'],
  },
  {
    id: 'atardecer-coral',
    name: 'Atardecer coral',
    description: 'Coral y azafrán con un marrón profundo de anclaje.',
    seeds: ['#F5F3EE', '#E76F51', '#F4B942', '#E8D44D', '#4A3728'],
    mood: ['cálido', 'vibrante'],
    thumbnailColors: ['#F5F3EE', '#E76F51', '#F4B942', '#E8D44D', '#4A3728'],
  },
  {
    id: 'bosque-profundo',
    name: 'Bosque profundo',
    description: 'Verdes de pradera y agua sobre un pino oscuro.',
    seeds: ['#F3F0E6', '#6DB38B', '#9ADBD6', '#B8E986', '#243B36'],
    mood: ['frío', 'natural'],
    thumbnailColors: ['#F3F0E6', '#6DB38B', '#9ADBD6', '#B8E986', '#243B36'],
  },
  {
    id: 'papel-tinta',
    name: 'Papel y tinta',
    description: 'Neutros de papel con tinta casi negra para lectura editorial.',
    seeds: ['#F7F7F5', '#EFEFE8', '#E8E6DF', '#D9D7D0', '#1A1C1E'],
    mood: ['editorial', 'minimal'],
    thumbnailColors: ['#F7F7F5', '#EFEFE8', '#E8E6DF', '#D9D7D0', '#1A1C1E'],
  },
  {
    id: 'limonada',
    name: 'Limonada',
    description: 'Amarillo y lima brillantes con un gris de contraste.',
    seeds: ['#F7F7F5', '#E8D44D', '#B8E986', '#9ADBD6', '#3A3D40'],
    mood: ['cálido', 'luminoso'],
    thumbnailColors: ['#F7F7F5', '#E8D44D', '#B8E986', '#9ADBD6', '#3A3D40'],
  },
  {
    id: 'oceano-noche',
    name: 'Océano noche',
    description: 'Azules costeros y un twilight profundo para marcas nocturnas.',
    seeds: ['#F7F7F5', '#7EC8E3', '#9ADBD6', '#6DB38B', '#2C3E50'],
    mood: ['frío', 'profundo'],
    thumbnailColors: ['#F7F7F5', '#7EC8E3', '#9ADBD6', '#6DB38B', '#2C3E50'],
  },
  {
    id: 'terracota',
    name: 'Terracota',
    description: 'Naranja y coral artesanales con un marrón de tierra.',
    seeds: ['#F5F3EE', '#F4A261', '#E76F51', '#F2A0A8', '#3D2B1F'],
    mood: ['cálido', 'artesanal'],
    thumbnailColors: ['#F5F3EE', '#F4A261', '#E76F51', '#F2A0A8', '#3D2B1F'],
  },
  {
    id: 'niebla-urbana',
    name: 'Niebla urbana',
    description: 'Blancos fríos y grafito para interfaces urbanas sobrias.',
    seeds: ['#FAFAFA', '#F7F7F5', '#D9D7D0', '#E2E0DA', '#2E3133'],
    mood: ['minimal', 'editorial'],
    thumbnailColors: ['#FAFAFA', '#F7F7F5', '#D9D7D0', '#E2E0DA', '#2E3133'],
  },
  {
    id: 'orchidea-digital',
    name: 'Orquídea digital',
    description: 'Violetas y rosas saturados sobre un neutro casi negro.',
    seeds: ['#1A1C1E', '#C9A0DC', '#F2A0A8', '#E76F51', '#2C3E50'],
    mood: ['vibrante', 'expresivo'],
    thumbnailColors: ['#1A1C1E', '#C9A0DC', '#F2A0A8', '#E76F51', '#2C3E50'],
  },
  {
    id: 'musgo-suave',
    name: 'Musgo suave',
    description: 'Verde pradera, lino claro y bosque profundo.',
    seeds: ['#F3F0E6', '#6DB38B', '#9ADBD6', '#B8E986', '#1F3D2B'],
    mood: ['frío', 'natural'],
    thumbnailColors: ['#F3F0E6', '#6DB38B', '#9ADBD6', '#B8E986', '#1F3D2B'],
  },
  {
    id: 'azafran-claro',
    name: 'Azafrán claro',
    description: 'Azafrán editorial sobre cáscara y dusk cálido.',
    seeds: ['#F5F3EE', '#F4B942', '#E8D44D', '#F4A261', '#4A3728'],
    mood: ['editorial', 'cálido'],
    thumbnailColors: ['#F5F3EE', '#F4B942', '#E8D44D', '#F4A261', '#4A3728'],
  },
  {
    id: 'carbono',
    name: 'Carbono',
    description: 'Escala técnica de ceniza y grafito sin acentos saturados.',
    seeds: ['#FAFAFA', '#E2E0DA', '#D9D7D0', '#2E3133', '#1A1C1E'],
    mood: ['minimal', 'técnico'],
    thumbnailColors: ['#FAFAFA', '#E2E0DA', '#D9D7D0', '#2E3133', '#1A1C1E'],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Lima y brisa con un ancla de pino para marcas energéticas.',
    seeds: ['#F7F7F5', '#B8E986', '#7EC8E3', '#9ADBD6', '#243B36'],
    mood: ['vibrante', 'fresco'],
    thumbnailColors: ['#F7F7F5', '#B8E986', '#7EC8E3', '#9ADBD6', '#243B36'],
  },
  {
    id: 'cafe-editorial',
    name: 'Café editorial',
    description: 'Lino, néctar y ember para marcas editoriales cálidas.',
    seeds: ['#F3F0E6', '#F4A261', '#F4B942', '#E76F51', '#3D2B1F'],
    mood: ['editorial', 'cálido'],
    thumbnailColors: ['#F3F0E6', '#F4A261', '#F4B942', '#E76F51', '#3D2B1F'],
  },
];
