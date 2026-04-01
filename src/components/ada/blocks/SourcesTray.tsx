import React from 'react';
import type { SourceReference } from '../../../../shared/schemas/agent';

interface SourcesTrayProps {
  sources: SourceReference[];
}

const SOURCE_ICONS: Record<string, string> = {
  portfolio: '📊',
  market_data: '📈',
  model_estimate: '🤖',
  research: '📋',
  internal: '🏦',
};

export function SourcesTray({ sources }: SourcesTrayProps) {
  if (sources.length === 0) return null;

  return (
    <div className="flex gap-[6px] overflow-x-auto scrollbar-hide py-[2px]">
      {sources.map((source, idx) => (
        <div
          key={idx}
          className="flex-shrink-0 inline-flex items-center gap-[4px] px-[8px] py-[4px] rounded-full bg-[#f0ede5] text-[0.625rem] font-['DM_Sans',sans-serif]"
        >
          <span className="text-[0.5rem]">{SOURCE_ICONS[source.sourceType] || '📄'}</span>
          <span className="text-[#555] font-medium">{source.label}</span>
          <span className="text-[#999]">· {source.freshness}</span>
        </div>
      ))}
    </div>
  );
}
