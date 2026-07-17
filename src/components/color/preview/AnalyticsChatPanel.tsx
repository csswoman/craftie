'use client';

import { useState, type CSSProperties } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_CHAT } from './analyticsPreviewData';
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
  const craftieFill = colors.primaryAction;
  const onCraftie = onVividFill(craftieFill);

  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className="rounded-[14px] border p-4 lg:p-5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PreviewSlotTarget
            slot="primaryAction"
            onEditSlot={onEditSlot}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-black"
            style={{ backgroundColor: craftieFill, color: onCraftie }}
          >
            {ANALYTICS_CHAT.initials}
          </PreviewSlotTarget>
          <div>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block" style={headingStyle(fonts)}>
              {ANALYTICS_CHAT.name}
            </PreviewSlotTarget>
            <span className="flex items-center gap-1.5" style={labelStyle(fonts, colors.mutedText)}>
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
        <span style={labelStyle(fonts, colors.mutedText)} aria-hidden="true">
          •••
        </span>
      </div>

      <div className="mt-4 space-y-3" aria-live="polite">
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
            />
          ),
        )}
        {sentMessage ? (
          <MessageBubble text={sentMessage} time="Ahora" colors={colors} fonts={fonts} fill={outgoingFill} />
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
          style={{ backgroundColor: craftieFill, color: onCraftie, outlineColor: colors.primaryAction }}
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
}: {
  text: string;
  time: string;
  incoming?: boolean;
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  fill?: string;
}) {
  const backgroundColor = incoming ? tint(colors.data2, 12) : (fill ?? colors.data4);
  const color = incoming ? colors.text : onVividFill(backgroundColor);

  return (
    <div className={`preview-list-in flex ${incoming ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[82%] px-3 py-2 ${incoming ? 'rounded-r-xl rounded-bl-xl' : 'rounded-l-xl rounded-br-xl'}`}
        style={{ backgroundColor, color }}
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
