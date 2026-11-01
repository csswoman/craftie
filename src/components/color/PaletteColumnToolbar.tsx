'use client';

import { PaletteToolbarIconButton } from './PaletteToolbarIconButton';
import {
  CopyIcon,
  InfoIcon,
  LockIcon,
  MoveLeftIcon,
  MoveRightIcon,
  RandomColorIcon,
  ShadesIcon,
} from './paletteToolbarIcons';
import { useT } from '@/context/I18nContext';

type PaletteColumnToolbarProps = {
  locked: boolean;
  editable: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  showShades: boolean;
  lightChrome: boolean;
  hoverGroup?: 'column' | 'slot';
  alwaysVisible?: boolean;
  layout?: 'overlay' | 'inline';
  onToggleLock: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onCopyHex: () => void;
  onToggleShades: () => void;
  onOpenInfo: () => void;
  onRandomizeColor?: () => void;
};

const HOVER_VISIBILITY: Record<'column' | 'slot', string> = {
  column:
    'opacity-0 transition-opacity group-hover/column:opacity-100 group-focus-within/column:opacity-100',
  slot: 'opacity-0 transition-opacity group-hover/slot:opacity-100 group-focus-within/slot:opacity-100',
};

export function PaletteColumnToolbar({
  locked,
  editable,
  canMoveLeft,
  canMoveRight,
  showShades,
  lightChrome,
  hoverGroup = 'column',
  alwaysVisible = false,
  layout = 'overlay',
  onToggleLock,
  onMoveLeft,
  onMoveRight,
  onCopyHex,
  onToggleShades,
  onOpenInfo,
  onRandomizeColor,
}: PaletteColumnToolbarProps) {
  const t = useT();
  const slotMode = hoverGroup === 'slot';
  const inlineLayout = layout === 'inline';
  const visibilityClass = alwaysVisible
    ? 'opacity-100'
    : HOVER_VISIBILITY[hoverGroup];

  return (
    <div
      className={
        inlineLayout
          ? `relative z-10 flex shrink-0 ${visibilityClass}`
          : `pointer-events-none absolute z-10 flex ${
              slotMode ? 'inset-x-0 top-4 justify-center' : 'inset-x-0 top-[18%] justify-center'
            } ${visibilityClass}`
      }
    >
      <div
        className={`pointer-events-auto flex items-center ${
          inlineLayout
            ? 'flex-row flex-wrap justify-end gap-0.5'
            : slotMode
              ? 'flex-row gap-1.5'
              : 'flex-col gap-2.5'
        }`}
      >
        {editable && onRandomizeColor ? (
          <PaletteToolbarIconButton
            label={t('ui.PaletteColumnToolbar.generar-color-al-azar')}
            disabled={locked}
            lightChrome={lightChrome}
            compact={inlineLayout}
            showTooltip={!alwaysVisible}
            onClick={onRandomizeColor}
          >
            <RandomColorIcon />
          </PaletteToolbarIconButton>
        ) : null}

        <PaletteToolbarIconButton
          label={showShades ? t('ui.PaletteColumnToolbar.ocultar-shades') : t('ui.PaletteColumnToolbar.ver-shades')}
          active={showShades}
          lightChrome={lightChrome}
          compact={inlineLayout}
          showTooltip={!alwaysVisible}
          onClick={onToggleShades}
        >
          <ShadesIcon />
        </PaletteToolbarIconButton>

        {editable && (canMoveLeft || canMoveRight) ? (
          <>
            <PaletteToolbarIconButton
              label={t('ui.PaletteColumnToolbar.mover-a-la-izquierda')}
              disabled={!canMoveLeft || locked}
              lightChrome={lightChrome}
              compact={inlineLayout}
              showTooltip={!alwaysVisible}
              onClick={onMoveLeft}
            >
              <MoveLeftIcon />
            </PaletteToolbarIconButton>
            <PaletteToolbarIconButton
              label={t('ui.PaletteColumnToolbar.mover-a-la-derecha')}
              disabled={!canMoveRight || locked}
              lightChrome={lightChrome}
              compact={inlineLayout}
              showTooltip={!alwaysVisible}
              onClick={onMoveRight}
            >
              <MoveRightIcon />
            </PaletteToolbarIconButton>
          </>
        ) : null}

        <PaletteToolbarIconButton
          label={t('ui.PaletteColumnToolbar.copiar-hex')}
          lightChrome={lightChrome}
          compact={inlineLayout}
          showTooltip={!alwaysVisible}
          onClick={onCopyHex}
        >
          <CopyIcon />
        </PaletteToolbarIconButton>

        <PaletteToolbarIconButton
          label={t('ui.PaletteColumnToolbar.ver-info-del-color')}
          lightChrome={lightChrome}
          compact={inlineLayout}
          showTooltip={!alwaysVisible}
          onClick={onOpenInfo}
        >
          <InfoIcon />
        </PaletteToolbarIconButton>

        {editable ? (
          <PaletteToolbarIconButton
            label={locked ? t('ui.PaletteColumnToolbar.desbloquear-color') : t('ui.PaletteColumnToolbar.bloquear-color')}
            active={locked}
            lightChrome={lightChrome}
            compact={inlineLayout}
            showTooltip={!alwaysVisible}
            onClick={onToggleLock}
          >
            <LockIcon locked={locked} />
          </PaletteToolbarIconButton>
        ) : null}
      </div>
    </div>
  );
}
