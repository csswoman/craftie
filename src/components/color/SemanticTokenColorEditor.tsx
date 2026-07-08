'use client';

import { useMemo } from 'react';

import {
  getSemanticTokenContrastInfo,
  SEMANTIC_TOKEN_LABELS,
} from '@lib/color/semanticTokenTargets';
import type { SemanticTokenName } from '@lib/color/semanticTokens';
import { normalizeHex } from '@lib/color/normalizeHex';
import {
  hexToOklchChannels,
  maxOklchChromaForSrgb,
  oklchChannelsToHex,
} from '@lib/utils/colorMath';

import { useRolePalette } from '@/context/RolePaletteContext';
import {
  RoleContrastBadge,
  RoleHexInput,
  RoleOklchSliders,
} from './RoleColorEditorControls';

export function SemanticTokenColorEditor({
  tokenName,
  idPrefix = 'semantic-token-editor',
  showSwatch = true,
}: {
  tokenName: SemanticTokenName;
  idPrefix?: string;
  showSwatch?: boolean;
}) {
  const { semanticTokens, replaceSemanticToken } = useRolePalette();
  const token = semanticTokens?.[tokenName] ?? null;

  const oklch = useMemo(() => (token ? hexToOklchChannels(token.hex) : null), [token]);
  const chromaMax = useMemo(
    () => (oklch ? Math.max(0.001, maxOklchChromaForSrgb(oklch.l, oklch.h)) : 0),
    [oklch],
  );
  const contrast = useMemo(
    () => (semanticTokens ? getSemanticTokenContrastInfo(semanticTokens, tokenName) : null),
    [semanticTokens, tokenName],
  );

  if (!token || !oklch) {
    return null;
  }

  function updateOklch(patch: Partial<{ l: number; c: number; h: number }>) {
    if (!oklch) {
      return;
    }

    const next = {
      l: patch.l ?? oklch.l,
      c: patch.c ?? oklch.c,
      h: patch.h ?? oklch.h,
    };

    replaceSemanticToken(tokenName, oklchChannelsToHex(next.l, next.c, next.h));
  }

  function handleHexCommit(raw: string) {
    const trimmed = raw.trim();

    if (trimmed.length === 0) {
      return;
    }

    try {
      const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
      replaceSemanticToken(tokenName, normalizeHex(withHash));
    } catch {
      // Keep the current token value until the hex is valid.
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        {showSwatch ? (
          <div
            className="size-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-inset ring-ink/10"
            style={{ backgroundColor: token.hex }}
            aria-hidden="true"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="mb-2 truncate text-[0.75rem] font-semibold text-muted">
            {SEMANTIC_TOKEN_LABELS[tokenName]}
          </p>
          <RoleHexInput
            hex={token.hex}
            disabled={false}
            inputId={`${idPrefix}-hex`}
            onCommit={handleHexCommit}
          />
        </div>
      </div>

      <RoleOklchSliders
        idPrefix={idPrefix}
        oklch={oklch}
        chromaMax={chromaMax}
        disabled={false}
        onChange={updateOklch}
      />

      {contrast ? <RoleContrastBadge contrast={contrast} /> : null}
    </div>
  );
}
