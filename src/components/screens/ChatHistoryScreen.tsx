import React, { useState } from 'react';
import { TopBar, ChatHeader, SearchInput, ChatThread, Tag } from '../ada';

interface Thread {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
}

type FilterType = 'all' | 'today' | 'last-week';

interface ChatHistoryScreenProps {
  onBack?: () => void;
  onThreadClick?: (threadId: string) => void;
}

export function ChatHistoryScreen({ onBack, onThreadClick }: ChatHistoryScreenProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  const threads: Thread[] = [
    {
      id: '1',
      title: 'Portfolio rebalancing and asset allocation',
      preview: 'If you want, I can estimate the new risk/return profile for you.',
      timestamp: '52m'
    },
    {
      id: '2',
      title: 'Portfolio concentration and risk management',
      preview: 'Your tech exposure is 48%, compared to your target range of 30–40%. Would you...',
      timestamp: '2d'
    },
    {
      id: '3',
      title: 'Portfolio diversification and hedging against macroeconomic risks',
      preview: 'Silver jumps above $32/oz amid global debt concerns. With 0% commodity exposure...',
      timestamp: '3d'
    }
  ];

  const filteredThreads = threads.filter(thread => 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      console.log('Back to home');
    }
  };

  const handleThreadClick = (threadId: string) => {
    if (onThreadClick) {
      onThreadClick(threadId);
    } else {
      console.log('Opening thread:', threadId);
    }
  };

  const handleThreadMenu = (threadId: string) => {
    console.log('Thread menu:', threadId);
  };

  return (
    <div className="bg-[#efede6] relative h-screen w-full overflow-hidden">
      {/* Fixed Header */}
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-[16px] pt-0 px-0 w-full z-10">
        <TopBar />
        <ChatHeader onBack={handleBack} showNotifications={false} />
      </div>

      {/* Scrollable Content */}
      <div className="absolute top-[88px] left-0 right-0 bottom-0 overflow-y-auto">
        <div className="content-stretch flex flex-col items-center pb-[40px] pt-[12px] px-[6px] w-full">
          <div className="content-stretch flex flex-col gap-[8px] items-end relative w-full">
            {/* Filter Tags */}
            <div className="relative shrink-0 w-full">
              <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex gap-[8px] items-start justify-center px-[24px] py-[16px] relative w-full">
                  <Tag active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
                    All
                  </Tag>
                  <Tag active={activeFilter === 'today'} onClick={() => setActiveFilter('today')}>
                    Today
                  </Tag>
                  <Tag active={activeFilter === 'last-week'} onClick={() => setActiveFilter('last-week')}>
                    Last Week
                  </Tag>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <SearchInput
              placeholder="Search Threads"
              value={searchQuery}
              onChange={setSearchQuery}
            />

            {/* Thread List */}
            {filteredThreads.map((thread) => (
              <ChatThread
                key={thread.id}
                title={thread.title}
                preview={thread.preview}
                timestamp={thread.timestamp}
                onClick={() => handleThreadClick(thread.id)}
                onMenuClick={() => handleThreadMenu(thread.id)}
              />
            ))}

            {/* No Results */}
            {filteredThreads.length === 0 && (
              <div className="w-full py-[40px] text-center">
                <p className="font-['DM_Sans:Regular',sans-serif] text-[#667085] text-[14px]">
                  No threads found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}