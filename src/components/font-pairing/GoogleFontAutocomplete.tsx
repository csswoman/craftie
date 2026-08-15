'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

import {
  filterGoogleFontsByPrefix,
  type GoogleFontOption,
} from '@lib/typography/googleFontsCatalog';
import type { CustomFontRole } from '@lib/typography/customFonts';

import { getGoogleFontsCatalog } from '@/lib/browser/googleFontsCatalog';

export function GoogleFontAutocomplete({
  label,
  role,
  initialFamily,
  onApply,
  hideLabel = false,
}: {
  label: string;
  role: CustomFontRole;
  initialFamily: string;
  onApply: (family: string, role: CustomFontRole) => Promise<void>;
  hideLabel?: boolean;
}) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState(initialFamily);
  const [fonts, setFonts] = useState<GoogleFontOption[] | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [applyingFont, setApplyingFont] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number; width: number } | null>(null);
  const [hoveredFamily, setHoveredFamily] = useState<{ family: string; left: number; top: number } | null>(null);

  const suggestions = useMemo(
    () => (fonts ? filterGoogleFontsByPrefix(fonts, query) : []),
    [fonts, query],
  );
  const expanded = focused && suggestions.length > 0 && !applyingFont;

  const updateMenuPosition = useCallback(() => {
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    setMenuPosition({ left: rect.left, top: rect.bottom + 4, width: rect.width });
  }, []);

  useEffect(() => {
    if (!expanded || !inputRef.current) {
      return;
    }

    const input = inputRef.current;
    const observer = new ResizeObserver(updateMenuPosition);
    observer.observe(input);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [expanded, updateMenuPosition]);

  useEffect(() => {
    if (!expanded) {
      return;
    }

    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setFocused(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress);
  }, [expanded]);

  async function loadList() {
    if (fonts || loadingList) {
      return;
    }

    setLoadingList(true);
    setError(null);
    try {
      setFonts(await getGoogleFontsCatalog());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar Google Fonts.');
    } finally {
      setLoadingList(false);
    }
  }

  async function selectFont(font: GoogleFontOption) {
    setQuery(font.family);
    setActiveIndex(-1);
    setError(null);
    setApplyingFont(true);
    try {
      await onApply(font.family, role);
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : 'No se pudo aplicar la fuente.');
    } finally {
      setApplyingFont(false);
    }
  }

  function handleChange(value: string) {
    setQuery(value);
    setActiveIndex(-1);
    setError(null);
    void loadList();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      void loadList();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      void selectFont(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <label htmlFor={listboxId} className={hideLabel ? 'sr-only' : 'mb-1 block text-tools-meta text-muted'}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={listboxId}
        type="text"
        value={query}
        disabled={loadingList || applyingFont}
        onFocus={() => {
          updateMenuPosition();
          setFocused(true);
          void loadList();
        }}
        onBlur={() => setFocused(false)}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={`${listboxId}-options`}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-describedby={error ? `${listboxId}-error` : undefined}
        placeholder="Escribe una fuente"
        autoComplete="off"
        className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-tools-body text-ink transition-opacity placeholder:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-wait disabled:opacity-60"
      />
      {loadingList || applyingFont ? (
        <p className="mt-1 text-tools-meta text-muted" role="status">
          {loadingList ? 'Cargando catálogo…' : 'Cargando…'}
        </p>
      ) : null}
      {expanded && menuPosition && typeof document !== 'undefined'
        ? createPortal(
        <ul
          ref={menuRef}
          id={`${listboxId}-options`}
          role="listbox"
          aria-label={`Sugerencias para ${label}`}
          className="z-dropdown max-h-60 overflow-y-auto rounded-md border border-border bg-bg p-1"
          style={{
            position: 'fixed',
            left: menuPosition.left,
            top: menuPosition.top,
            width: menuPosition.width,
          }}
        >
          {suggestions.map((font, index) => (
            <li
              key={font.family}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setHoveredFamily({
                  family: font.family,
                  left: Math.min(rect.right + 8, window.innerWidth - 248),
                  top: rect.top,
                });
              }}
              onMouseLeave={() => setHoveredFamily(null)}
              onClick={() => void selectFont(font)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded px-2.5 py-2 text-tools-body text-ink ${
                activeIndex === index ? 'bg-surface-raised' : 'hover:bg-surface-raised'
              }`}
            >
              <span className="truncate" title={font.family}>
                {font.family}
              </span>
              <span className="shrink-0 text-tools-meta text-muted">{font.category}</span>
            </li>
          ))}
        </ul>
          ,
          document.body,
        )
        : null}
      {hoveredFamily && typeof document !== 'undefined'
        ? createPortal(
            <span
              role="tooltip"
              className="z-modal-backdrop pointer-events-none fixed max-w-60 rounded-md border border-border bg-ink px-2 py-1 text-tools-meta text-bg"
              style={{ left: hoveredFamily.left, top: hoveredFamily.top }}
            >
              {hoveredFamily.family}
            </span>,
            document.body,
          )
        : null}
      {error ? (
        <p id={`${listboxId}-error`} className="mt-1 text-tools-meta text-fail" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
