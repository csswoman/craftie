'use client';

import { useState, type CSSProperties } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_CHAT } from './analyticsPreviewData';
import { onVividFill } from './previewColor';
import { PreviewIcon } from './previewIcons';
import { captionStyle, headingStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

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
  /** Analytics chrome is neutral; accent (data-1) is the one expressive identity color. */
  const craftieFill = colors.accent;
  const onCraftie = onVividFill(craftieFill);
  const outgoingFill = colors.text;
  const onOutgoing = colors.surface;

  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className="preview-surface rounded-xl border p-5 @min-[800px]/analytics:p-6"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PreviewSlotTarget
            slot="accent"
            onEditSlot={onEditSlot}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
            style={{ backgroundColor: craftieFill, color: onCraftie, fontFamily: 'var(--font-heading)', fontWeight: 'var(--weight-heading)' }}
          >
            {ANALYTICS_CHAT.initials}
          </PreviewSlotTarget>
          <div>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block" style={headingStyle(fonts)}>
              {ANALYTICS_CHAT.name}
            </PreviewSlotTarget>
            <span className="flex items-center gap-1.5" style={captionStyle(fonts, colors.mutedText)}>
              <PreviewSlotTarget
                slot="success"
                onEditSlot={onEditSlot}
                className="preview-pulse h-2 w-2 rounded-full"
                style={{ backgroundColor: colors.success }}
              />
              {ANALYTICS_CHAT.status}
            </span>
          </div>
        </div>
        <span style={captionStyle(fonts, colors.mutedText)} aria-hidden="true">
          •••
        </span>
      </div>

      <div className="mt-5 space-y-3" aria-live="polite">
        {ANALYTICS_CHAT.messages.map((message) =>
          message.incoming ? (
            <MessageBubble
              key={`${message.time}-${message.text}`}
              text={message.text}
              time={message.time}
              incoming
              colors={colors}
              fonts={fonts}
            />
          ) : (
            <MessageBubble
              key={`${message.time}-${message.text}`}
              text={message.text}
              time={message.time}
              colors={colors}
              fonts={fonts}
              fill={outgoingFill}
              ink={onOutgoing}
            />
          ),
        )}
        {sentMessage ? (
          <MessageBubble
            text={sentMessage}
            time="Ahora"
            colors={colors}
            fonts={fonts}
            fill={outgoingFill}
            ink={onOutgoing}
          />
        ) : null}
      </div>

      <form
        className="mt-4 flex items-center gap-2 rounded-[10px] border p-1.5 pl-3"
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
          placeholder={ANALYTICS_CHAT.placeholder}
          aria-label="Mensaje para Craftie"
        />
        <button
          type="submit"
          onClick={(event) => event.stopPropagation()}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          style={{ backgroundColor: craftieFill, color: onCraftie, outlineColor: craftieFill }}
          aria-label="Enviar mensaje a Craftie"
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
  ink,
}: {
  text: string;
  time: string;
  incoming?: boolean;
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  fill?: string;
  ink?: string;
}) {
  const backgroundColor = incoming ? colors.surfaceElevated : (fill ?? colors.text);
  const color = incoming ? colors.text : (ink ?? colors.surface);

  return (
    <div className={`preview-list-in flex ${incoming ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[82%] border px-3 py-2 ${incoming ? 'rounded-r-xl rounded-bl-xl' : 'rounded-l-xl rounded-br-xl'}`}
        style={{
          backgroundColor,
          color,
          borderColor: incoming ? colors.border : 'transparent',
        }}
      >
        <p style={titleStyle(fonts)}>{text}</p>
        <p className="mt-1 text-right opacity-70" style={labelStyle(fonts)}>
          {time}
          {incoming ? '' : ' ✓'}
        </p>
      </div>
    </div>
  );
}
