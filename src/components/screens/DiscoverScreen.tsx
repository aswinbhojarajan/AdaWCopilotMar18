import React, { useState } from 'react';
import { Tag, ContentCard, PullToRefresh } from '../ada';
import { SkeletonList } from '../ada/Skeleton';
import { ErrorBanner } from '../ada/ErrorBanner';
import { useDiscoverContent } from '../../hooks/useContent';

interface DiscoverScreenProps {
  onChatSubmit?: (message: string, context?: { category: string; categoryType: string; title: string; sourceScreen?: string }) => void;
}

export function DiscoverScreen({
  onChatSubmit,
}: DiscoverScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'forYou' | 'whatsHappening'>('forYou');

  const { data, isLoading, isError, refetch } = useDiscoverContent(activeFilter);

  const displayedContent = data ?? [];

  return (
    <PullToRefresh
      onRefresh={async () => { await refetch(); }}
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
                <Tag active={activeFilter === 'forYou'} onClick={() => setActiveFilter('forYou')}>
                  For You
                </Tag>
                <Tag
                  active={activeFilter === 'whatsHappening'}
                  onClick={() => setActiveFilter('whatsHappening')}
                >
                  What's Happening
                </Tag>
              </div>
            </div>
          </div>

          {displayedContent.map((item, index) => (
            <ContentCard
              key={`${activeFilter}-${item.id ?? index}`}
              category={item.category}
              categoryType={item.categoryType}
              title={item.title}
              contextTitle={item.contextTitle}
              description={item.description}
              timestamp={item.timestamp}
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
            />
          ))}
        </div>
      )}
    </PullToRefresh>
  );
}
