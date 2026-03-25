import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Tag, ContentCard, PullToRefresh, ErrorBoundary } from '../ada';
import { SkeletonList } from '../ada/Skeleton';
import { ErrorBanner } from '../ada/ErrorBanner';
import { useDiscoverContentPaginated } from '../../hooks/useContent';

interface DiscoverScreenProps {
  onChatSubmit?: (message: string, context?: { category: string; categoryType: string; title: string; sourceScreen?: string; discoverCard?: { card_id?: string; card_type?: string; card_summary?: string; why_seen?: string; entities?: string[]; cta_family?: string } }) => void;
}

export function DiscoverScreen({
  onChatSubmit,
}: DiscoverScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'forYou' | 'whatsNew'>('forYou');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [dismissedCardIds, setDismissedCardIds] = useState<Set<string>>(new Set());
  const scrollSentinelRef = useRef<HTMLDivElement>(null);
  const visitRecordedRef = useRef(false);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useDiscoverContentPaginated(activeFilter);

  useEffect(() => {
    if (!visitRecordedRef.current) {
      visitRecordedRef.current = true;
      fetch('/api/discover/visit', { method: 'POST' }).catch(() => {});
    }
  }, []);

  const displayedContent = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.items).filter(item => !dismissedCardIds.has(item.id || ''));
  }, [data, dismissedCardIds]);

  const handleTabChange = useCallback((tab: 'forYou' | 'whatsNew') => {
    if (tab === activeFilter) return;
    setSlideDirection(tab === 'whatsNew' ? 'left' : 'right');
    setTimeout(() => {
      setActiveFilter(tab);
      setSlideDirection(null);
    }, 200);
  }, [activeFilter]);

  const handleDismiss = useCallback((cardId: string) => {
    setDismissedCardIds(prev => new Set(prev).add(cardId));
    fetch('/api/discover/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, action: 'dismiss' }),
    }).catch(() => {});
  }, []);

  const handleFeedback = useCallback((cardId: string, feedback: string) => {
    fetch('/api/discover/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, action: 'feedback', metadata: { reason: feedback } }),
    }).catch(() => {});
  }, []);

  const handleInteract = useCallback((cardId: string, action: string, metadata?: Record<string, unknown>) => {
    fetch('/api/discover/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, action, metadata }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const sentinel = scrollSentinelRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => { observer.disconnect(); };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const slideStyle: React.CSSProperties = slideDirection
    ? {
        transform: slideDirection === 'left' ? 'translateX(-8px)' : 'translateX(8px)',
        opacity: 0.6,
        transition: 'transform 200ms ease-out, opacity 200ms ease-out',
      }
    : {
        transform: 'translateX(0)',
        opacity: 1,
        transition: 'transform 200ms ease-out, opacity 200ms ease-out',
      };

  return (
    <ErrorBoundary fallbackMessage="Unable to load content. Please try again.">
    <PullToRefresh
      onRefresh={async () => {
        try { await fetch('/api/content/discover/refresh', { method: 'POST' }); } catch {}
        await refetch();
      }}
      className="h-full"
    >
      {isLoading && !data ? (
        <div className="px-[6px] pt-[5px] pb-[107px]">
          <SkeletonList count={4} />
        </div>
      ) : isError && !data ? (
        <ErrorBanner onRetry={() => refetch()} />
      ) : (
        <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
          <div className="relative shrink-0 w-full">
            <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] items-start justify-center px-[24px] py-[16px] relative w-full">
                <Tag active={activeFilter === 'forYou'} onClick={() => handleTabChange('forYou')}>
                  For You
                </Tag>
                <Tag
                  active={activeFilter === 'whatsNew'}
                  onClick={() => handleTabChange('whatsNew')}
                >
                  What's New
                </Tag>
              </div>
            </div>
          </div>

          <div style={slideStyle} className="w-full flex flex-col gap-[5px]">
            {displayedContent.map((item, index) => (
              <ContentCard
                key={`${activeFilter}-${item.id ?? index}`}
                id={item.id}
                category={item.category}
                categoryType={item.categoryType}
                title={item.title}
                contextTitle={item.contextTitle}
                description={item.description}
                timestamp={item.freshnessLabel || item.timestamp}
                buttonText={item.buttonText}
                secondaryButtonText={item.secondaryButtonText}
                image={item.image}
                isVideo={item.isVideo}
                sourcesCount={item.sourcesCount}
                topicLabelColor={item.topicLabelColor}
                detailSections={item.detailSections}
                stackButtons={item.stackButtons}
                hideIntent={item.hideIntent}
                customTopic={item.customTopic}
                onChatSubmit={onChatSubmit}
                forceSecondaryButtonStyle={true}
                whyYouAreSeeingThis={item.whyYouAreSeeingThis}
                supportingArticles={item.supportingArticles}
                cardType={item.cardType}
                isNew={item.isNew}
                personalizedOverlay={item.personalizedOverlay}
                onDismiss={handleDismiss}
                onFeedback={handleFeedback}
                onInteract={handleInteract}
                ctaEntities={(item as unknown as { ctaEntities?: string[] }).ctaEntities}
              />
            ))}
            {isFetchingNextPage && (
              <div className="px-[6px] py-[8px]">
                <SkeletonList count={2} />
              </div>
            )}
            <div ref={scrollSentinelRef} className="h-[1px]" />
          </div>
        </div>
      )}
    </PullToRefresh>
    </ErrorBoundary>
  );
}
