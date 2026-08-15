'use client';

import type { CustomFont } from '@lib/typography/customFonts';
import type { CustomFontSubmitInput } from './CustomFontModal';

import { GoogleFontAutocomplete } from './GoogleFontAutocomplete';

export type { CustomFontSubmitInput };

export type CustomFontEntryProps = {
  customFonts: CustomFont[];
  headingFamily: string;
  bodyFamily: string;
  onApply: (input: CustomFontSubmitInput) => Promise<void>;
};

export function CustomFontEntry({
  customFonts: _customFonts,
  headingFamily,
  bodyFamily,
  onApply,
}: CustomFontEntryProps) {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 border-t border-border pt-3">
      <GoogleFontAutocomplete
        key={`heading:${headingFamily}`}
        label="Titular"
        role="heading"
        initialFamily={headingFamily}
        onApply={(family, role) => onApply({ family, source: 'google', role })}
      />
      <GoogleFontAutocomplete
        key={`body:${bodyFamily}`}
        label="Cuerpo"
        role="body"
        initialFamily={bodyFamily}
        onApply={(family, role) => onApply({ family, source: 'google', role })}
      />
    </div>
  );
}
