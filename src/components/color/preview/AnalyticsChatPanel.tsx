'use client';

import { useState, type CSSProperties } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { onVividFill, vividFill } from './previewColor';
import { PreviewIcon } from './previewIcons';
import { tint } from './previewPrimitives';
import { headingStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

export function AnalyticsChatPanel({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [draft, setDraft] = useState('');
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const outgoingFill = vividFill(colors.data4, colors.surface);

  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className="rounded-xl border p-4 lg:p-5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PreviewSlotTarget
            slot="data4"
            onEditSlot={onEditSlot}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-bold"
            style={{ backgroundColor: colors.data4, color: onVividFill(colors.data4) }}
          >
            S
          </PreviewSlotTarget>
          <div>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block" style={headingStyle(fonts)}>
              Sarah Wilson
            </PreviewSlotTarget>
            <span className="flex items-center gap-1.5" style={labelStyle(fonts, colors.mutedText)}>
              <PreviewSlotTarget slot="success" onEditSlot={onEditSlot} className="preview-pulse h-2 w-2 rounded-full" style={{ backgroundColor: colors.success }} />
              Online
            </span>
          </div>
        </div>
        <span style={labelStyle(fonts, colors.mutedText)}>•••</span>
      </div>

      <div className="mt-4 space-y-3" aria-live="polite">
        <MessageBubble text="Hey! How is the launch going?" time="10:32 AM" incoming colors={colors} fonts={fonts} />
        <MessageBubble text="Great — the analytics preview is ready." time="10:34 AM" colors={colors} fonts={fonts} fill={outgoingFill} />
        <MessageBubble text="Perfect. Can you share the latest version?" time="10:35 AM" incoming colors={colors} fonts={fonts} />
        {sentMessage ? <MessageBubble text={sentMessage} time="Now" colors={colors} fonts={fonts} fill={outgoingFill} /> : null}
      </div>

      <form
        className="mt-4 flex items-center gap-2 rounded-lg border p-1.5 pl-3"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const next = draft.trim();
          if (!next) return;
          setSentMessage(next);
          setDraft('');
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          className="preview-chat-input min-w-0 flex-1 bg-transparent outline-none"
          style={
            {
              ...titleStyle(fonts),
              color: colors.text,
              ['--preview-chat-placeholder' as string]: colors.mutedText,
            } as CSSProperties
          }
          placeholder="Type a message…"
          aria-label="Chat message"
        />
        <button
          type="submit"
          onClick={(event) => event.stopPropagation()}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform duration-150 active:scale-90"
          style={{ backgroundColor: colors.data4, color: onVividFill(colors.data4) }}
          aria-label="Send message"
        >
          <PreviewIcon name="arrowRight" size={14} />
        </button>
      </form>
    </PreviewSlotTarget>
  );
}

function MessageBubble({
  text,
  time,
  incoming = false,
  colors,
  fonts,
  fill,
}: {
  text: string;
  time: string;
  incoming?: boolean;
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  fill?: string;
}) {
  const backgroundColor = incoming ? tint(colors.data2, 10) : fill ?? colors.data4;
  const color = incoming ? colors.text : onVividFill(backgroundColor);

  return (
    <div className={`preview-list-in flex ${incoming ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[82%] px-3 py-2 ${incoming ? 'rounded-r-xl rounded-bl-xl' : 'rounded-l-xl rounded-br-xl'}`} style={{ backgroundColor, color }}>
        <p style={titleStyle(fonts)}>{text}</p>
        <p className="mt-1 text-right opacity-70" style={labelStyle(fonts)}>{time}{incoming ? '' : ' ✓'}</p>
      </div>
    </div>
  );
}
