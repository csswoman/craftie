import { Accessibility, Download, Image, Palette, Type } from 'lucide-react';

export const HELP_ITEMS = [
  { icon: Image, label: 'Inspiración', description: 'Estilos curados o colores extraídos de una imagen.' },
  { icon: Palette, label: 'Colores', description: 'Roles semánticos, temas y ajustes en OKLCH.' },
  { icon: Accessibility, label: 'Accesibilidad', description: 'Contraste WCAG y lectura complementaria APCA.' },
  { icon: Type, label: 'Tipografía', description: 'Parejas curadas, Google Fonts y fuentes locales.' },
  { icon: Download, label: 'Exportación', description: 'CSS, design tokens (JSON), Figma, DESIGN.md y brand kit.' },
] as const;

export function HintIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={className} fill="none">
      <path
        d="M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.25 6.35A1.9 1.9 0 0 1 8.1 5c1.05 0 1.8.62 1.8 1.5 0 .72-.42 1.13-1.05 1.5-.54.32-.85.58-.85 1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M8 11h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
