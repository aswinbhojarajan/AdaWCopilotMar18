import React, { useState } from 'react';
import { TopBar, ChatHeader, SearchInput, ChatThread, Tag } from '../ada';
import { SkeletonList } from '../ada/Skeleton';
import { ErrorBanner } from '../ada/ErrorBanner';
import { useChatThreads } from '../../hooks/useChatThreads';

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

export function ChatHistoryScreen({ onBack, onThreadClick }: ChatHistoryScreenProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const { data: apiThreads, isLoading, isError, refetch } = useChatThreads();

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
  };

  return (
    <div className="bg-[#efede6] relative h-screen w-full overflow-hidden">
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-[16px] pt-0 px-0 w-full z-10">
        <TopBar />
        <ChatHeader onBack={handleBack} showNotifications={false} />
      </div>

      <div className="absolute top-[88px] left-0 right-0 bottom-0 overflow-y-auto">
        <div className="content-stretch flex flex-col items-center pb-[40px] pt-[12px] px-[6px] w-full">
          {isLoading ? (
            <div className="px-[6px]">
              <SkeletonList count={3} />
            </div>
          ) : isError ? (
            <ErrorBanner onRetry={() => refetch()} />
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
                  <p className="font-['DM_Sans',sans-serif] text-[#667085] text-[14px]">
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
