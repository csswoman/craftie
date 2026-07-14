# Font pairing list density + search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the font pairing list into compact rows with search + category dropdown + suggestions, expanding the stacked Headline/Body specimen only on the selected row.

**Architecture:** Pure filter/suggest helpers live in `/lib/typography`. UI splits into `PairingSearchToolbar`, `PairRow` (compact + expand), and `PairSpecimenPreview` (no nested card). `PairingList` owns query/category state and wires filtering; parent `onSelectPairing` contracts stay unchanged.

**Tech Stack:** TypeScript, React (`'use client'`), Tailwind + Craftie tools tokens, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-14-font-pairing-list-density-design.md`

---

## File structure

| File | Responsibility |
| --- | --- |
| `lib/typography/pairingFilters.ts` | Category vocabulary, `filterFontPairs`, `suggestFontPairs` |
| `lib/typography/pairingFilters.test.ts` | Unit tests for filter + suggest |
| `src/components/font-pairing/PairingSearchToolbar.tsx` | Search input, category select, suggestions listbox |
| `src/components/font-pairing/PairSpecimenPreview.tsx` | Stacked Titular/Cuerpo specimen without inner card border |
| `src/components/font-pairing/PairRow.tsx` | Compact row; expands specimen when `selected` |
| `src/components/font-pairing/PairingList.tsx` | State, debounce wiring, filtered list, live region, lazy font load |
| `src/components/font-pairing/PairCard.tsx` | Delete after `PairRow` is wired (or re-export `PairRow` briefly then delete) |

**Unchanged:** `StudioToolsPanel.tsx`, `SidebarTypographySection.tsx` props API, `TypographyCanvasView`/`PairingPanel` consumers (still pass same `PairingList` props).

**Commit policy for this plan:** Do **not** create git commits unless the user explicitly asks. Check boxes for “Commit” steps should be skipped or treated as “stage mentally / prepare message only” unless the user requests a commit.

---

### Task 1: Category vocabulary + `filterFontPairs` (TDD)

**Files:**
- Create: `lib/typography/pairingFilters.ts`
- Create: `lib/typography/pairingFilters.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';

import type { FontMeta, FontPair } from './fontPairTypes';
import {
  PAIRING_CATEGORY_FILTERS,
  filterFontPairs,
} from './pairingFilters';

function createFontMeta(overrides: Partial<FontMeta> & Pick<FontMeta, 'family'>): FontMeta {
  return {
    googleFontsRef: `https://fonts.google.com/specimen/${overrides.family}`,
    classification: 'sans-serif',
    contrast: 'medium',
    xHeight: 'medium',
    personality: ['neutral'],
    bestFor: 'both',
    ...overrides,
  };
}

function createPair(
  overrides: Partial<FontPair> & Pick<FontPair, 'id' | 'displayName' | 'character'>,
): FontPair {
  return {
    mood: [],
    rationale: 'test',
    heading: createFontMeta({ family: `${overrides.id}-H`, bestFor: 'heading' }),
    body: createFontMeta({ family: `${overrides.id}-B`, bestFor: 'body' }),
    ...overrides,
  };
}

const fixtures: FontPair[] = [
  createPair({
    id: 'editorial-lora',
    displayName: 'Editorial clara',
    character: ['editorial', 'minimal'],
    heading: createFontMeta({ family: 'Lora', bestFor: 'heading' }),
    body: createFontMeta({ family: 'Inter', bestFor: 'body' }),
  }),
  createPair({
    id: 'tech-plex',
    displayName: 'Técnico humano',
    character: ['technical'],
    heading: createFontMeta({ family: 'IBM Plex Sans', bestFor: 'heading' }),
    body: createFontMeta({ family: 'IBM Plex Mono', bestFor: 'body' }),
  }),
  createPair({
    id: 'warm-fraunces',
    displayName: 'Cálido expresivo',
    character: ['warm'],
    heading: createFontMeta({ family: 'Fraunces', bestFor: 'heading' }),
    body: createFontMeta({ family: 'Manrope', bestFor: 'body' }),
  }),
];

describe('PAIRING_CATEGORY_FILTERS', () => {
  it('exposes all + four stable UI categories', () => {
    expect(PAIRING_CATEGORY_FILTERS.map((f) => f.value)).toEqual([
      'all',
      'editorial',
      'technical',
      'warm',
      'minimal',
    ]);
  });
});

describe('filterFontPairs', () => {
  it('returns all pairs when category is all and query is empty', () => {
    expect(filterFontPairs(fixtures, { category: 'all', query: '' })).toHaveLength(3);
  });

  it('filters by character category', () => {
    const result = filterFontPairs(fixtures, { category: 'editorial', query: '' });
    expect(result.map((p) => p.id)).toEqual(['editorial-lora']);
  });

  it('filters by displayName case-insensitively', () => {
    const result = filterFontPairs(fixtures, { category: 'all', query: 'técnico' });
    expect(result.map((p) => p.id)).toEqual(['tech-plex']);
  });

  it('filters by heading or body family substring', () => {
    expect(filterFontPairs(fixtures, { category: 'all', query: 'manrope' }).map((p) => p.id)).toEqual([
      'warm-fraunces',
    ]);
    expect(filterFontPairs(fixtures, { category: 'all', query: 'lora' }).map((p) => p.id)).toEqual([
      'editorial-lora',
    ]);
  });

  it('combines category and query with AND', () => {
    expect(
      filterFontPairs(fixtures, { category: 'minimal', query: 'inter' }).map((p) => p.id),
    ).toEqual(['editorial-lora']);
    expect(filterFontPairs(fixtures, { category: 'technical', query: 'lora' })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL (module missing)**

Run:

```bash
pnpm test -- lib/typography/pairingFilters.test.ts
```

Expected: FAIL — cannot resolve `./pairingFilters` or exports missing.

- [ ] **Step 3: Implement minimal `pairingFilters.ts`**

```ts
import type { FontPair } from './fontPairTypes';

export const PAIRING_CATEGORY_FILTERS = [
  { label: 'Todas las categorías', value: 'all' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'Técnico', value: 'technical' },
  { label: 'Cálido', value: 'warm' },
  { label: 'Minimal', value: 'minimal' },
] as const;

export type PairingCategoryValue = (typeof PAIRING_CATEGORY_FILTERS)[number]['value'];

export type FilterFontPairsInput = {
  category: PairingCategoryValue;
  query: string;
};

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function matchesQuery(pair: FontPair, query: string): boolean {
  const q = normalize(query);
  if (!q) {
    return true;
  }

  return (
    normalize(pair.displayName).includes(q) ||
    normalize(pair.heading.family).includes(q) ||
    normalize(pair.body.family).includes(q)
  );
}

export function filterFontPairs(
  pairs: FontPair[],
  { category, query }: FilterFontPairsInput,
): FontPair[] {
  return pairs.filter((pair) => {
    const categoryOk = category === 'all' || pair.character.includes(category);
    return categoryOk && matchesQuery(pair, query);
  });
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
pnpm test -- lib/typography/pairingFilters.test.ts
```

Expected: PASS for all `filterFontPairs` / category tests.

- [ ] **Step 5: Commit** — skip unless user asked.

---

### Task 2: `suggestFontPairs` (TDD)

**Files:**
- Modify: `lib/typography/pairingFilters.ts`
- Modify: `lib/typography/pairingFilters.test.ts`

- [ ] **Step 1: Append failing suggestion tests**

```ts
import { suggestFontPairs, type PairingSuggestion } from './pairingFilters';

describe('suggestFontPairs', () => {
  it('with empty query returns the four named categories (not all)', () => {
    const suggestions = suggestFontPairs(fixtures, '', 8);
    expect(suggestions.every((s) => s.type === 'category')).toBe(true);
    expect(suggestions.map((s) => s.value)).toEqual([
      'editorial',
      'technical',
      'warm',
      'minimal',
    ]);
  });

  it('returns category, family, and pair matches without duplicate values per type', () => {
    const suggestions = suggestFontPairs(fixtures, 'ed', 10);
    const categories = suggestions.filter((s) => s.type === 'category');
    const families = suggestions.filter((s) => s.type === 'family');
    const pairs = suggestions.filter((s) => s.type === 'pair');

    expect(categories.some((s) => s.value === 'editorial')).toBe(true);
    expect(families.some((s) => s.value === 'Lora')).toBe(true);
    expect(pairs.some((s) => s.value === 'editorial-lora')).toBe(true);
  });

  it('respects limit', () => {
    expect(suggestFontPairs(fixtures, 'a', 2)).toHaveLength(2);
  });

  it('returns [] when query has no matches', () => {
    expect(suggestFontPairs(fixtures, 'zzzz-no-match', 8)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
pnpm test -- lib/typography/pairingFilters.test.ts
```

Expected: FAIL — `suggestFontPairs` is not a function.

- [ ] **Step 3: Implement `suggestFontPairs`**

Append to `lib/typography/pairingFilters.ts`:

```ts
export type PairingSuggestionType = 'category' | 'family' | 'pair';

export type PairingSuggestion = {
  type: PairingSuggestionType;
  label: string;
  value: string;
};

export function suggestFontPairs(
  pairs: FontPair[],
  query: string,
  limit = 8,
): PairingSuggestion[] {
  const q = normalize(query);
  const out: PairingSuggestion[] = [];
  const seen = new Set<string>();

  const push = (suggestion: PairingSuggestion) => {
    const key = `${suggestion.type}:${suggestion.value}`;
    if (seen.has(key) || out.length >= limit) {
      return;
    }
    seen.add(key);
    out.push(suggestion);
  };

  const namedCategories = PAIRING_CATEGORY_FILTERS.filter((f) => f.value !== 'all');

  if (!q) {
    for (const filter of namedCategories) {
      push({ type: 'category', label: filter.label, value: filter.value });
    }
    return out;
  }

  for (const filter of namedCategories) {
    if (
      normalize(filter.label).includes(q) ||
      normalize(filter.value).includes(q)
    ) {
      push({ type: 'category', label: filter.label, value: filter.value });
    }
  }

  for (const pair of pairs) {
    for (const family of [pair.heading.family, pair.body.family]) {
      if (normalize(family).includes(q)) {
        push({ type: 'family', label: family, value: family });
      }
    }
  }

  for (const pair of pairs) {
    if (normalize(pair.displayName).includes(q) || normalize(pair.id).includes(q)) {
      push({
        type: 'pair',
        label: pair.displayName,
        value: pair.id,
      });
    }
  }

  return out;
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
pnpm test -- lib/typography/pairingFilters.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit** — skip unless user asked.

---

### Task 3: `PairSpecimenPreview` (no nested card)

**Files:**
- Create: `src/components/font-pairing/PairSpecimenPreview.tsx`
- Modify later consumers; no test file required for this presentational piece.

- [ ] **Step 1: Create the specimen component**

```tsx
'use client';

import type { FontPair } from '@lib/typography/pairings';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';

export type PairSpecimenPreviewProps = {
  pairing: FontPair;
  fontsReady: boolean;
  variant?: 'default' | 'tools';
};

export function PairSpecimenPreview({
  pairing,
  fontsReady,
  variant = 'default',
}: PairSpecimenPreviewProps) {
  const isTools = variant === 'tools';
  const headingFont = buildFontFamilyStack(pairing.heading);
  const bodyFont = buildFontFamilyStack(pairing.body);
  const metaClass = isTools ? 'text-tools-meta' : 'text-chrome-caption';
  const headlineClass = isTools ? 'text-tools-font-headline' : 'text-[1.75rem]';
  const bodyClass = isTools ? 'text-tools-font-body' : 'text-[1.25rem]';

  return (
    <div className="mt-2 overflow-hidden rounded-md">
      <RoleBlock
        label="Titular"
        family={pairing.heading.family}
        fontStack={headingFont}
        fontsReady={fontsReady}
        labelClass={metaClass}
        nameClass={`${headlineClass} font-semibold`}
        allowWrap={isTools}
      />
      <div className="h-px bg-border/60" aria-hidden="true" />
      <RoleBlock
        label="Cuerpo"
        family={pairing.body.family}
        fontStack={bodyFont}
        fontsReady={fontsReady}
        labelClass={metaClass}
        nameClass={bodyClass}
        allowWrap={isTools}
      />
    </div>
  );
}

function RoleBlock({
  label,
  family,
  fontStack,
  fontsReady,
  labelClass,
  nameClass,
  allowWrap,
}: {
  label: string;
  family: string;
  fontStack: string;
  fontsReady: boolean;
  labelClass: string;
  nameClass: string;
  allowWrap: boolean;
}) {
  return (
    <div className={allowWrap ? 'py-2' : 'py-1.5'}>
      <p className={`font-medium text-muted ${labelClass}`}>{label}</p>
      <p
        className={`mt-1 text-ink ${
          allowWrap ? 'text-pretty leading-snug' : 'truncate leading-none'
        } ${nameClass} ${fontsReady ? '' : 'animate-pulse'}`}
        style={{ fontFamily: fontsReady ? fontStack : undefined }}
        title={family}
      >
        {family}
      </p>
    </div>
  );
}
```

Note: **no** `border` on the outer wrapper (fixes nested-cards). Labels are Spanish caption without uppercase tracking.

- [ ] **Step 2: Smoke-check TypeScript on the new file**

```bash
pnpm exec tsc --noEmit --pretty false 2>&1 | Select-String "PairSpecimenPreview" 
```

Expected: no errors mentioning `PairSpecimenPreview` (full project may still have unrelated dirty-tree errors — ignore those).

- [ ] **Step 3: Commit** — skip unless user asked.

---

### Task 4: `PairRow` compact + expand on select

**Files:**
- Create: `src/components/font-pairing/PairRow.tsx`
- Modify: `src/components/font-pairing/PairingList.tsx` (import swap in Task 6)
- Delete after swap: `src/components/font-pairing/PairCard.tsx`

- [ ] **Step 1: Create `PairRow`**

```tsx
'use client';

import type { FontPair } from '@lib/typography/pairings';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';

import { PairSpecimenPreview } from './PairSpecimenPreview';

export type PairRowProps = {
  pairing: FontPair;
  selected: boolean;
  fontsReady: boolean;
  onSelect: (pairing: FontPair) => void;
  variant?: 'default' | 'tools';
};

export function PairRow({
  pairing,
  selected,
  fontsReady,
  onSelect,
  variant = 'default',
}: PairRowProps) {
  const isTools = variant === 'tools';
  const metaClass = isTools ? 'text-tools-meta' : 'text-chrome-caption';
  const headingFont = buildFontFamilyStack(pairing.heading);
  const bodyFont = buildFontFamilyStack(pairing.body);

  return (
    <button
      type="button"
      onClick={() => onSelect(pairing)}
      aria-pressed={selected}
      aria-expanded={selected}
      className={`block w-full rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        selected
          ? 'border-primary/40 bg-primary/6 ring-1 ring-primary/12'
          : 'border-border/50 bg-transparent hover:border-border hover:bg-surface-raised/35'
      }`}
    >
      <p className={`truncate font-medium text-ink ${metaClass}`} title={pairing.displayName}>
        {pairing.displayName}
      </p>

      <p
        className={`mt-0.5 truncate text-ink ${
          isTools ? 'text-tools-body' : 'text-chrome-label'
        } ${fontsReady ? '' : 'animate-pulse'}`}
      >
        <span
          className="font-semibold"
          style={{ fontFamily: fontsReady ? headingFont : undefined }}
        >
          {pairing.heading.family}
        </span>
        <span className="text-muted"> & </span>
        <span style={{ fontFamily: fontsReady ? bodyFont : undefined }}>
          {pairing.body.family}
        </span>
      </p>

      {selected ? (
        <PairSpecimenPreview pairing={pairing} fontsReady={fontsReady} variant={variant} />
      ) : null}
    </button>
  );
}
```

- [ ] **Step 2: Keep `PairCard.tsx` until Task 6 swaps imports** (avoid broken imports mid-plan).

- [ ] **Step 3: Commit** — skip unless user asked.

---

### Task 5: `PairingSearchToolbar`

**Files:**
- Create: `src/components/font-pairing/PairingSearchToolbar.tsx`

- [ ] **Step 1: Implement toolbar with select + suggestions listbox**

```tsx
'use client';

import type { KeyboardEvent } from 'react';

import {
  PAIRING_CATEGORY_FILTERS,
  type PairingCategoryValue,
  type PairingSuggestion,
} from '@lib/typography/pairingFilters';

export type PairingSearchToolbarProps = {
  query: string;
  category: PairingCategoryValue;
  suggestions: PairingSuggestion[];
  suggestionsOpen: boolean;
  activeSuggestionIndex: number;
  isTools?: boolean;
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: PairingCategoryValue) => void;
  onSuggestionsOpenChange: (open: boolean) => void;
  onActiveSuggestionIndexChange: (index: number) => void;
  onApplySuggestion: (suggestion: PairingSuggestion) => void;
  onClearFilters: () => void;
};

export function PairingSearchToolbar({
  query,
  category,
  suggestions,
  suggestionsOpen,
  activeSuggestionIndex,
  isTools = false,
  onQueryChange,
  onCategoryChange,
  onSuggestionsOpenChange,
  onActiveSuggestionIndexChange,
  onApplySuggestion,
  onClearFilters,
}: PairingSearchToolbarProps) {
  const chipClass = isTools ? 'text-tools-chip' : 'text-[0.75rem]';
  const bodyClass = isTools ? 'text-tools-body' : 'text-[0.9375rem]';
  const showSuggestions = suggestionsOpen && suggestions.length > 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      onActiveSuggestionIndexChange(
        Math.min(activeSuggestionIndex + 1, suggestions.length - 1),
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      onActiveSuggestionIndexChange(Math.max(activeSuggestionIndex - 1, 0));
    } else if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
      event.preventDefault();
      const suggestion = suggestions[activeSuggestionIndex];
      if (suggestion) {
        onApplySuggestion(suggestion);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onSuggestionsOpenChange(false);
    }
  };

  return (
    <div className="shrink-0 space-y-1.5" role="search">
      <div className="flex gap-1.5">
        <label className="sr-only" htmlFor="pairing-search-input">
          Buscar pares tipográficos
        </label>
        <input
          id="pairing-search-input"
          type="search"
          value={query}
          placeholder="Buscar pares…"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="pairing-search-suggestions"
          aria-expanded={showSuggestions}
          className={`min-w-0 flex-1 rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${bodyClass}`}
          onChange={(event) => {
            onQueryChange(event.target.value);
            onSuggestionsOpenChange(true);
            onActiveSuggestionIndexChange(0);
          }}
          onFocus={() => onSuggestionsOpenChange(true)}
          onKeyDown={handleKeyDown}
        />
        <label className="sr-only" htmlFor="pairing-category-select">
          Categoría
        </label>
        <select
          id="pairing-category-select"
          value={category}
          onChange={(event) =>
            onCategoryChange(event.target.value as PairingCategoryValue)
          }
          className={`max-w-[9.5rem] shrink-0 rounded-md border border-border bg-surface-raised px-2 py-1.5 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${chipClass}`}
        >
          {PAIRING_CATEGORY_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {showSuggestions ? (
        <ul
          id="pairing-search-suggestions"
          role="listbox"
          className="rounded-md border border-border bg-bg py-1 shadow-none"
        >
          {suggestions.map((suggestion, index) => {
            const active = index === activeSuggestionIndex;
            return (
              <li key={`${suggestion.type}:${suggestion.value}`} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left ${bodyClass} ${
                    active ? 'bg-surface-raised text-ink' : 'text-ink hover:bg-surface-raised/70'
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onApplySuggestion(suggestion)}
                >
                  <span className={`text-muted ${chipClass}`}>
                    {suggestion.type === 'category'
                      ? 'Categoría'
                      : suggestion.type === 'family'
                        ? 'Familia'
                        : 'Par'}
                  </span>
                  <span className="truncate">{suggestion.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {(query || category !== 'all') && (
        <button
          type="button"
          onClick={onClearFilters}
          className={`text-muted hover:text-ink ${chipClass}`}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit** — skip unless user asked.

---

### Task 6: Wire `PairingList`

**Files:**
- Modify: `src/components/font-pairing/PairingList.tsx`
- Delete: `src/components/font-pairing/PairCard.tsx` (after no remaining imports)

- [ ] **Step 1: Replace list logic**

Full target shape for `PairingList.tsx`:

```tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { FontPair } from '@lib/typography/pairings';
import {
  filterFontPairs,
  suggestFontPairs,
  type PairingCategoryValue,
  type PairingSuggestion,
} from '@lib/typography/pairingFilters';

import { loadGoogleFonts } from '@/lib/browser/googleFonts';
import { PairingSearchToolbar } from './PairingSearchToolbar';
import { PairRow } from './PairRow';

export type PairingListProps = {
  pairings: FontPair[];
  selectedPairing: FontPair | null;
  onSelectPairing: (pairing: FontPair) => void;
  variant?: 'default' | 'tools';
};

const SUGGESTION_DEBOUNCE_MS = 120;

export function PairingList({
  pairings,
  selectedPairing,
  onSelectPairing,
  variant = 'default',
}: PairingListProps) {
  const [category, setCategory] = useState<PairingCategoryValue>('all');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const isTools = variant === 'tools';
  const emptyClass = isTools ? 'text-tools-body' : 'text-[0.9375rem]';

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, SUGGESTION_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const filteredPairings = useMemo(
    () => filterFontPairs(pairings, { category, query: debouncedQuery }),
    [pairings, category, debouncedQuery],
  );

  const suggestions = useMemo(
    () => suggestFontPairs(pairings, debouncedQuery, 8),
    [pairings, debouncedQuery],
  );

  useEffect(() => {
    if (selectedPairing !== null) {
      loadGoogleFonts([selectedPairing]);
    }
  }, [selectedPairing]);

  const applySuggestion = (suggestion: PairingSuggestion) => {
    if (suggestion.type === 'category') {
      setCategory(suggestion.value as PairingCategoryValue);
      const next = filterFontPairs(pairings, {
        category: suggestion.value as PairingCategoryValue,
        query: debouncedQuery,
      });
      if (next.length === 0) {
        setQuery('');
        setDebouncedQuery('');
      }
    } else if (suggestion.type === 'family') {
      setQuery(suggestion.value);
      setDebouncedQuery(suggestion.value);
    } else {
      const pair = pairings.find((item) => item.id === suggestion.value);
      if (pair) {
        onSelectPairing(pair);
      }
    }
    setSuggestionsOpen(false);
  };

  const clearFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setCategory('all');
    setSuggestionsOpen(false);
  };

  if (pairings.length === 0) {
    return (
      <p
        className={`rounded-md border border-dashed border-border bg-bg px-4 py-8 text-center ${emptyClass} text-muted`}
      >
        No hay pares tipográficos disponibles.
      </p>
    );
  }

  return (
    <div className={isTools ? 'flex min-h-0 flex-1 flex-col gap-3' : 'space-y-3'}>
      <PairingSearchToolbar
        query={query}
        category={category}
        suggestions={suggestions}
        suggestionsOpen={suggestionsOpen}
        activeSuggestionIndex={activeSuggestionIndex}
        isTools={isTools}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
        onSuggestionsOpenChange={setSuggestionsOpen}
        onActiveSuggestionIndexChange={setActiveSuggestionIndex}
        onApplySuggestion={applySuggestion}
        onClearFilters={clearFilters}
      />

      <p className="sr-only" aria-live="polite">
        {filteredPairings.length} pares
      </p>

      {filteredPairings.length === 0 ? (
        <div
          className={`rounded-md border border-dashed border-border bg-bg px-4 py-6 text-center ${emptyClass} text-muted`}
        >
          <p>No hay pares que coincidan.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 font-medium text-ink underline-offset-2 hover:underline"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <ul
          className={`scrollbar-chrome space-y-1.5 overflow-y-auto ${
            isTools ? 'min-h-0 flex-1' : 'max-h-[30rem]'
          }`}
        >
          {filteredPairings.map((pairing) => (
            <li key={pairing.id}>
              <LazyPairRow
                pairing={pairing}
                selected={selectedPairing?.id === pairing.id}
                onSelect={onSelectPairing}
                variant={variant}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LazyPairRow({
  pairing,
  selected,
  onSelect,
  variant = 'default',
}: {
  pairing: FontPair;
  selected: boolean;
  onSelect: (pairing: FontPair) => void;
  variant?: 'default' | 'tools';
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const fontsRequested = selected || isNearViewport;

  useEffect(() => {
    if (selected) {
      loadGoogleFonts([pairing]);
    }
  }, [pairing, selected]);

  useEffect(() => {
    if (fontsRequested || typeof IntersectionObserver === 'undefined') {
      if (!fontsRequested) {
        const timer = window.setTimeout(() => {
          setIsNearViewport(true);
          loadGoogleFonts([pairing]);
        }, 0);
        return () => window.clearTimeout(timer);
      }
      return;
    }

    const element = cardRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNearViewport(true);
          loadGoogleFonts([pairing]);
          observer.disconnect();
        }
      },
      { rootMargin: '160px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [fontsRequested, pairing]);

  return (
    <div ref={cardRef}>
      <PairRow
        pairing={pairing}
        selected={selected}
        fontsReady={fontsRequested}
        onSelect={onSelect}
        variant={variant}
      />
    </div>
  );
}
```

- [ ] **Step 2: Delete `PairCard.tsx` and grep for leftovers**

```bash
rg "PairCard" src lib
```

Expected: no references (or only plan/docs). Delete the file if unused.

- [ ] **Step 3: Run filter unit tests + typecheck focused**

```bash
pnpm test -- lib/typography/pairingFilters.test.ts
pnpm check:component-size
```

Expected: tests PASS; no component over 250 lines among new font-pairing files.

- [ ] **Step 4: Manual check in browser**

1. Open studio → Tipografía tab.
2. Confirm many compact rows visible; selected row shows Titular/Cuerpo specimen.
3. Search “Inter” → list filters; suggestions include familia/par.
4. Dropdown Técnico → combines with query.
5. Empty state → “Limpiar búsqueda” resets.

- [ ] **Step 5: Commit** — skip unless user asked.

---

### Task 7: Polish + verify against critique success criteria

**Files:**
- Touch only if gaps found: `PairRow.tsx`, `PairSpecimenPreview.tsx`, `PairingSearchToolbar.tsx`, `globals.css` tools tokens (only if compact meta size needs a dedicated token — prefer existing `--tools-meta`).

- [ ] **Step 1: Checklist against spec success criteria**

1. More pairs visible without scroll than before.
2. Search by family works.
3. Selected shows stacked specimen.
4. No inner bordered card inside the row button.
5. `onSelectPairing` / lazy fonts still work.

- [ ] **Step 2: Run full verification for touched surface**

```bash
pnpm test -- lib/typography/pairingFilters.test.ts
pnpm lint
pnpm check:component-size
```

Expected: PASS on filters; lint clean for edited files; size check green.

- [ ] **Step 3: Commit** — skip unless user asked.

---

## Spec coverage self-review

| Spec requirement | Task |
| --- | --- |
| Compact `Heading & Body` row | Task 4 |
| Expand specimen on select only | Task 4 |
| `displayName` meta + truncate | Task 4 |
| Search + category dropdown | Task 5–6 |
| Suggestions (category/family/pair) + empty focus categories | Task 2, 5–6 |
| Remove chips | Task 6 |
| No nested card | Task 3 |
| Quieter Spanish role labels | Task 3 |
| filter/suggest in `/lib` | Tasks 1–2 |
| Empty states + clear | Task 6 |
| a11y search/listbox/live region/aria-expanded | Tasks 4–6 |
| Debounce | Task 6 |
| Unit tests | Tasks 1–2 |
| `tools` + `default` variants | Tasks 3–4, 6 |
| `StudioToolsPanel` unchanged | — |
| Non-goals (Recently Used, hearts, dark) | not implemented |

**Placeholder scan:** none intentional.  
**Type consistency:** `PairingCategoryValue`, `PairingSuggestion`, `filterFontPairs`, `suggestFontPairs` shared across Tasks 1–6.
