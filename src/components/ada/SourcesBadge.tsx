import React from 'react';

/**
 * SourcesBadge Component
 *
 * Displays credible sources indicator with overlapping source logos and count.
 * Used in news cards to show aggregated source information.
 *
 * Design Tokens:
 * - Background: #f5f5f5 (light grey badge background)
 * - Border radius: 6px
 * - Padding: 8px horizontal, 4px vertical
 * - Gap between elements: 6px
 *
 * Source Logo Styling:
 * - Size: 18px circular
 * - Border: 1.5px white
 * - Overlap: -6px (negative space)
 * - Bloomberg: #0E9CFF background, "B" text at 9px
 * - Financial Times: #FF6B9D background, "FT" text at 6px
 *
 * Typography:
 * - Font: DM Sans Regular
 * - Size: 11px
 * - Color: #999999 (medium grey)
 *
 * @param sourcesCount - Number of credible sources (e.g., 54, 82)
 */

interface SourcesBadgeProps {
  sourcesCount: number;
}

export function SourcesBadge({ sourcesCount }: SourcesBadgeProps) {
  return (
    <div className="flex items-center gap-[6px] px-[8px] py-[4px] bg-[#f5f5f5] rounded-[6px]">
      {/* Source logos */}
      <div className="flex items-center -space-x-[6px]">
        {/* Bloomberg logo */}
        <div className="size-[18px] rounded-full bg-[#0E9CFF] flex items-center justify-center border-[1.5px] border-white relative z-10">
          <span className="font-['DM_Sans',sans-serif] font-bold text-white text-[9px] leading-none">
            B
          </span>
        </div>
        {/* Financial Times logo */}
        <div className="size-[18px] rounded-full bg-[#FF6B9D] flex items-center justify-center border-[1.5px] border-white relative z-0">
          <span className="font-['DM_Sans',sans-serif] font-bold text-white text-[6px] leading-none">
            FT
          </span>
        </div>
      </div>
      {/* Sources count text */}
      <p className="font-['DM_Sans',sans-serif] text-[#999999] text-[11px] leading-normal">
        {sourcesCount} sources
      </p>
    </div>
  );
}
