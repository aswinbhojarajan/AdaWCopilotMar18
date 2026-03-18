import React from 'react';
import {
  TopBar,
  Header,
  Navigation,
  BottomBar,
  SummaryCard,
  ContentCard,
  SimpleSparkline,
} from '../ada';
import { SparkIcon } from '../ada/SparkIcon';
import { SkeletonList } from '../ada/Skeleton';
import { ErrorBanner } from '../ada/ErrorBanner';
import { useHomeSummary } from '../../hooks/usePortfolio';
import type { ScreenProps } from '../../types';

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

export function HomeScreen({
  onChatHistoryClick,
  onNotificationsClick,
  onChatSubmit,
  hasActiveChatToday,
  onResumeChat,
  onOpenChat,
  onClose,
}: ScreenProps = {}) {
  const { data, isLoading, isError, refetch } = useHomeSummary();

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

    const changeSign = data.dailyChangeAmount >= 0 ? '+' : '';
    const changeText = `${changeSign}${formatCurrency(data.dailyChangeAmount)} (${changeSign}${data.dailyChangePercent}%) 1D`;

    return (
      <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
        <SummaryCard
          date="TODAY'S SUMMARY"
          title={data.date}
          subtitle={data.summary}
        />

        <div className="bg-white relative rounded-[30px] shrink-0 w-full">
          <div className="size-full">
            <div className="content-stretch flex flex-col items-start pb-[20px] pt-[20px] px-[24px] relative w-full">
              <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                  <p className="font-['DM_Sans:SemiBold',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.8px] uppercase">
                    PORTFOLIO OVERVIEW
                  </p>

                  <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                    <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-full">
                      No changes needed today, {data.greeting.split(', ')[1]}. Your portfolio remains on track.
                    </p>

                    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                      <p className="font-['DM_Sans:SemiBold',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[rgba(85,85,85,0.8)] text-[10px] tracking-[0.8px] uppercase">
                        Portfolio Value
                      </p>

                      <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
                        <p className="font-['Crimson_Pro:ExtraLight',sans-serif] font-extralight leading-[28px] relative shrink-0 text-[#555555] text-[40px] text-nowrap tracking-[-1.2px] whitespace-pre">
                          {formatCurrency(data.portfolioValue)}
                        </p>
                        <div className="bg-[#c6ff6a] content-stretch flex gap-[6px] h-[24px] items-center justify-center px-[8px] py-[10px] relative rounded-[50px] shrink-0">
                          <div className="relative shrink-0 size-[8px]">
                            <svg
                              className="block size-full"
                              fill="none"
                              preserveAspectRatio="none"
                              viewBox="0 0 8 8"
                            >
                              <path d="M4 0 L8 8 L0 8 Z" fill="#03561A" />
                            </svg>
                          </div>
                          <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#03561a] text-[12px] text-nowrap whitespace-pre">
                            {changeText}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                      <SimpleSparkline
                        data={data.sparklineData}
                        color="#992929"
                        fillGradient={{
                          startColor: 'rgba(153, 41, 41, 0.1)',
                          endColor: 'rgba(153, 41, 41, 0.01)',
                        }}
                        height={50}
                      />
                    </div>
                  </div>
                </div>

                <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full">
                  <button
                    onClick={() =>
                      onChatSubmit?.('Dive deeper into my portfolio performance', {
                        category: 'PORTFOLIO PERFORMANCE',
                        categoryType: 'PORTFOLIO OVERVIEW',
                        title: 'Portfolio up +2.44% ($2,210)',
                        sourceScreen: 'home',
                      })
                    }
                    className="bg-[#441316] content-stretch flex gap-[6px] h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0"
                  >
                    <div className="relative shrink-0 size-[24px] flex items-center justify-center">
                      <SparkIcon />
                    </div>
                    <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-white text-[12px] text-nowrap whitespace-pre">
                      Dive deeper
                    </p>
                  </button>
                  <button className="content-stretch flex h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0">
                    <div
                      aria-hidden="true"
                      className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]"
                    />
                    <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">
                      Contact advisor
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

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
        <Navigation activeTab="home" onTabChange={() => {}} />
      </div>

      <div className="absolute top-[128px] left-0 right-0 bottom-0 overflow-y-auto">
        {renderContent()}
      </div>

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
