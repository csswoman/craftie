import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { MediaCoverArt } from './MediaCoverArt';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { MEDIA_NAV, MEDIA_PLAYLISTS } from './mediaPreviewData';
import { PreviewIcon } from './previewIcons';
import { brandStyle, captionStyle, labelStyle, ROLE_WEIGHT, type PreviewFonts } from './previewTypography';

/** Library rail: wordmark, three destinations and the user's playlists with their covers. */
export function MediaSidebar({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  return (
    <PreviewSlotTarget
      slot="chrome"
      onEditSlot={onEditSlot}
      className="hidden w-56 shrink-0 flex-col gap-7 border-r p-5 @min-[860px]/media:flex"
      style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
    >
      <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="px-2" style={brandStyle(fonts)}>
        Radio Craftie
      </PreviewSlotTarget>

      <nav className="space-y-0.5" aria-label="Secciones">
        {MEDIA_NAV.map((item, index) => (
          <span
            key={item.label}
            className="flex items-center gap-3 rounded-lg px-2 py-2"
            style={{
              ...labelStyle(fonts, index === 0 ? colors.text : colors.mutedText),
              backgroundColor: index === 0 ? colors.surfaceElevated : 'transparent',
              fontWeight: index === 0 ? ROLE_WEIGHT.button : ROLE_WEIGHT.label,
            }}
          >
            <PreviewIcon name={item.icon} size={16} />
            {item.label}
          </span>
        ))}
      </nav>

      <div>
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mb-2 px-2" style={captionStyle(fonts, colors.mutedText)}>
          Tus listas
        </PreviewSlotTarget>
        <ul className="space-y-1">
          {MEDIA_PLAYLISTS.map((name, index) => (
            <li key={name} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
              <MediaCoverArt colors={colors} seed={index + 1} className="size-9 shrink-0 rounded-md" />
              <span className="min-w-0">
                <span className="block truncate" style={labelStyle(fonts, colors.text)}>
                  {name}
                </span>
                <span className="block truncate" style={captionStyle(fonts, colors.mutedText)}>
                  Lista · {8 + index * 5} pistas
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </PreviewSlotTarget>
  );
}
