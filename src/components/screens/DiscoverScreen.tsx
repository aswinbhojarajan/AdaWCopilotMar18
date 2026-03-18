import React, { useState } from 'react';
import { TopBar, Header, Navigation, BottomBar, Tag, ContentCard } from '../ada';
import { useApi } from '../../hooks/useApi';
import type { ScreenProps, DiscoverContentItem } from '../../types';

function DiscoverSkeleton() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex gap-[8px] items-start justify-center px-[24px] py-[16px] relative w-full">
            <div className="h-[32px] w-[80px] bg-gray-200 rounded-full animate-pulse" />
            <div className="h-[32px] w-[120px] bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-[30px] w-full p-6 animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-4" />
          <div className="h-[120px] bg-gray-200 rounded w-full" />
        </div>
      ))}
    </div>
  );
}

export function DiscoverScreen({
  onChatHistoryClick,
  onNotificationsClick,
  onChatSubmit,
  hasActiveChatToday,
  onResumeChat,
  onOpenChat,
  onClose,
}: ScreenProps = {}) {
  const [activeFilter, setActiveFilter] = useState<'forYou' | 'whatsHappening'>('forYou');

  const { data, loading, error } = useApi<DiscoverContentItem[]>(
    `/api/content/discover?tab=${activeFilter}`,
  );

  const displayedContent = data ?? [];

  return (
    <div className="bg-[#efede6] relative h-screen w-full">
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-0 pt-0 px-0 w-full z-10">
        <TopBar />
        <Header onNotificationsClick={onNotificationsClick} onClose={onClose} />
        <Navigation activeTab="discover" onTabChange={() => {}} />
      </div>

      <div className="absolute top-[128px] left-0 right-0 bottom-0 overflow-y-auto">
        {loading && !data ? (
          <DiscoverSkeleton />
        ) : error && !data ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <p className="text-[#992929] text-[14px] font-['DM_Sans:SemiBold',sans-serif] mb-2">
                Unable to load content
              </p>
              <p className="text-[#555555] text-[12px] font-['DM_Sans:Regular',sans-serif]">
                {error}
              </p>
            </div>
          </div>
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
      </div>

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
