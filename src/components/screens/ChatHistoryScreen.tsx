import React, { useState } from 'react';
import { TopBar, ChatHeader, SearchInput, ChatThread, Tag } from '../ada';
import { useApi } from '../../hooks/useApi';
import type { ChatThreadResponse } from '../../types';

type FilterType = 'all' | 'today' | 'last-week';

interface ChatHistoryScreenProps {
  onBack?: () => void;
  onThreadClick?: (threadId: string) => void;
}

function formatRelativeTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}w`;
}

function ChatHistorySkeleton() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-end relative w-full">
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex gap-[8px] items-start justify-center px-[24px] py-[16px] relative w-full">
            <div className="h-[32px] w-[60px] bg-gray-200 rounded-full animate-pulse" />
            <div className="h-[32px] w-[70px] bg-gray-200 rounded-full animate-pulse" />
            <div className="h-[32px] w-[90px] bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      <div className="w-full px-[8px]">
        <div className="h-[44px] bg-gray-200 rounded-[12px] w-full animate-pulse" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-[16px] w-full p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function ChatHistoryScreen({ onBack, onThreadClick }: ChatHistoryScreenProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const { data: apiThreads, loading, error } = useApi<ChatThreadResponse[]>('/api/chat/threads');

  const threads = (apiThreads ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    preview: t.preview,
    timestamp: formatRelativeTimestamp(t.updatedAt),
  }));

  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleThreadClick = (threadId: string) => {
    if (onThreadClick) {
      onThreadClick(threadId);
    }
  };

  const handleThreadMenu = (threadId: string) => {
    console.log('Thread menu:', threadId);
  };

  return (
    <div className="bg-[#efede6] relative h-screen w-full overflow-hidden">
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-[16px] pt-0 px-0 w-full z-10">
        <TopBar />
        <ChatHeader onBack={handleBack} showNotifications={false} />
      </div>

      <div className="absolute top-[88px] left-0 right-0 bottom-0 overflow-y-auto">
        <div className="content-stretch flex flex-col items-center pb-[40px] pt-[12px] px-[6px] w-full">
          {loading ? (
            <ChatHistorySkeleton />
          ) : error ? (
            <div className="flex items-center justify-center w-full py-[40px]">
              <div className="text-center">
                <p className="text-[#992929] text-[14px] font-['DM_Sans:SemiBold',sans-serif] mb-2">
                  Unable to load threads
                </p>
                <p className="text-[#555555] text-[12px] font-['DM_Sans:Regular',sans-serif]">
                  {error}
                </p>
              </div>
            </div>
          ) : (
            <div className="content-stretch flex flex-col gap-[8px] items-end relative w-full">
              <div className="relative shrink-0 w-full">
                <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex gap-[8px] items-start justify-center px-[24px] py-[16px] relative w-full">
                    <Tag active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
                      All
                    </Tag>
                    <Tag active={activeFilter === 'today'} onClick={() => setActiveFilter('today')}>
                      Today
                    </Tag>
                    <Tag
                      active={activeFilter === 'last-week'}
                      onClick={() => setActiveFilter('last-week')}
                    >
                      Last Week
                    </Tag>
                  </div>
                </div>
              </div>

              <SearchInput
                placeholder="Search Threads"
                value={searchQuery}
                onChange={setSearchQuery}
              />

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

              {filteredThreads.length === 0 && (
                <div className="w-full py-[40px] text-center">
                  <p className="font-['DM_Sans:Regular',sans-serif] text-[#667085] text-[14px]">
                    No threads found
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
