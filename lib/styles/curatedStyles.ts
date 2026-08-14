export type DesignStyle = {
  id: string;
  name: string;
  description: string;
  seeds: string[];
  /** 1–2 tags: primary filter vibe + optional secondary label. */
  mood: string[];
  thumbnailColors: string[];
};

function createStyle(
  id: string,
  name: string,
  description: string,
  mood: string[],
  colors: string[],
): DesignStyle {
  return { id, name, description, mood, seeds: colors, thumbnailColors: colors };
}

/**
 * Curated inspiration presets. Seeds must match `SELECTABLE_COLORS` hex values.
 * The opening grid intentionally alternates visual families for fast scanning.
 */
export const CURATED_DESIGN_STYLES: DesignStyle[] = [
  createStyle('chicle-electrico', 'Chicle eléctrico', 'Violeta, rosa chicle, limón y agua brillante para una identidad pop.', ['vibrante', 'pop'], ['#7643EF', '#F24F9D', '#FED46D', '#17A1CF', '#0F8283']),
  createStyle('brisa-de-laguna', 'Brisa de laguna', 'Teal profundo, agua mineral y blanco helado con un destello mandarina.', ['frío', 'fresco'], ['#10666C', '#5CAAA4', '#BBD1D6', '#F9FAFB', '#F6941D']),
  createStyle('cereza-atlantica', 'Cereza atlántica', 'Rojo cereza y acuamarina pálida sobre azules fríos de mar abierto.', ['editorial', 'frío'], ['#DD4350', '#BAD9CE', '#81BAC2', '#5CAAA4', '#062375']),
  createStyle('ciruela-de-tinta', 'Ciruela de tinta', 'Ciruela, malva y azul grisáceo para una expresión nocturna y sobria.', ['editorial', 'dramático'], ['#211525', '#5A4864', '#BBD1D6', '#7FBBC5', '#10666C']),
  createStyle('amanecer-tropical', 'Amanecer tropical', 'Mandarina luminosa, melocotón, blanco cálido y turquesa de piscina.', ['cálido', 'vibrante'], ['#F6941D', '#FED46D', '#FAFBFC', '#BAD9CE', '#3CA4A1']),
  createStyle('jardin-grafico', 'Jardín gráfico', 'Rojo vivo, naranja, violeta noche, teal y lima para un contraste botánico.', ['vibrante', 'gráfico'], ['#DD1440', '#F0662A', '#1D0E53', '#118C8C', '#B7ED21']),
  createStyle('plata-editorial', 'Plata editorial', 'Una escala de grises y blancos para sistemas limpios, silenciosos y precisos.', ['minimal', 'editorial'], ['#131313', '#5A4864', '#BBD1D6', '#E5E6E1', '#FAFBFC']),
  createStyle('arena-de-ciruela', 'Arena de ciruela', 'Rosa pálido, arena y ciruela oscura con una nota mantequilla contenida.', ['cálido', 'editorial'], ['#FADADA', '#D8843F', '#5A4864', '#241929', '#F5E45A']),
  createStyle('noir-y-nectar', 'Noir y néctar', 'Tinta, vino y crema se suavizan con un centro de cobre tostado.', ['editorial', 'dramático'], ['#070515', '#840B2A', '#F9FAFB', '#D8843F', '#4A3728']),
  createStyle('crepusculo-floral', 'Crepúsculo floral', 'Índigo, malva, rosa pétalo y coral en una progresión de atardecer.', ['editorial', 'romántico'], ['#070A3C', '#1D0E53', '#5A4864', '#F696B3', '#E2837D']),
  createStyle('cosecha-lacada', 'Cosecha lacada', 'Vino profundo, naranja tostado y amarillo mantequilla para una calidez densa.', ['cálido', 'editorial'], ['#241929', '#800928', '#F58215', '#D8843F', '#F5E45A']),
  createStyle('salvia-de-sol', 'Salvia de sol', 'Marfil, salvia, agua mineral y gris violeta para una calma contemporánea.', ['frío', 'sereno'], ['#F3F0E6', '#A6C9BF', '#82BBB3', '#5CAAA4', '#5A4864']),
  createStyle('hielo-de-pomelo', 'Hielo de pomelo', 'Blanco helado, rosa sorbete y coral con un final azul de piscina.', ['vibrante', 'frutal'], ['#FAFBFC', '#F8DAD8', '#E2847E', '#DF4D5A', '#18A0D0']),
  createStyle('acido-nocturno', 'Ácido nocturno', 'Lima neón, fucsia y violeta saturado recortados sobre un fondo oscuro.', ['vibrante', 'digital'], ['#070515', '#B7ED21', '#F24F9D', '#8E0ACB', '#7643EF']),
  createStyle('piscina-profunda', 'Piscina profunda', 'Turquesas superpuestos y azul Catalina para una paleta acuática sin rosa.', ['frío', 'profundo'], ['#BAD9CE', '#82BBB3', '#3CA4A1', '#097077', '#062375']),
  createStyle('rosa-de-claret', 'Rosa de claret', 'Rosa pétalo, rojo cereza y borgoña con un neutro claro de apoyo.', ['cálido', 'romántico'], ['#E5E6E1', '#F696B3', '#DD1440', '#840B2A', '#800928']),
  createStyle('sol-de-catalina', 'Sol de Catalina', 'Cian brillante, amarillo queso y naranja espacial frente a una noche azul.', ['vibrante', 'cósmico'], ['#17A1CF', '#18A0D0', '#FED46D', '#F0662A', '#062375']),
  createStyle('orquidea-magnetica', 'Orquídea magnética', 'Púrpuras y fucsia eléctrico equilibrados por malva humo y casi negro.', ['editorial', 'dramático'], ['#211525', '#5D4B65', '#6A1BAA', '#DA1BD7', '#F24F9D']),
  createStyle('lima-de-vidrio', 'Lima de vidrio', 'Menta, lima y amarillo mantequilla sobre un teal de agua clara.', ['vibrante', 'fresco'], ['#A1F1A6', '#A6C9BF', '#B7ED21', '#F5E45A', '#0F8283']),
  createStyle('vino-mandarina', 'Vino mandarina', 'Borgoña y ciruela se calientan con mandarina y naranja quemado.', ['cálido', 'lujoso'], ['#840B2A', '#5A4864', '#F58215', '#F0662A', '#241929']),
];
