import React, { useState } from 'react';
import { TopBar, Header, Navigation, BottomBar, Tag, ContentCard } from '../ada';
import { discoverContent } from '../../data/content';
import type { ScreenProps } from '../../types';

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

  const displayedContent = discoverContent[activeFilter];

  return (
    <div className="bg-[#efede6] relative h-screen w-full">
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-0 pt-0 px-0 w-full z-10">
        <TopBar />
        <Header onNotificationsClick={onNotificationsClick} onClose={onClose} />
        <Navigation activeTab="discover" onTabChange={() => {}} />
      </div>

      <div className="absolute top-[128px] left-0 right-0 bottom-0 overflow-y-auto">
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
              key={`${activeFilter}-${index}`}
              {...item}
              onChatSubmit={onChatSubmit}
              forceSecondaryButtonStyle={true}
            />
          ))}
        </div>
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
