'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  ACCENT_FAMILY_SIZE,
  accentFamilyLabel,
  accentFamilyPrimaryToken,
  accentSlotHex,
  varyAccentSlotHex,
} from '@lib/color/accentFamily';
import { nameForHex } from '@lib/color/naming';

import { useMinWidthQuery } from '@/lib/browser/useMinWidthQuery';
import { useRolePalette } from '@/context/RolePaletteContext';

import { AccentSlotCell } from './AccentSlotCell';

export type AccentSlotStripProps = {
  editable?: boolean;
  onOpenDetails: (hex: string) => void;
};

export function AccentSlotStrip({ editable = true, onOpenDetails }: AccentSlotStripProps) {
  const {
    semanticTokens,
    rolePalette,
    replaceSemanticToken,
  } = useRolePalette();
  const isWideLayout = useMinWidthQuery(1280);
  const [activeIndex, setActiveIndex] = useState(0);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const slots = useMemo(() => {
    if (!semanticTokens) return [];
    const palette = Array.from({ length: ACCENT_FAMILY_SIZE }, (_, index) => {
      const hex = accentSlotHex(semanticTokens, index);
      return { hex };
    });
    return Array.from({ length: ACCENT_FAMILY_SIZE }, (_, index) => {
      const hex = accentSlotHex(semanticTokens, index);
      return {
        index,
        label: accentFamilyLabel(index),
        hex,
        name: hex
          ? nameForHex(hex, palette.filter((entry): entry is { hex: string } => entry.hex !== null))
          : 'Sin asignar',
      };
    });
  }, [semanticTokens]);

  const handleCopyHex = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex.toUpperCase());
      setCopyMessage('HEX copiado');
      window.setTimeout(() => setCopyMessage(null), 1500);
    } catch {
      setCopyMessage('No se pudo copiar');
      window.setTimeout(() => setCopyMessage(null), 1500);
    }
  }, []);

  if (!semanticTokens || slots.length === 0) return null;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {copyMessage ? (
        <p
          role="status"
          className="pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-md border border-border bg-ink px-2.5 py-1 text-chrome-caption font-medium text-bg shadow-md"
        >
          {copyMessage}
        </p>
      ) : null}

      <ul
        className={`flex min-h-0 h-full flex-1 flex-col divide-y divide-white/10 ${
          isWideLayout ? 'min-h-[420px]' : 'min-h-0'
        }`}
        aria-label="Familia de acentos"
      >
        {slots.map((slot) => (
          <AccentSlotCell
            key={slot.index}
            label={slot.label}
            name={slot.name}
            hex={slot.hex}
            expanded
            editable={editable}
            isWideLayout={isWideLayout}
            isActive={activeIndex === slot.index}
            onSelect={() => setActiveIndex(slot.index)}
            onOpenDetails={onOpenDetails}
            onVary={() => {
              const nextHex = varyAccentSlotHex(semanticTokens, slot.index, {
                fondoHex: rolePalette?.fondo.hex,
                superficieHex: rolePalette?.superficie.hex,
                textoHex: rolePalette?.texto.hex,
              });
              replaceSemanticToken(accentFamilyPrimaryToken(slot.index), nextHex);
            }}
            onCopyHex={() => {
              if (slot.hex) void handleCopyHex(slot.hex);
            }}
          />
        ))}
      </ul>
    </div>
  );
}
