import React, { useState } from 'react';
import type { SectionBlock } from '../../../../shared/schemas/agent';

interface SectionProps {
  block: SectionBlock;
}

export function Section({ block }: SectionProps) {
  const [expanded, setExpanded] = useState(!block.collapsible);

  const renderBody = (text: string) => {
    const paragraphs = text.split('\n\n');
    return paragraphs.map((paragraph, pIdx) => {
      const lines = paragraph.split('\n');
      const hasBullets = lines.some(l => /^\s*[•\-–]\s/.test(l.trim()));

      if (hasBullets) {
        return (
          <div key={pIdx} className={pIdx > 0 ? 'mt-[8px]' : ''}>
            {lines.map((line, lIdx) => {
              const bulletMatch = line.trim().match(/^[•\-–]\s*(.*)/);
              if (bulletMatch) {
                return (
                  <div key={lIdx} className="flex gap-[6px] items-start mt-[3px]">
                    <span className="text-[#999] mt-[1px] shrink-0 text-[0.6875rem]">•</span>
                    <span className="flex-1">{renderInline(bulletMatch[1])}</span>
                  </div>
                );
              }
              return line.trim() ? <p key={lIdx} className={lIdx > 0 ? 'mt-[4px]' : ''}>{renderInline(line)}</p> : null;
            })}
          </div>
        );
      }

      return (
        <p key={pIdx} className={pIdx > 0 ? 'mt-[8px]' : ''}>
          {renderInline(paragraph)}
        </p>
      );
    });
  };

  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) parts.push(<React.Fragment key={key++}>{remaining.substring(0, boldMatch.index)}</React.Fragment>);
        parts.push(<strong key={key++} className="font-medium">{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(<React.Fragment key={key++}>{remaining}</React.Fragment>);
        break;
      }
    }
    return parts;
  };

  return (
    <div className="rounded-[12px] bg-white border border-[#e8e5de] overflow-hidden">
      {block.collapsible ? (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-[14px] py-[10px] text-left"
        >
          <h4 className="font-['Crimson_Pro',serif] text-[#333] text-[0.9375rem] tracking-[-0.3px] font-medium">
            {block.heading}
          </h4>
          <svg
            className={`w-[14px] h-[14px] text-[#999] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <div className="px-[14px] pt-[10px]">
          <h4 className="font-['Crimson_Pro',serif] text-[#333] text-[0.9375rem] tracking-[-0.3px] font-medium">
            {block.heading}
          </h4>
        </div>
      )}

      {expanded && (
        <div className="px-[14px] pb-[12px] pt-[4px]">
          <div className="font-['DM_Sans',sans-serif] font-light text-[#555] text-[0.8125rem] leading-[1.6]">
            {renderBody(block.body)}
          </div>
        </div>
      )}
    </div>
  );
}
