import React from 'react';
import { getPublisherIdentity } from './publisherRegistry';

interface SourcesBadgeProps {
  articles: Array<{ publisher: string }>;
  onClick?: () => void;
}

export function SourcesBadge({ articles, onClick }: SourcesBadgeProps) {
  if (articles.length === 0) return null;

  const uniquePublishers = [...new Map(articles.map(a => [(a.publisher || 'Unknown').toLowerCase(), a.publisher || 'Unknown'])).values()];
  const displayPublishers = uniquePublishers.slice(0, 3);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-[6px] px-[8px] py-[4px] bg-[#f5f5f5] rounded-[6px] border-none cursor-pointer hover:bg-[#eeeeee] transition-colors"
      type="button"
    >
      <div className="flex items-center -space-x-[6px]">
        {displayPublishers.map((publisher, i) => {
          const identity = getPublisherIdentity(publisher);
          const fontSize = identity.initials.length > 2 ? '0.3125rem' : identity.initials.length === 2 ? '0.375rem' : '0.5625rem';
          return (
            <div
              key={publisher}
              className="size-[18px] rounded-full flex items-center justify-center border-[1.5px] border-white relative"
              style={{ backgroundColor: identity.color, zIndex: displayPublishers.length - i }}
            >
              <span
                className="font-['DM_Sans',sans-serif] font-bold text-white leading-none"
                style={{ fontSize }}
              >
                {identity.initials}
              </span>
            </div>
          );
        })}
      </div>
      <p className="font-['DM_Sans',sans-serif] text-[#999999] text-[0.6875rem] leading-normal">
        {articles.length} source{articles.length !== 1 ? 's' : ''}
      </p>
    </button>
  );
}
