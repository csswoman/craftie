import type { ActiveRoleContrastInfo } from '@lib/color/roleInspectorContrast';
import { apcaContrast } from '@lib/color/apca';

export function RoleHexInput({
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
      <span className="text-chrome-label font-medium text-muted">
        HEX
      </span>
      <div className="mt-1 flex items-center overflow-hidden rounded-xl border border-border bg-bg/90 focus-within:ring-[3px] focus-within:ring-primary/20">
        <span className="px-2.5 font-mono text-chrome-label text-muted">#</span>
        <input
          id={inputId}
          type="text"
          value={hex.replace('#', '').toUpperCase()}
          disabled={disabled}
          spellCheck={false}
          maxLength={6}
          aria-label="Código HEX"
          onChange={(event) => onCommit(event.target.value)}
          className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 font-mono text-chrome-label uppercase text-ink placeholder:text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </label>
  );
}

export function RoleOklchSliders({
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
    <div className="space-y-4">
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

export function RoleLockToggle({ locked, onToggle }: { locked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={locked}
      aria-label={locked ? 'Desbloquear rol' : 'Bloquear rol'}
      title={locked ? 'Desbloquear' : 'Bloquear'}
      className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 ${
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
  const apca = apcaContrast(contrast.foregroundHex, contrast.backgroundHex);
  const apcaPasses = Math.abs(apca) >= 60;
  const standardsDisagree = (contrast.status === 'pass') !== apcaPasses;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
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
        <p className="text-chrome-label font-medium text-muted">
          Contraste
        </p>
        <span
          className={`rounded-full px-2.5 py-0.5 font-mono text-chrome-label font-semibold tabular-nums ${
            passes ? 'text-pass' : fails ? 'text-fail' : 'text-muted'
          }`}
        >
          {contrast.ratio.toFixed(2)}:1
        </span>
      </div>
      <p className="mt-1 text-chrome-label text-ink">{contrast.pairLabel}</p>
      <p className="mt-1 font-mono text-chrome-caption text-muted">
        APCA Lc {Math.round(apca)} · {apcaPasses ? 'legible para texto' : 'por debajo de Lc 60'}
        {standardsDisagree ? ' · ⚠ WCAG y APCA discrepan' : ''}
      </p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block size-3.5 shrink-0 rounded-full ring-1 ring-inset ring-ink/10"
            style={{ backgroundColor: contrast.foregroundHex }}
            aria-hidden="true"
          />
          <span className="text-chrome-caption text-muted">sobre</span>
          <span
            className="inline-block size-3.5 shrink-0 rounded-full ring-1 ring-inset ring-ink/10"
            style={{ backgroundColor: contrast.backgroundHex }}
            aria-hidden="true"
          />
        </div>
        <span
          className={`text-chrome-caption font-semibold ${
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

function OklchSlider({
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
        <label
          htmlFor={id}
          className="text-chrome-label font-medium text-muted"
        >
          {label}
        </label>
        <span className="font-mono text-chrome-label tabular-nums text-muted">{displayValue}</span>
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
