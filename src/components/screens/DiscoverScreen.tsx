import React, { useState } from 'react';
import { TopBar, Header, Navigation, BottomBar, Tag, ContentCard, PullToRefresh } from '../ada';
import { SkeletonList } from '../ada/Skeleton';
import { ErrorBanner } from '../ada/ErrorBanner';
import { useDiscoverContent } from '../../hooks/useContent';
import type { ScreenProps } from '../../types';

export function DiscoverScreen({
  onChatHistoryClick,
  onNotificationsClick,
  onChatSubmit,
  hasActiveChatToday,
  onResumeChat,
  onOpenChat,
  onClose,
  onTabChange,
}: ScreenProps = {}) {
  const [activeFilter, setActiveFilter] = useState<'forYou' | 'whatsHappening'>('forYou');

  const { data, isLoading, isError, refetch } = useDiscoverContent(activeFilter);

  const displayedContent = data ?? [];

  return (
    <div className="bg-[#efede6] relative h-screen w-full">
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-0 pt-0 px-0 w-full z-10">
        <TopBar />
        <Header onNotificationsClick={onNotificationsClick} onClose={onClose} />
        <Navigation activeTab="discover" onTabChange={onTabChange ?? (() => {})} />
      </div>

      <PullToRefresh
        onRefresh={async () => { await refetch(); }}
        className="absolute top-[128px] left-0 right-0 bottom-0"
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

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomBar
          onSubmit={onChatSubmit}
          onChatHistoryClick={onChatHistoryClick}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={onResumeChat}
          onOpenChat={onOpenChat}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
