'use client';

import type { ReactNode } from 'react';
import { AlertCircle, BarChart3, Palette } from 'lucide-react';

export function UiSourceTypeMenu({
  name,
  onRole,
  onStatus,
  onData,
}: {
  name: string;
  onRole: () => void;
  onStatus: () => void;
  onData: () => void;
}) {
  return (
    <ul className="space-y-1" aria-label={`Tipo de asignación para ${name}`}>
      <TypeOption
        icon={<Palette aria-hidden="true" size={18} strokeWidth={2} className="text-forest" />}
        title="Rol de UI"
        description="Fondo, texto, primario y demás roles del sistema"
        onClick={onRole}
      />
      <TypeOption
        icon={<BarChart3 aria-hidden="true" size={18} strokeWidth={2} className="text-accent" />}
        title="Serie de datos"
        description="Al primer hueco libre de la serie"
        onClick={onData}
      />
      <TypeOption
        icon={<AlertCircle aria-hidden="true" size={18} strokeWidth={2} className="text-attention" />}
        title="Color de estado"
        description="Success, warning o danger"
        onClick={onStatus}
      />
    </ul>
  );
}

function TypeOption({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-11 w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-line-soft/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
      >
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-bg ring-1 ring-inset ring-line">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-tools-body-sm font-semibold text-ink">{title}</span>
          <span className="block text-tools-meta-scale text-muted">{description}</span>
        </span>
      </button>
    </li>
  );
}
