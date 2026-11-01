import type { CSSProperties, ReactNode } from 'react';

import type { PaletteRoleId } from '@lib/color/rolePalette';
import { useT } from '@/context/I18nContext';

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
  const t = useT();
  return (
    <div
      className={className}
      style={style}
      title={onEditRole ? t('ui.PreviewRoleTarget.doble-clic-para-editar-color') : undefined}
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
