import type { CSSProperties, ReactNode } from 'react';

import type { PaletteRoleId } from '@lib/color/rolePalette';

export type PreviewRoleEditHandler = (role: PaletteRoleId, element: HTMLElement) => void;

export function PreviewRoleTarget({
  role,
  onEditRole,
  children,
  className,
  style,
}: {
  role: PaletteRoleId;
  onEditRole?: PreviewRoleEditHandler;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={style}
      title={onEditRole ? 'Doble clic para editar color del rol' : undefined}
      onDoubleClick={(event) => {
        if (!onEditRole) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        onEditRole(role, event.currentTarget);
      }}
    >
      {children}
    </div>
  );
}
