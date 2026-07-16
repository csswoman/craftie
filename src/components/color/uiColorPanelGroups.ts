import type { SemanticTokenName } from '@lib/color/semanticTokens';

export type CompactRoleDefinition = {
  token: SemanticTokenName;
  label: string;
};

export type CompactRoleGroupId = 'brand' | 'foundations';

export const COMPACT_ROLE_GROUPS: Record<
  CompactRoleGroupId,
  { title: string; subtitle: string; roles: readonly CompactRoleDefinition[] }
> = {
  brand: {
    title: 'Color de marca',
    subtitle: '3 roles · edita sin el ruido del resto del panel',
    roles: [
      { token: 'primary', label: 'Primario' },
      { token: 'secondary', label: 'Secundario' },
      { token: 'accent', label: 'Acento' },
    ],
  },
  foundations: {
    title: 'Fundaciones',
    subtitle: '4 roles · neutrales teñidos y contraste en contexto',
    roles: [
      { token: 'background', label: 'Fondo' },
      { token: 'surface', label: 'Superficie' },
      { token: 'border', label: 'Borde' },
      { token: 'on-background', label: 'Texto' },
    ],
  },
};

export const COMPACT_ROLE_COUNT = Object.values(COMPACT_ROLE_GROUPS)
  .reduce((count, group) => count + group.roles.length, 0);
