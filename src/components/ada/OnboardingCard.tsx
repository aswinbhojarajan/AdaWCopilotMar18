import React from 'react';
import { Clock } from 'lucide-react';
import svgPaths from '../../imports/svg-4rfis4h4ec';

interface OnboardingCardProps {
  title?: string;
  headline: string;
  description: string;
  buttonText?: string;
  timeEstimate?: string;
  onButtonClick?: () => void;
}

export function OnboardingCard({
  title = 'WELCOME TO ADA',
  headline,
  description,
  buttonText = 'Get started',
  timeEstimate = '2–3 minutes',
  onButtonClick,
}: OnboardingCardProps) {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[14px] items-center p-[24px] relative w-full">
          {/* Header with divider */}
          <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
              <p className="font-['DM_Sans:SemiBold',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[10px] text-center tracking-[0.8px] uppercase w-[138px]">
                {title}
              </p>
            </div>
            <div className="h-0 relative shrink-0 w-[128px]">
              <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 128 1"
                >
                  <line stroke="#555555" strokeWidth="0.5" x2="128" y1="0.25" y2="0.25" />
                </svg>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
            <p className="font-['Crimson_Pro:Light',sans-serif] font-light leading-[40px] relative shrink-0 text-[#555555] text-[42px] text-center tracking-[-0.84px] w-full">
              {headline}
            </p>
          </div>

          {/* Purple Sparkle */}
          <div className="overflow-clip relative shrink-0 size-[58px]">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 58 58"
            >
              <g>
                <path d={svgPaths.p3269c100} fill="url(#paint0_radial_onboarding)" />
              </g>
              <defs>
                <radialGradient
                  cx="0"
                  cy="0"
                  gradientTransform="translate(29 29) scale(29)"
                  gradientUnits="userSpaceOnUse"
                  id="paint0_radial_onboarding"
                  r="1"
                >
                  <stop stopColor="#D9C6ED" />
                  <stop offset="0.197115" stopColor="#C9AEE5" />
                  <stop offset="0.725962" stopColor="#441316" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Description */}
          <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[14px] text-center tracking-[-0.28px] w-[239px]">
            {description}
          </p>

          {/* Button and Time Estimate */}
          <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full">
            <button
              onClick={onButtonClick}
              className="bg-[#f7f6f2] content-stretch flex h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0"
            >
              <div
                aria-hidden="true"
                className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]"
              />
              <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">
                {buttonText}
              </p>
            </button>

            <div className="content-stretch flex gap-[6px] items-center justify-center opacity-70 relative shrink-0">
              <Clock className="size-[7px] text-[#555555]" strokeWidth={0.5} />
              <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[9px] text-nowrap">
                <p className="leading-[18px] whitespace-pre">{timeEstimate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
