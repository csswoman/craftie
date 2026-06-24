'use client';

export type MockupScaledPreviewProps = {
  children: React.ReactNode;
};

const DESIGN_WIDTH = 320;
const DESIGN_HEIGHT = 240;

export function MockupScaledPreview({ children }: MockupScaledPreviewProps) {
  return (
    <div
      className="@container relative h-full min-h-[168px] w-full overflow-hidden sm:min-h-[192px]"
      style={{ containerType: 'inline-size' }}
    >
      <div
        className="relative w-full"
        style={{ height: `calc(${DESIGN_HEIGHT}px * (100cqw / ${DESIGN_WIDTH}px))` }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(calc(100cqw / ${DESIGN_WIDTH}px))`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
