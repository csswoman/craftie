export type StudioShortcut = {
  keys: string;
  label: string;
  when: string;
};

export const STUDIO_SHORTCUTS: StudioShortcut[] = [
  {
    keys: 'mod+Enter',
    label: 'Crear guía de marca',
    when: 'Con paleta por roles lista en fase de ajuste',
  },
  {
    keys: 'Esc',
    label: 'Cerrar menús y vistas ampliadas',
    when: 'Con un modal o menú abierto',
  },
  {
    keys: '?',
    label: 'Mostrar atajos',
    when: 'En cualquier momento del estudio',
  },
];

export function isGenerateShortcut(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey'>): boolean {
  return event.key === 'Enter' && (event.ctrlKey || event.metaKey);
}

export function isShortcutsHelpShortcut(
  event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'target'>,
): boolean {
  if (event.key !== '?' || event.ctrlKey || event.metaKey || event.altKey) {
    return false;
  }

  return shouldIgnoreStudioShortcut(event.target) === false;
}

export function shouldIgnoreStudioShortcut(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') {
    return false;
  }

  const element = target as {
    isContentEditable?: boolean;
    tagName?: string;
    type?: string;
  };

  if (element.isContentEditable) {
    return true;
  }

  const tagName = element.tagName?.toUpperCase();

  if (tagName === 'TEXTAREA') {
    return true;
  }

  if (tagName === 'INPUT') {
    const type = element.type ?? 'text';
    return !['button', 'submit', 'reset', 'checkbox', 'radio'].includes(type);
  }

  return false;
}

export function formatShortcutKeys(keys: string): string {
  if (keys === 'mod+Enter') {
    if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)) {
      return '⌘ + Enter';
    }

    return 'Ctrl + Enter';
  }

  return keys;
}
