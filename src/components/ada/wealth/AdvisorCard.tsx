import React from 'react';
import { Mail, Phone, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import advisorPhotoDefault from 'figma:asset/c54e79017cfbcd431ed13642ec859ace3fc150c0.png';

interface AdvisorCardProps {
  advisorName?: string;
  advisorTitle?: string;
  advisorPhoto?: string;
  availabilityStatus?: string;
  yearsManaging?: number;
  onContactAdvisor?: () => void;
}

export function AdvisorCard({
  advisorName = 'Khalid Al Hammadi',
  advisorTitle = 'Senior Wealth Advisor, GCC',
  advisorPhoto = advisorPhotoDefault,
  availabilityStatus = 'Available today',
  yearsManaging = 5,
  onContactAdvisor
}: AdvisorCardProps) {
  const currentYear = new Date().getFullYear();
  const sinceYear = currentYear - yearsManaging;

  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
            {/* Header */}
            <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
              <p className="font-['DM_Sans:SemiBold',sans-serif] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.8px] uppercase">
                YOUR ADVISOR
              </p>
              <p className="font-['Crimson_Pro:Regular',sans-serif] relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-full">
                Expert guidance when you need it
              </p>
            </div>

            {/* Advisor Profile Section */}
            <div className="content-stretch flex items-start gap-[16px] relative shrink-0 w-full">
              {/* Advisor Photo */}
              <div className="relative shrink-0 size-[72px] rounded-full overflow-hidden bg-[#f7f6f2]">
                <ImageWithFallback 
                  src={advisorPhoto}
                  alt={advisorName}
                  className="size-full object-cover"
                />
              </div>

              {/* Advisor Info */}
              <div className="flex flex-col gap-[6px] flex-1">
                <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] not-italic text-[#555555] text-[16px]">
                  {advisorName}
                </p>
                <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic text-[#555555] text-[13px] opacity-60">
                  {advisorTitle}
                </p>
                
                {/* Availability Badge */}
                <div className="flex items-center gap-[6px] mt-[4px]">
                  <div className="size-[8px] rounded-full bg-[#c6ff6a]" />
                  <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic text-[#555555] text-[12px]">
                    {availabilityStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="content-stretch flex items-start gap-[16px] relative shrink-0 w-full pb-[16px] border-b border-[#e3e3e3]">
              <div className="flex flex-col gap-[4px] flex-1">
                <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic text-[#555555] text-[11px] opacity-60 uppercase tracking-[0.6px]">
                  Managing your wealth
                </p>
                <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] not-italic text-[#555555] text-[14px]">
                  Since {sinceYear}
                </p>
              </div>
              <div className="flex flex-col gap-[4px] flex-1">
                <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic text-[#555555] text-[11px] opacity-60 uppercase tracking-[0.6px]">
                  Response time
                </p>
                <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] not-italic text-[#555555] text-[14px]">
                  Within 24 hrs
                </p>
              </div>
            </div>

            {/* When to Contact Section */}
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] not-italic text-[#555555] text-[14px]">
                When to reach out
              </p>
              <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                <div className="flex items-start gap-[8px]">
                  <div className="size-[4px] rounded-full bg-[#992929] mt-[7px] shrink-0" />
                  <p className="font-['DM_Sans:Light',sans-serif] leading-[1.5] text-[#555555] text-[13px] tracking-[-0.26px] flex-1">
                    Complex portfolio changes or rebalancing decisions
                  </p>
                </div>
                <div className="flex items-start gap-[8px]">
                  <div className="size-[4px] rounded-full bg-[#992929] mt-[7px] shrink-0" />
                  <p className="font-['DM_Sans:Light',sans-serif] leading-[1.5] text-[#555555] text-[13px] tracking-[-0.26px] flex-1">
                    Tax planning and estate strategies
                  </p>
                </div>
                <div className="flex items-start gap-[8px]">
                  <div className="size-[4px] rounded-full bg-[#992929] mt-[7px] shrink-0" />
                  <p className="font-['DM_Sans:Light',sans-serif] leading-[1.5] text-[#555555] text-[13px] tracking-[-0.26px] flex-1">
                    Life changes affecting your financial goals
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full mt-[8px]">
              <button 
                onClick={onContactAdvisor}
                className="bg-[#441316] content-stretch flex gap-[6px] h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0 w-full"
              >
                <Mail className="size-[16px] text-white" strokeWidth={1.5} />
                <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-white text-[12px] text-nowrap whitespace-pre">
                  Contact {advisorName.split(' ')[0]}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}