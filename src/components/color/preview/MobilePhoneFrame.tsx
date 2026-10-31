import type { ReactNode } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewIcon } from './previewIcons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { MOBILE_TABS } from './mobilePreviewData';
import { captionStyle, previewRootTypeStyle, ROLE_WEIGHT, type PreviewFonts } from './previewTypography';

/**
 * Phone body around one app screen. The bezel uses the app's own ink, not the
 * palette, so it reads as hardware; the screen inside is all palette.
 */
export function MobilePhoneFrame({
  colors,
  fonts,
  activeTab,
  tabColor,
  label,
  className = '',
  onEditSlot,
  children,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  activeTab: string;
  tabColor: string;
  label: string;
  className?: string;
  onEditSlot?: PreviewSlotEditHandler;
  children: ReactNode;
}) {
  return (
    <figure className={`m-0 w-[18rem] shrink-0 ${className}`} aria-label={label}>
      <div className="rounded-[2.75rem] bg-ink p-[7px] shadow-[0_30px_50px_-30px_rgb(0_0_0/0.55)]">
        <PreviewSlotTarget
          slot="appBackground"
          onEditSlot={onEditSlot}
          className="relative flex h-[38rem] flex-col overflow-hidden rounded-[2.3rem]"
          style={{ backgroundColor: colors.appBackground, color: colors.text, ...previewRootTypeStyle() }}
        >
          <div className="relative flex items-center justify-between px-7 pt-3.5 tabular-nums" style={captionStyle(fonts, colors.text)} aria-hidden="true">
            <span>9:41</span>
            <span className="absolute left-1/2 top-2.5 h-[1.4rem] w-[5.5rem] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1.5">
              <span className="flex items-end gap-0.5">
                {[4, 6, 8, 10].map((h) => (
                  <span key={h} className="w-[3px] rounded-[1px]" style={{ height: h, backgroundColor: colors.text }} />
                ))}
              </span>
              <span className="relative h-2.5 w-5 rounded-[3px] border" style={{ borderColor: colors.text }}>
                <span className="absolute inset-[1.5px] right-[4px] rounded-[1px]" style={{ backgroundColor: colors.text }} />
              </span>
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>

          <PreviewSlotTarget
            slot="chrome"
            onEditSlot={onEditSlot}
            className="flex items-center justify-around border-t px-4 pt-2"
            style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
          >
            {MOBILE_TABS.map((tab) => {
              const active = tab.label === activeTab;

              return (
                <span
                  key={tab.label}
                  className="flex min-h-11 flex-col items-center justify-center gap-1 px-3 py-1"
                  style={{ color: active ? colors.text : colors.mutedText }}
                >
                  <PreviewIcon name={tab.icon} size={18} style={{ color: active ? tabColor : colors.mutedText }} />
                  <span style={{ ...captionStyle(fonts), fontWeight: active ? ROLE_WEIGHT.button : ROLE_WEIGHT.caption }}>{tab.label}</span>
                </span>
              );
            })}
          </PreviewSlotTarget>
          <div className="flex justify-center pb-2 pt-1" style={{ backgroundColor: colors.chrome }} aria-hidden="true">
            <span className="h-1 w-28 rounded-full" style={{ backgroundColor: colors.text, opacity: 0.85 }} />
          </div>
        </PreviewSlotTarget>
      </div>
      <figcaption className="mt-3 text-center text-chrome-caption text-muted">{label}</figcaption>
    </figure>
  );
}
