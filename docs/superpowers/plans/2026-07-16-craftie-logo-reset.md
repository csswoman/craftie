# Craftie logo → reset con confirmación Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El wordmark Craftie del navbar vuelve al empty state; si hay progreso de sesión, pide confirmación antes de borrarlo.

**Architecture:** Lógica pura `hasWorkspaceProgress` en `/lib/studio`. El controller expone `resetWorkspace` + `requestCraftieHome` (abre confirm o resetea). Un diálogo presentacional reutiliza el patrón de `InspirationModal` + `useDialogAccessibility`. `WorkspaceHeader` deja de usar `Link` a `/` y llama al handler.

**Tech Stack:** TypeScript, React (`'use client'`), Vitest, Tailwind, `useDialogAccessibility`.

**Spec:** `docs/superpowers/specs/2026-07-16-craftie-logo-reset-design.md`

---

## File structure

| File | Responsibility |
| --- | --- |
| `lib/studio/workspaceProgress.ts` | `hasWorkspaceProgress(input)` — framework-agnostic |
| `lib/studio/workspaceProgress.test.ts` | Unit tests del predicate |
| `src/components/layout/ConfirmResetWorkspaceDialog.tsx` | Diálogo de confirmación |
| `src/components/layout/WorkspaceHeader.tsx` | Wordmark → `onCraftieHome` |
| `src/components/color/useSelectColorsWorkspaceController.ts` | `resetWorkspace`, confirm state, `requestCraftieHome` |
| `src/components/color/SelectColorsWorkspace.tsx` | Montar diálogo + pasar props al header |

**Unchanged:** `SiteHeader` (legacy, no montado en el flujo actual), localStorage de tema/paneles/pair tipográfico.

**Commit policy:** Do **not** create git commits unless the user explicitly asks.

---

### Task 1: `hasWorkspaceProgress` (TDD)

**Files:**
- Create: `lib/studio/workspaceProgress.ts`
- Create: `lib/studio/workspaceProgress.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';

import { hasWorkspaceProgress } from './workspaceProgress';

const empty = {
  catalogSource: 'none' as const,
  rolePalette: null,
  generatedPalette: null,
  imageFile: null,
  imagePreviewUrl: null,
  isImageBusy: false,
};

describe('hasWorkspaceProgress', () => {
  it('is false for an empty workspace', () => {
    expect(hasWorkspaceProgress(empty)).toBe(false);
  });

  it('is true when catalogSource is curated', () => {
    expect(hasWorkspaceProgress({ ...empty, catalogSource: 'curated' })).toBe(true);
  });

  it('is true when catalogSource is image', () => {
    expect(hasWorkspaceProgress({ ...empty, catalogSource: 'image' })).toBe(true);
  });

  it('is true when rolePalette is present', () => {
    expect(hasWorkspaceProgress({ ...empty, rolePalette: {} })).toBe(true);
  });

  it('is true when generatedPalette is present', () => {
    expect(hasWorkspaceProgress({ ...empty, generatedPalette: {} })).toBe(true);
  });

  it('is true when an image file is loaded', () => {
    expect(hasWorkspaceProgress({ ...empty, imageFile: {} })).toBe(true);
  });

  it('is true when an image preview URL exists', () => {
    expect(
      hasWorkspaceProgress({ ...empty, imagePreviewUrl: 'blob:http://localhost/x' }),
    ).toBe(true);
  });

  it('is true while image extraction is busy', () => {
    expect(hasWorkspaceProgress({ ...empty, isImageBusy: true })).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run lib/studio/workspaceProgress.test.ts`

Expected: FAIL — module `./workspaceProgress` not found

- [ ] **Step 3: Write minimal implementation**

```ts
export type WorkspaceProgressInput = {
  catalogSource: 'none' | 'curated' | 'image';
  rolePalette: unknown | null;
  generatedPalette: unknown | null;
  imageFile: unknown | null;
  imagePreviewUrl: string | null;
  isImageBusy: boolean;
};

export function hasWorkspaceProgress(input: WorkspaceProgressInput): boolean {
  return (
    input.catalogSource !== 'none' ||
    input.rolePalette !== null ||
    input.generatedPalette !== null ||
    input.imageFile !== null ||
    input.imagePreviewUrl !== null ||
    input.isImageBusy
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run lib/studio/workspaceProgress.test.ts`

Expected: PASS (8 tests)

---

### Task 2: `ConfirmResetWorkspaceDialog`

**Files:**
- Create: `src/components/layout/ConfirmResetWorkspaceDialog.tsx`

Patrón visual/a11y: igual que `InspirationModal` (overlay + `role="dialog"` + `useDialogAccessibility`), no el elemento HTML `<dialog>` — el spec pide alineación con esos modales.

- [ ] **Step 1: Create the dialog component**

```tsx
'use client';

import { useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';

export type ConfirmResetWorkspaceDialogProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmResetWorkspaceDialog({
  open,
  onCancel,
  onConfirm,
}: ConfirmResetWorkspaceDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility({
    open,
    dialogRef,
    onClose: onCancel,
    initialFocusSelector: '[data-confirm-cancel]',
    lockScroll: true,
  });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-dropdown flex items-center justify-center overscroll-contain bg-ink/20 p-4">
      <div className="absolute inset-0" aria-hidden="true" onClick={onCancel} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-reset-title"
        aria-describedby="confirm-reset-desc"
        className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-float)]"
      >
        <h2 id="confirm-reset-title" className="text-chrome-title text-ink">
          ¿Empezar de nuevo?
        </h2>
        <p id="confirm-reset-desc" className="mt-2 text-chrome-label leading-relaxed text-muted">
          Se perderá el progreso de esta sesión.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            data-confirm-cancel
            className="min-h-11"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button type="button" variant="primary" className="min-h-11" onClick={onConfirm}>
            Empezar de nuevo
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Smoke-check TypeScript**

Run: `pnpm exec tsc --noEmit -p tsconfig.json` (or project’s usual typecheck script if different)

Expected: no errors related to the new file (existing unrelated errors may remain — do not expand scope to fix them unless they block this work).

---

### Task 3: `WorkspaceHeader` — wordmark action

**Files:**
- Modify: `src/components/layout/WorkspaceHeader.tsx`

- [ ] **Step 1: Replace `Link` with controlled home action**

Remove `import Link from 'next/link'`.

Update props:

```ts
export type WorkspaceHeaderProps = {
  canExport: boolean;
  onCraftieHome: () => void;
  onExportDesignMd: () => void;
  onExportBrandKit: () => void;
};
```

Replace the Craftie `Link` with:

```tsx
<button
  type="button"
  onClick={onCraftieHome}
  className="shrink-0 text-ink transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
  aria-label="Volver al inicio"
>
  <span className="font-display text-[var(--chrome-text-display)] font-medium leading-none">
    Craftie
  </span>
</button>
```

Notes:
- Use `<span>` instead of `<h1>` for the brand control (avoids multiple h1 semantics when the empty card already has a heading). If the empty card is the only page title, keep one clear page heading there; the wordmark is navigation.
- Pass `onCraftieHome` into the destructured props.

- [ ] **Step 2: Fix call sites that type-check against `WorkspaceHeaderProps`**

Only `SelectColorsWorkspace.tsx` mounts it in the live flow; wire comes in Task 5. If `tsc` complains earlier, add a temporary noop — prefer completing Task 4–5 in the same pass so the prop is real.

---

### Task 4: `resetWorkspace` + home request in the controller

**Files:**
- Modify: `src/components/color/useSelectColorsWorkspaceController.ts`

- [ ] **Step 1: Import helper**

```ts
import { hasWorkspaceProgress } from '@lib/studio/workspaceProgress';
```

- [ ] **Step 2: Add confirm dialog state**

Near other UI flags:

```ts
const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
```

- [ ] **Step 3: Implement `resetWorkspace`**

Place after image helpers (near `exitReviewPhase`). Must revoke the object URL like `updateImagePreview` / unmount cleanup:

```ts
const resetWorkspace = useCallback(() => {
  if (imagePreviewUrlRef.current !== null) {
    URL.revokeObjectURL(imagePreviewUrlRef.current);
    imagePreviewUrlRef.current = null;
  }

  setImagePreviewUrl(null);
  setImageFileName(null);
  setImageFingerprint(null);
  setImageFile(null);
  setImageRegenerateIndex(0);
  setImagePaletteType(null);
  setPaletteTypeOverride(null);
  setIsImageExtracting(false);
  setIsImageRegenerating(false);

  setCatalogSource('none');
  setSelectedStyleId(null);
  setPaletteCatalog([]);
  clearRolePalette();
  setGeneratedPalette(null);

  setError(null);
  setStatusMessage(null);
  setInspirationModalOpen(false);
  setResetConfirmOpen(false);

  setTypeUi(createInitialTypeUiState());
}, [clearRolePalette]);
```

- [ ] **Step 4: Implement `requestCraftieHome`**

```ts
const requestCraftieHome = useCallback(() => {
  const hasProgress = hasWorkspaceProgress({
    catalogSource,
    rolePalette,
    generatedPalette,
    imageFile,
    imagePreviewUrl,
    isImageBusy,
  });

  if (hasProgress) {
    setResetConfirmOpen(true);
    return;
  }

  resetWorkspace();
}, [
  catalogSource,
  generatedPalette,
  imageFile,
  imagePreviewUrl,
  isImageBusy,
  resetWorkspace,
  rolePalette,
]);
```

- [ ] **Step 5: Confirm / cancel handlers**

```ts
const cancelResetWorkspace = useCallback(() => {
  setResetConfirmOpen(false);
}, []);

const confirmResetWorkspace = useCallback(() => {
  resetWorkspace();
}, [resetWorkspace]);
```

- [ ] **Step 6: Export from the controller return object**

Add:

```ts
resetConfirmOpen,
requestCraftieHome,
cancelResetWorkspace,
confirmResetWorkspace,
```

---

### Task 5: Wire UI in `SelectColorsWorkspace`

**Files:**
- Modify: `src/components/color/SelectColorsWorkspace.tsx`

- [ ] **Step 1: Import dialog**

```ts
import { ConfirmResetWorkspaceDialog } from '@/components/layout/ConfirmResetWorkspaceDialog';
```

- [ ] **Step 2: Pass `onCraftieHome` to header**

```tsx
<WorkspaceHeader
  canExport={workspace.isReviewPhase}
  onCraftieHome={workspace.requestCraftieHome}
  onExportDesignMd={workspace.handleExportDesignMd}
  onExportBrandKit={workspace.handleExportBrandKit}
/>
```

- [ ] **Step 3: Mount the confirm dialog** (alongside `inspirationModal` / shared chrome is fine)

```tsx
<ConfirmResetWorkspaceDialog
  open={workspace.resetConfirmOpen}
  onCancel={workspace.cancelResetWorkspace}
  onConfirm={workspace.confirmResetWorkspace}
/>
```

Place it once in `sharedChrome` (or next to `inspirationModal`) so both empty and filled layouts get it.

- [ ] **Step 4: Typecheck the wired files**

Run: `pnpm exec tsc --noEmit -p tsconfig.json` (or `pnpm test` + existing scripts)

Expected: no new errors from these files.

- [ ] **Step 5: Run unit tests**

Run: `pnpm vitest run lib/studio/workspaceProgress.test.ts`

Expected: PASS

---

### Task 6: Manual acceptance checklist

No automated browser test in this plan. Verify in the running app (`pnpm dev`):

- [ ] **Empty state:** click Craftie → no dialog; still shows “Empieza con una inspiración”.
- [ ] **After curated style:** click Craftie → dialog appears; Cancel keeps palette; Confirm returns to empty card.
- [ ] **After image upload (or mid-extract):** click Craftie → dialog; Confirm clears preview and catalog.
- [ ] **Keyboard:** with dialog open, Escape cancels; Tab cycles Cancel ↔ Empezar de nuevo.
- [ ] **Persistence:** theme toggle / panel layout still intact after reset; no new `localStorage` project keys appear in DevTools.

---

## Spec coverage (self-review)

| Spec requirement | Task |
| --- | --- |
| Confirm when progress | Task 1 + 4 (`requestCraftieHome`) |
| Silent reset when empty | Task 4 |
| Progress definition | Task 1 |
| `resetWorkspace` clears listed state | Task 4 |
| Does not touch theme/panels/guide dismiss | Task 4 (omits those) |
| Dialog copy + a11y | Task 2 |
| Header wordmark action | Task 3 |
| Wire-up | Task 5 |
| Acceptance criteria | Task 6 |
| No project localStorage | Tasks 4–6 (no writes added) |

**Placeholder scan:** none. **Types:** `WorkspaceProgressInput` matches controller fields; handlers named consistently across Tasks 4–5.
