'use client';

import type { ActiveRoleContrastInfo } from '@lib/color/roleInspectorContrast';
import type { PaletteRoleId } from '@lib/color/rolePalette';

import { useRoleColorEditor } from './useRoleColorEditor';

export type RoleColorEditorProps = {
  role: PaletteRoleId;
  idPrefix?: string;
  showSwatch?: boolean;
  showContrast?: boolean;
  showLock?: boolean;
};

export function RoleColorEditor({
  role,
  idPrefix = 'role-editor',
  showSwatch = true,
  showContrast = true,
  showLock = true,
}: RoleColorEditorProps) {
  const editor = useRoleColorEditor(role);

  if (!editor.ready || !editor.slot || !editor.oklch || !editor.contrast) {
    return null;
  }

  const { slot, locked, oklch, chromaMax, contrast, updateOklch, handleHexCommit, toggleLock } =
    editor;

  return (
    <div className="space-y-3">
      {showSwatch || showLock ? (
        <div className="flex items-start gap-3">
          {showSwatch ? (
            <div
              className="size-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-inset ring-ink/10"
              style={{ backgroundColor: slot.hex }}
              aria-hidden="true"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <RoleHexInput
              hex={slot.hex}
              disabled={locked}
              inputId={`${idPrefix}-hex`}
              onCommit={handleHexCommit}
            />
            {showLock ? (
              <div className="mt-2 flex justify-end">
                <RoleLockToggle locked={locked} onToggle={toggleLock} />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <RoleHexInput
          hex={slot.hex}
          disabled={locked}
          inputId={`${idPrefix}-hex`}
          onCommit={handleHexCommit}
        />
      )}

      <RoleOklchSliders
        idPrefix={idPrefix}
        oklch={oklch}
        chromaMax={chromaMax}
        disabled={locked}
        onChange={updateOklch}
      />

      {showContrast ? <RoleContrastBadge contrast={contrast} /> : null}
    </div>
  );
}

function RoleHexInput({
  hex,
  disabled,
  inputId,
  onCommit,
}: {
  hex: string;
  disabled: boolean;
  inputId: string;
  onCommit: (raw: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[0.6875rem] font-semibold text-muted">HEX</span>
      <div className="mt-1 flex items-center overflow-hidden rounded-md border border-border bg-bg focus-within:ring-[3px] focus-within:ring-primary/25">
        <span className="px-2 font-mono text-[0.8125rem] text-muted">#</span>
        <input
          id={inputId}
          type="text"
          value={hex.replace('#', '').toUpperCase()}
          disabled={disabled}
          spellCheck={false}
          maxLength={6}
          aria-label="Código HEX"
          onChange={(event) => onCommit(event.target.value)}
          className="min-w-0 flex-1 bg-transparent py-2 pr-2 font-mono text-[0.8125rem] uppercase text-ink placeholder:text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </label>
  );
}

function RoleOklchSliders({
  idPrefix,
  oklch,
  chromaMax,
  disabled,
  onChange,
}: {
  idPrefix: string;
  oklch: { l: number; c: number; h: number };
  chromaMax: number;
  disabled: boolean;
  onChange: (patch: Partial<{ l: number; c: number; h: number }>) => void;
}) {
  return (
    <div className="space-y-3">
      <OklchSlider
        id={`${idPrefix}-l`}
        label="Luminosidad (L)"
        value={oklch.l}
        min={0}
        max={1}
        step={0.005}
        disabled={disabled}
        displayValue={`${(oklch.l * 100).toFixed(1)}%`}
        onChange={(value) => onChange({ l: value })}
      />
      <OklchSlider
        id={`${idPrefix}-c`}
        label="Croma (C)"
        value={oklch.c}
        min={0}
        max={chromaMax}
        step={0.002}
        disabled={disabled}
        displayValue={oklch.c.toFixed(3)}
        onChange={(value) => onChange({ c: value })}
      />
      <OklchSlider
        id={`${idPrefix}-h`}
        label="Matiz (H)"
        value={oklch.h}
        min={0}
        max={360}
        step={1}
        disabled={disabled || oklch.c <= 0.0005}
        displayValue={`${Math.round(oklch.h)}°`}
        onChange={(value) => onChange({ h: value })}
      />
    </div>
  );
}

export function OklchSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  disabled,
  displayValue,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  displayValue: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[0.6875rem] font-semibold text-muted">
          {label}
        </label>
        <span className="font-mono text-[0.6875rem] tabular-nums text-ink">{displayValue}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-raised accent-primary disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

export function RoleLockToggle({ locked, onToggle }: { locked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={locked}
      aria-label={locked ? 'Desbloquear rol' : 'Bloquear rol'}
      title={locked ? 'Desbloquear' : 'Bloquear'}
      className={`flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        locked
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border bg-bg text-muted hover:bg-surface-raised hover:text-ink'
      }`}
    >
      <LockIcon locked={locked} />
    </button>
  );
}

export function RoleContrastBadge({ contrast }: { contrast: ActiveRoleContrastInfo }) {
  const passes = contrast.status === 'pass';
  const fails = contrast.status === 'fail';

  return (
    <div
      className={`rounded-md border px-3 py-2.5 ${
        passes
          ? 'border-pass/30 bg-pass/10'
          : fails
            ? 'border-fail/30 bg-fail/10'
            : 'border-border bg-surface-raised'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.6875rem] font-semibold text-muted">Contraste</p>
        <span
          className={`font-mono text-[0.875rem] font-semibold tabular-nums ${
            passes ? 'text-pass' : fails ? 'text-fail' : 'text-muted'
          }`}
        >
          {contrast.ratio.toFixed(2)}:1
        </span>
      </div>
      <p className="mt-1 text-[0.75rem] text-muted">{contrast.pairLabel}</p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className="inline-block size-4 shrink-0 rounded ring-1 ring-inset ring-ink/10"
          style={{ backgroundColor: contrast.foregroundHex }}
          aria-hidden="true"
        />
        <span className="text-[0.6875rem] text-muted">sobre</span>
        <span
          className="inline-block size-4 shrink-0 rounded ring-1 ring-inset ring-ink/10"
          style={{ backgroundColor: contrast.backgroundHex }}
          aria-hidden="true"
        />
        <span
          className={`ml-auto text-[0.6875rem] font-semibold ${
            passes ? 'text-pass' : fails ? 'text-fail' : 'text-muted'
          }`}
        >
          {contrast.level === 'fail' ? 'No cumple AA' : `WCAG ${contrast.level}`}
          {contrast.passesAaa ? ' · AAA' : ''}
        </span>
      </div>
    </div>
  );
}

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
      {locked ? (
        <>
          <rect x="5.5" y="9" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x="5.5" y="9" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 9V7a3 3 0 1 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
