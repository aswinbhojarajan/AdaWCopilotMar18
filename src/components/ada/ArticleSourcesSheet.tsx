import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { getPublisherIdentity } from './publisherRegistry';
import type { SupportingArticle } from '../../../shared/types';

interface ArticleSourcesSheetProps {
  articles: SupportingArticle[];
  isOpen: boolean;
  onClose: () => void;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = Date.now();
    const diffMin = Math.floor((now - date.getTime()) / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function ArticleSourcesSheet({ articles, isOpen, onClose }: ArticleSourcesSheetProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
      return undefined;
    }
    setAnimating(false);
    const timer = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!visible) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      onClick={handleBackdropClick}
    >
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: animating ? 0.4 : 0 }}
      />

      <div
        ref={sheetRef}
        className="relative w-full max-w-[430px] bg-white rounded-t-[24px] transition-transform duration-300 ease-out flex flex-col"
        style={{
          transform: animating ? 'translateY(0)' : 'translateY(100%)',
          maxHeight: '70vh',
        }}
      >
        <div className="flex items-center justify-between px-[20px] pt-[20px] pb-[12px] border-b border-[#f0eded] shrink-0">
          <h3 className="font-['DM_Sans',sans-serif] font-semibold text-[0.9375rem] text-[#333333]">
            Sources ({articles.length})
          </h3>
          <button
            onClick={onClose}
            className="size-[32px] flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors"
            type="button"
          >
            <X className="size-[18px] text-[#999999]" strokeWidth={1.5} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-[20px] py-[16px]">
          <div className="flex flex-col gap-[16px]">
            {articles.map((article, i) => {
              const identity = getPublisherIdentity(article.publisher || 'Unknown');
              const fontSize = identity.initials.length > 2 ? '0.375rem' : identity.initials.length === 2 ? '0.4375rem' : '0.5625rem';
              const timeLabel = formatRelativeTime(article.published_at);

              return (
                <div key={i} className="flex gap-[12px]">
                  <div
                    className="size-[36px] rounded-full flex items-center justify-center shrink-0 mt-[2px]"
                    style={{ backgroundColor: identity.color }}
                  >
                    <span
                      className="font-['DM_Sans',sans-serif] font-bold text-white leading-none"
                      style={{ fontSize }}
                    >
                      {identity.initials}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[6px] mb-[2px]">
                      <span className="font-['DM_Sans',sans-serif] font-medium text-[0.75rem] text-[#555555]">
                        {article.publisher}
                      </span>
                      {timeLabel && (
                        <>
                          <span className="text-[#cccccc]">·</span>
                          <span className="font-['DM_Sans',sans-serif] text-[0.6875rem] text-[#999999]">
                            {timeLabel}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="font-['DM_Sans',sans-serif] font-medium text-[0.8125rem] text-[#333333] leading-[1.35] line-clamp-2 mb-[4px]">
                      {article.title}
                    </p>

                    {article.summary && (
                      <p className="font-['DM_Sans',sans-serif] text-[0.75rem] text-[#777777] leading-[1.4] line-clamp-2 mb-[6px]">
                        {article.summary}
                      </p>
                    )}

                    {article.url && /^https?:\/\//i.test(article.url) && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-[4px] font-['DM_Sans',sans-serif] text-[0.6875rem] font-medium text-[#992929] hover:text-[#7a2020] transition-colors no-underline"
                      >
                        View article
                        <ExternalLink className="size-[11px]" strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
