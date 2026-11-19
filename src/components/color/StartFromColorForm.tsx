'use client';

import { useId, useState } from 'react';
import { Pipette } from 'lucide-react';
import { StartOptionIcon } from '@/components/color/StartOptionIcon';

import { Button } from '@/components/ui/Button';
import { useT, useTx } from '@/context/I18nContext';

export function StartFromColorForm({ onStart }: { onStart: (hex: string) => string | null }) {
  const tx = useTx();
  const t = useT();
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (value.trim().length === 0) {
      setError(t('start.hexRequired'));
      return;
    }
    setError(onStart(value));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="mb-3">
        <label htmlFor={inputId} className="flex items-center gap-2.5 text-[0.9375rem] font-bold text-ink">
          <StartOptionIcon>
            <Pipette />
          </StartOptionIcon>
          {t('start.fromHex')}
        </label>
      </div>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          value={value}
          placeholder="#1F6F54"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 text-chrome-body text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        />
        <Button type="submit" variant="ghost" className="min-h-11 shrink-0 rounded-lg font-semibold text-primary">
          {t('start.createPalette')}
        </Button>
      </div>
      <button
        type="button"
        onClick={() => {
          setValue('#1F6F54');
          setError(null);
        }}
        className="mt-2 text-[0.8125rem] font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:underline"
      >
        {t('start.example')} <span className="font-mono text-primary">#1F6F54</span>
      </button>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-chrome-caption font-medium text-fail">
          {tx(error)}
        </p>
      ) : null}
    </form>
  );
}
