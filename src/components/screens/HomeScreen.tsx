import React, { useCallback } from 'react';
import {
  ContentCard,
  PullToRefresh,
  MorningSentinelCard,
} from '../ada';
import { SkeletonList } from '../ada/Skeleton';
import { ErrorBanner } from '../ada/ErrorBanner';
import { useHomeSummary } from '../../hooks/usePortfolio';
import { useMorningSentinel } from '../../hooks/useMorningSentinel';

interface HomeScreenProps {
  onChatSubmit?: (message: string, context?: { category: string; categoryType: string; title: string; sourceScreen?: string }) => void;
}

export function HomeScreen({
  onChatSubmit,
}: HomeScreenProps) {
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
          isStreaming={sentinel.isStreaming}
          streamingMetrics={sentinel.streamingMetrics}
          streamingText={sentinel.streamingText}
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
    <PullToRefresh
      onRefresh={handleRefresh}
      className="h-full"
    >
      {renderContent()}
    </PullToRefresh>
  );
}
