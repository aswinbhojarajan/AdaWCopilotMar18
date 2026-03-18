import React, { useCallback } from 'react';
import {
  TopBar,
  Header,
  Navigation,
  BottomBar,
  ContentCard,
  PullToRefresh,
  MorningSentinelCard,
} from '../ada';
import { SkeletonList } from '../ada/Skeleton';
import { ErrorBanner } from '../ada/ErrorBanner';
import { useHomeSummary } from '../../hooks/usePortfolio';
import { useMorningSentinel } from '../../hooks/useMorningSentinel';
import type { ScreenProps } from '../../types';

export function HomeScreen({
  onChatHistoryClick,
  onNotificationsClick,
  onChatSubmit,
  hasActiveChatToday,
  onResumeChat,
  onOpenChat,
  onClose,
  onTabChange,
}: ScreenProps = {}) {
  const { data, isLoading, isError, refetch } = useHomeSummary();
  const sentinel = useMorningSentinel();

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetch(), sentinel.forceRefresh()]);
  }, [refetch, sentinel]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="px-[6px] pt-[5px] pb-[107px]">
          <SkeletonList count={5} />
        </div>
      );
    }

    if (isError || !data) {
      return <ErrorBanner onRetry={() => refetch()} />;
    }

    return (
      <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
        <MorningSentinelCard
          data={sentinel.data}
          isLoading={sentinel.isLoading}
          isError={sentinel.isError}
          onRetry={() => sentinel.refetch()}
          onChatSubmit={onChatSubmit}
        />

        {data.contentCards.map((card) => (
          <ContentCard
            key={card.id}
            category={card.category}
            categoryType={card.categoryType}
            title={card.title}
            description={card.description}
            timestamp={card.timestamp}
            buttonText={card.buttonText}
            secondaryButtonText={card.secondaryButtonText}
            image={card.image}
            sourcesCount={card.sourcesCount}
            topicLabelColor={card.topicLabelColor}
            onButtonClick={() =>
              onChatSubmit?.(card.buttonText, {
                category: card.category,
                categoryType: card.categoryType,
                title: card.title,
                sourceScreen: 'home',
              })
            }
            onSecondaryButtonClick={
              card.secondaryButtonText
                ? () =>
                    onChatSubmit?.(card.secondaryButtonText!, {
                      category: card.category,
                      categoryType: card.categoryType,
                      title: card.title,
                      sourceScreen: 'home',
                    })
                : undefined
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#efede6] relative h-screen w-full">
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-0 pt-0 px-0 w-full z-10">
        <TopBar />
        <Header onNotificationsClick={onNotificationsClick} onClose={onClose} />
        <Navigation activeTab="home" onTabChange={onTabChange ?? (() => {})} />
      </div>

      <PullToRefresh
        onRefresh={handleRefresh}
        className="absolute top-[128px] left-0 right-0 bottom-0"
      >
        {renderContent()}
      </PullToRefresh>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomBar
          onSubmit={onChatSubmit}
          onChatHistoryClick={onChatHistoryClick}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={onResumeChat}
          onOpenChat={onOpenChat}
        />
      </div>
    </div>
  );
}
