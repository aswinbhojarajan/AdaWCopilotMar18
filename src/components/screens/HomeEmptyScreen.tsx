import React from 'react';
import { Header, BottomBar, OnboardingCard } from '../ada';

interface HomeEmptyScreenProps {
  onChatHistoryClick?: () => void;
}

export function HomeEmptyScreen({ onChatHistoryClick }: HomeEmptyScreenProps = {}) {
  const handleGetStarted = () => {
    // Navigate to onboarding flow
  };

  return (
    <div className="bg-[#efede6] relative h-dvh w-full overflow-hidden">
      <div className="absolute bg-[#f7f6f2] left-0 top-0 w-full z-10 pt-safe">
        <div className="pb-[8px]">
          <Header />
        </div>
      </div>

      {/* Navigation - Directly attached to header */}
      <div className="absolute bg-[#f7f6f2] content-stretch flex gap-[32px] h-[48px] items-center left-0 px-[24px] py-0 top-[68px] w-full z-10">
        <div className="content-stretch flex flex-col items-start relative shrink-0">
          <p className="[text-underline-position:from-font] decoration-solid font-['DM_Sans',sans-serif] font-semibold h-[10px] leading-[1.3] not-italic relative shrink-0 text-[#441316] text-[0.625rem] text-center tracking-[1.2px] underline uppercase w-[39px]">
            HOME
          </p>
        </div>
        <p className="font-['DM_Sans',sans-serif] h-[10px] leading-[1.3] not-italic opacity-60 relative shrink-0 text-[#441316] text-[0.625rem] text-center tracking-[1.2px] uppercase w-[45px]">
          WEALTH
        </p>
        <p className="font-['DM_Sans',sans-serif] h-[10px] leading-[1.3] not-italic opacity-60 relative shrink-0 text-[#441316] text-[0.625rem] text-center tracking-[1.2px] uppercase w-[57px]">
          DISCOVER
        </p>
        <p className="font-['DM_Sans',sans-serif] h-[10px] leading-[1.3] not-italic opacity-60 relative shrink-0 text-[#441316] text-[0.625rem] text-center tracking-[1.2px] uppercase w-[46px]">
          COLLECTIVE
        </p>
        <p className="font-['DM_Sans',sans-serif] h-[10px] leading-[1.3] not-italic opacity-40 relative shrink-0 text-[#441316] text-[0.625rem] text-center tracking-[1.2px] uppercase w-[46px]">
          PROFILE
        </p>
      </div>

      {/* Content */}
      <div className="absolute content-stretch flex flex-col items-start left-0 px-[6px] py-0 top-[108px] w-full">
        <OnboardingCard
          title="WELCOME TO ADA"
          headline="Let's make Ada truly yours."
          description="A quick assessment helps Ada understand your financial preferences and tailor guidance to you."
          buttonText="Get started"
          timeEstimate="2–3 minutes"
          onButtonClick={handleGetStarted}
        />
      </div>

      {/* Fixed Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomBar onChatHistoryClick={onChatHistoryClick} />
      </div>
    </div>
  );
}
