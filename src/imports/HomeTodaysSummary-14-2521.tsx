import svgPaths from "./svg-apq4dq878q";
import imgFrame477131 from "figma:asset/a615194d8b92641e04d9e5c0b6754f315fcb7139.png";

function DateContainer() {
  return (
    <div className="content-stretch flex items-end justify-between not-italic relative shrink-0 w-full" data-name="Date Container">
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] h-[7px] justify-center leading-[0] relative shrink-0 text-[#555555] text-[9px] w-[75px]">
        <p className="leading-[18px]">Updated 6:00 AM</p>
      </div>
      <p className="font-['RL_Limo:Regular',sans-serif] h-[12px] leading-[18px] relative shrink-0 text-[#c0180c] text-[10px] text-center tracking-[0.2px] uppercase w-[138px]">Today’s SUMMARY</p>
      <p className="font-['DM_Sans:Regular',sans-serif] h-[17px] leading-[28px] relative shrink-0 text-[#555555] text-[9px] text-right w-[75px]">10th Dec 2025</p>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0 w-full" data-name="Container">
      <DateContainer />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 315 1">
            <line id="Line 14" stroke="var(--stroke-0, #555555)" strokeWidth="0.5" x2="315" y1="0.25" y2="0.25" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container />
    </div>
  );
}

function SummaryDescriptionContainer() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Summary Description Container">
      <div className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#555555] text-[18px] text-center tracking-[-0.36px] w-full">
        <p className="leading-[normal] mb-0">Ada’s personalised insights for you today.</p>
        <p className="leading-[normal]">
          <span>{`You have `}</span>
          <span className="text-[#c0180c]">4</span>
          <span>{` items to review.`}</span>
        </p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <SummaryDescriptionContainer />
    </div>
  );
}

function TotalBalance() {
  return (
    <div className="content-stretch flex flex-col items-start relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="Total Balance">
      <Container2 />
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          <TotalBalance />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <p className="font-['RL_Limo:Regular',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] tracking-[0.2px] uppercase w-[115px]">PORTFOLIO OVERVIEW</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container4 />
    </div>
  );
}

function PortfolioChangeContainer() {
  return (
    <div className="bg-[#c6ff6a] content-stretch flex gap-[6px] h-[24px] items-center justify-center px-[8px] py-[10px] relative rounded-[50px] shrink-0" data-name="Portfolio Change Container">
      <div className="relative shrink-0 size-[8px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <path d={svgPaths.pa98f300} fill="var(--fill-0, #03561A)" id="Vector" />
        </svg>
      </div>
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#03561a] text-[12px] text-nowrap whitespace-pre">$2,210.1 (+2.44%)</p>
    </div>
  );
}

function PortfolioValueDetails() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Portfolio Value Details">
      <p className="font-['Crimson_Pro:ExtraLight',sans-serif] font-extralight leading-[28px] relative shrink-0 text-[#555555] text-[40px] text-nowrap tracking-[-1.2px] whitespace-pre">$131,230.19</p>
      <PortfolioChangeContainer />
    </div>
  );
}

function PortfolioValueContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Portfolio Value Container">
      <p className="font-['RL_Limo:Regular',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#555555] text-[10px] tracking-[0.2px] uppercase w-[94px]">Portfolio Value</p>
      <PortfolioValueDetails />
    </div>
  );
}

function PortfolioStatsContainer() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Portfolio Stats Container">
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Yesterday: +0.8%</p>
      <div className="flex h-[16px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[270deg]">
          <div className="h-0 relative w-[16px]">
            <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 1">
                <line id="Line 69" stroke="var(--stroke-0, #441316)" strokeWidth="0.5" x2="16" y1="0.25" y2="0.25" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Last 7 days: +1.2%</p>
      <div className="flex h-[16px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[270deg]">
          <div className="h-0 relative w-[16px]">
            <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 1">
                <line id="Line 69" stroke="var(--stroke-0, #441316)" strokeWidth="0.5" x2="16" y1="0.25" y2="0.25" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Risk: On target</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="font-['Crimson_Pro:Light',sans-serif] font-['Crimson_Pro:Regular',sans-serif] font-light font-normal leading-[normal] relative shrink-0 text-[#555555] text-[0px] text-[24px] tracking-[-0.48px] w-full">
        <span>{`Abdullah, your `}</span>portfolio is on track today. Value is +0.8% since yesterday; risk remains within your agreed range.
      </p>
      <PortfolioValueContainer />
      <PortfolioStatsContainer />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Container5 />
      <Container6 />
    </div>
  );
}

function ActionButton() {
  return (
    <div className="bg-[#f7f6f2] content-stretch flex gap-[6px] h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0" data-name="Action Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <div className="relative shrink-0 size-[24px]" data-name="Purple Sparkle">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <path d={svgPaths.p19aa900} fill="url(#paint0_radial_14_2525)" id="Purple Sparkle" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(12 12) scale(12)" gradientUnits="userSpaceOnUse" id="paint0_radial_14_2525" r="1">
              <stop stopColor="#D9C6ED" />
              <stop offset="0.197115" stopColor="#C9AEE5" />
              <stop offset="0.725962" stopColor="#441316" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Dive deeper</p>
    </div>
  );
}

function ActionButton1() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0" data-name="Action Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Contact advisor</p>
    </div>
  );
}

function ActionButtonsContainer() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Action Buttons Container">
      <ActionButton />
      <ActionButton1 />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <ActionButtonsContainer />
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          <Container8 />
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="font-['RL_Limo:Regular',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] tracking-[0.2px] uppercase w-[87px]">Market Event</p>
      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] min-w-full relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-[min-content]">Fed rate-cut odds rise to 72%</p>
      <p className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] min-w-full relative shrink-0 text-[#555555] text-[14px] w-[min-content]" style={{ fontVariationSettings: "'opsz' 14" }}>
        Lower-rate expectations expand growth multiples.
      </p>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container10 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container11 />
    </div>
  );
}

function EventDetailsContainer() {
  return (
    <div className="content-stretch flex flex-col font-['DM_Sans:Light',sans-serif] font-light gap-[8px] items-start leading-[0] relative shrink-0 text-[#555555] text-[10px] w-full" data-name="Event Details Container">
      <div className="relative shrink-0 w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] mb-0 not-italic">Why you’re seeing this:</p>
        <ul className="list-disc">
          <li className="mb-0 ms-[15px]">
            <span className="leading-[normal]">Tech allocation: 48% (AAPL/MSFT/AMZN)</span>
          </li>
          <li className="ms-[15px]">
            <span className="leading-[normal]">Lower-rate expectations boost growth multiples</span>
          </li>
        </ul>
      </div>
      <div className="leading-[normal] relative shrink-0 w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="font-['DM_Sans:SemiBold',sans-serif] mb-0 not-italic">Recommended next step:</p>
        <p>Review whether your tech exposure still fits your long-term target.</p>
      </div>
    </div>
  );
}

function ActionButton2() {
  return (
    <div className="bg-[#f7f6f2] content-stretch flex gap-[6px] h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0" data-name="Action Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <div className="relative shrink-0 size-[24px]" data-name="Purple Sparkle">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <path d={svgPaths.p19aa900} fill="url(#paint0_radial_14_2525)" id="Purple Sparkle" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(12 12) scale(12)" gradientUnits="userSpaceOnUse" id="paint0_radial_14_2525" r="1">
              <stop stopColor="#D9C6ED" />
              <stop offset="0.197115" stopColor="#C9AEE5" />
              <stop offset="0.725962" stopColor="#441316" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">{`Explore adjusting this `}</p>
    </div>
  );
}

function ActionButton3() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0" data-name="Action Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Contact advisor</p>
    </div>
  );
}

function ActionButtonsContainer1() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Action Buttons Container">
      <ActionButton2 />
      <ActionButton3 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <EventDetailsContainer />
      <ActionButtonsContainer1 />
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          <Container13 />
        </div>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="font-['RL_Limo:Regular',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] tracking-[0.2px] uppercase w-[158px]">Portfolio Stability Alert</p>
      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] min-w-full relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-[min-content]">
        {`GCC bond inflows reach `}
        <br aria-hidden="true" />
        $4.2B this week
      </p>
      <p className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] min-w-full relative shrink-0 text-[#555555] text-[14px] w-[min-content]" style={{ fontVariationSettings: "'opsz' 14" }}>
        Income assets are seeing meaningful demand.
      </p>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container15 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container16 />
    </div>
  );
}

function AlertDetailsContainer() {
  return (
    <div className="content-stretch flex flex-col font-['DM_Sans:Light',sans-serif] font-light gap-[8px] items-start leading-[0] relative shrink-0 text-[#555555] text-[10px] w-full" data-name="Alert Details Container">
      <div className="relative shrink-0 w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] mb-0 not-italic">Why you’re seeing this:</p>
        <ul className="list-disc">
          <li className="mb-0 ms-[15px]">
            <span className="leading-[normal]">Income allocation: 8% (lower than typical stability range)</span>
          </li>
          <li className="mb-0 ms-[15px]">
            <span className="leading-[normal]">You’re capturing less of today’s high-yield environment</span>
          </li>
          <li className="ms-[15px]">
            <span className="leading-[normal]">Portfolio volatility: ~15% higher vs balanced benchmark</span>
          </li>
        </ul>
      </div>
      <div className="leading-[normal] relative shrink-0 w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="font-['DM_Sans:SemiBold',sans-serif] mb-0 not-italic">Recommended next step:</p>
        <p>Assess whether increasing fixed-income exposure suits your plan.</p>
      </div>
    </div>
  );
}

function ActionButton4() {
  return (
    <div className="bg-[#f7f6f2] content-stretch flex gap-[6px] h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0" data-name="Action Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <div className="relative shrink-0 size-[24px]" data-name="Purple Sparkle">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <path d={svgPaths.p19aa900} fill="url(#paint0_radial_14_2525)" id="Purple Sparkle" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(12 12) scale(12)" gradientUnits="userSpaceOnUse" id="paint0_radial_14_2525" r="1">
              <stop stopColor="#D9C6ED" />
              <stop offset="0.197115" stopColor="#C9AEE5" />
              <stop offset="0.725962" stopColor="#441316" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Review bond positioning</p>
    </div>
  );
}

function ActionButton5() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0" data-name="Action Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Contact advisor</p>
    </div>
  );
}

function ActionButtonsContainer2() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Action Buttons Container">
      <ActionButton4 />
      <ActionButton5 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <Container17 />
      <AlertDetailsContainer />
      <ActionButtonsContainer2 />
    </div>
  );
}

function Container19() {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          <Container18 />
        </div>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="font-['RL_Limo:Regular',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] tracking-[0.2px] uppercase w-[162px]">HEDGE OPPORTUNITY INSIGHT</p>
      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] min-w-full relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-[min-content]">Silver jumps above $32/oz amid global debt concerns</p>
      <p className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] min-w-full relative shrink-0 text-[#555555] text-[14px] w-[min-content]" style={{ fontVariationSettings: "'opsz' 14" }}>
        Hard assets are providing downside protection.
      </p>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container20 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container21 />
    </div>
  );
}

function InsightDetailsContainer() {
  return (
    <div className="content-stretch flex flex-col font-['DM_Sans:Light',sans-serif] font-light gap-[8px] items-start leading-[0] relative shrink-0 text-[#555555] text-[10px] w-full" data-name="Insight Details Container">
      <div className="relative shrink-0 w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] mb-0 not-italic">Why you’re seeing this:</p>
        <ul className="list-disc">
          <li className="mb-0 ms-[15px]">
            <span className="leading-[normal]">No commodity exposure → higher sensitivity to macro shocks</span>
          </li>
          <li className="ms-[15px]">
            <span className="leading-[normal]">Even a 2–3% exposure can materially reduce volatility</span>
          </li>
        </ul>
      </div>
      <div className="leading-[normal] relative shrink-0 w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="font-['DM_Sans:SemiBold',sans-serif] mb-0 not-italic">Recommended next step:</p>
        <p>Evaluate whether adding a commodity hedge aligns with your risk profile.</p>
      </div>
    </div>
  );
}

function ActionButton6() {
  return (
    <div className="bg-[#f7f6f2] content-stretch flex gap-[6px] h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0" data-name="Action Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <div className="relative shrink-0 size-[24px]" data-name="Purple Sparkle">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <path d={svgPaths.p19aa900} fill="url(#paint0_radial_14_2525)" id="Purple Sparkle" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(12 12) scale(12)" gradientUnits="userSpaceOnUse" id="paint0_radial_14_2525" r="1">
              <stop stopColor="#D9C6ED" />
              <stop offset="0.197115" stopColor="#C9AEE5" />
              <stop offset="0.725962" stopColor="#441316" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Review hedge options</p>
    </div>
  );
}

function ActionButton7() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0" data-name="Action Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Contact advisor</p>
    </div>
  );
}

function ActionButtonsContainer3() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Action Buttons Container">
      <ActionButton6 />
      <ActionButton7 />
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <Container22 />
      <InsightDetailsContainer />
      <ActionButtonsContainer3 />
    </div>
  );
}

function Container24() {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          <Container23 />
        </div>
      </div>
    </div>
  );
}

function SectionTitleContainer() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Section Title Container">
      <p className="font-['RL_Limo:Regular',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] tracking-[0.2px] uppercase w-[71px]">NEWS</p>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Container">
      <SectionTitleContainer />
      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-full">Markets jump on an unexpected year-end surge</p>
      <p className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[14px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        Your lower growth exposure means this upswing could likely produce a smaller gain.
      </p>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container25 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Container26 />
      <div className="h-[177.5px] relative shrink-0 w-[315px]" data-name="Frame 47713 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgFrame477131} />
      </div>
    </div>
  );
}

function ActionButton8() {
  return (
    <div className="bg-[#f7f6f2] content-stretch flex gap-[6px] h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0" data-name="Action Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <div className="relative shrink-0 size-[24px]" data-name="Purple Sparkle">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <path d={svgPaths.p19aa900} fill="url(#paint0_radial_14_2525)" id="Purple Sparkle" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(12 12) scale(12)" gradientUnits="userSpaceOnUse" id="paint0_radial_14_2525" r="1">
              <stop stopColor="#D9C6ED" />
              <stop offset="0.197115" stopColor="#C9AEE5" />
              <stop offset="0.725962" stopColor="#441316" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Dive deeper</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-center opacity-0 px-[14px] py-[10px] relative rounded-[50px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Contact advisor</p>
    </div>
  );
}

function ActionButtonsContainer4() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Action Buttons Container">
      <ActionButton8 />
      <Frame1 />
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <Container27 />
      <ActionButtonsContainer4 />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_3_1180)" id="Frame">
          <path d="M6 3V6L8 7" id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p3e7757b0} id="Vector_2" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_3_1180">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function TimestampContainer() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-end relative shrink-0 w-full" data-name="Timestamp Container">
      <Frame />
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[9px] text-nowrap text-right">
        <p className="leading-[18px] whitespace-pre">13 min ago</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <Container28 />
      <TimestampContainer />
    </div>
  );
}

function Container30() {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          <Container29 />
        </div>
      </div>
    </div>
  );
}

function SectionTitleContainer1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Section Title Container">
      <p className="font-['RL_Limo:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#c0180c] text-[10px] tracking-[0.2px] uppercase w-[100px]">PRODUCT RECOmMENDATION</p>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Container">
      <SectionTitleContainer1 />
      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[14px] tracking-[-0.28px] w-full">TO DESIGN</p>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container31 />
    </div>
  );
}

function ActionButton9() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0" data-name="Action Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Ask Ada</p>
    </div>
  );
}

function ActionButtonContainer() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Action Button Container">
      <ActionButton9 />
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <ActionButtonContainer />
    </div>
  );
}

function Balance() {
  return (
    <div className="basis-0 bg-white grow h-[192px] min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Balance">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start justify-between px-[24px] py-[12px] relative size-full">
          <Container32 />
          <Container33 />
        </div>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex gap-[5px] items-start relative shrink-0 w-full" data-name="Container">
      {[...Array(2).keys()].map((_, i) => (
        <Balance key={i} />
      ))}
    </div>
  );
}

function Container35() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[5px] items-start left-0 px-[6px] py-0 top-[133px] w-[375px]" data-name="Container">
      <Container3 />
      <Container9 />
      <Container14 />
      <Container19 />
      <Container24 />
      <Container30 />
      <Container34 />
    </div>
  );
}

function FilterOptionContainer() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Filter Option Container">
      <p className="[text-underline-position:from-font] decoration-solid font-['DM_Sans:SemiBold',sans-serif] h-[10px] leading-[1.3] not-italic relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] underline uppercase w-[39px]">HOME</p>
    </div>
  );
}

function Filter() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex gap-[32px] h-[40px] items-center left-0 px-[24px] py-0 top-[88px] w-[409px]" data-name="Filter">
      <FilterOptionContainer />
      <p className="font-['DM_Sans:Regular',sans-serif] h-[10px] leading-[1.3] not-italic opacity-60 relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[45px]">Wealth</p>
      <p className="font-['DM_Sans:Regular',sans-serif] h-[10px] leading-[1.3] not-italic opacity-60 relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[57px]">Discover</p>
      <p className="font-['DM_Sans:Regular',sans-serif] h-[10px] leading-[1.3] not-italic opacity-60 relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[46px]">Lounge</p>
    </div>
  );
}

function Battery() {
  return (
    <div className="absolute h-[11.333px] right-[14.67px] top-[17.33px] w-[24.328px]" data-name="Battery">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 12">
        <g id="Battery">
          <rect height="10.3333" id="Border" opacity="0.35" rx="2.16667" stroke="var(--stroke-0, #3A3A3A)" width="21" x="0.5" y="0.5" />
          <path d={svgPaths.p9ed9280} fill="var(--fill-0, #3A3A3A)" id="Cap" opacity="0.4" />
          <rect fill="var(--fill-0, #3A3A3A)" height="7.33333" id="Capacity" rx="1.33333" width="18" x="2" y="2" />
        </g>
      </svg>
    </div>
  );
}

function TimeStyle() {
  return (
    <div className="absolute h-[21px] left-[21px] top-[13px] w-[54px]" data-name="Time Style">
      <p className="absolute font-['SF_Pro_Text:Semibold',sans-serif] leading-[normal] left-[27px] not-italic text-[#192126] text-[#3a3a3a] text-[14px] text-center top-[calc(50%-7.5px)] tracking-[-0.28px] translate-x-[-50%] w-[54px]">9:41</p>
    </div>
  );
}

function TopBar() {
  return (
    <div className="h-[44px] relative shrink-0 w-[375px]" data-name="Top Bar">
      <Battery />
      <div className="absolute inset-[39.39%_11.74%_35.69%_84.18%]" data-name="Wifi">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
          <path d={svgPaths.p3d78f640} fill="var(--fill-0, #3A3A3A)" id="Wifi" />
        </svg>
      </div>
      <div className="absolute inset-[40.15%_17.16%_35.61%_78.31%]" data-name="Cellular Connection">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 11">
          <path d={svgPaths.p26d17600} fill="var(--fill-0, #3A3A3A)" id="Cellular Connection" />
        </svg>
      </div>
      <TimeStyle />
    </div>
  );
}

function ProfileContainer() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[191.5px]" data-name="Profile Container">
      <div className="flex flex-col font-['RL_Limo:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#441316] text-[35px] text-center w-[66px]">
        <p className="leading-[18px]">Ada</p>
      </div>
    </div>
  );
}

function NotificationContainer() {
  return (
    <div className="h-[20px] relative shrink-0 w-[64px]" data-name="Notification Container">
      <div className="absolute inset-[-2.5%_-0.78%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 65 21">
          <g id="Frame 47772">
            <g id="Group 37158">
              <path d={svgPaths.p19b3ea40} id="Vector" stroke="var(--stroke-0, #4C4C4C)" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8.27781 20.5H12.7223" id="Vector 4" stroke="var(--stroke-0, #4C4C4C)" strokeLinecap="round" />
            </g>
            <path d={svgPaths.p24739000} id="Vector_2" stroke="var(--stroke-0, #4C4C4C)" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function ProfileAndNotif() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Profile and Notif">
      <ProfileContainer />
      <NotificationContainer />
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start px-[24px] py-0 relative w-full">
          <ProfileAndNotif />
        </div>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 pb-[16px] pt-0 px-0 top-0" data-name="Container">
      <TopBar />
      <Container36 />
    </div>
  );
}

function Container38() {
  return (
    <div className="absolute h-[2125px] left-0 top-0 w-[375px]" data-name="Container">
      <Container35 />
      <Filter />
      <Container37 />
    </div>
  );
}

function IconContainer() {
  return (
    <div className="relative shrink-0 size-[44px]" data-name="Icon Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="Frame 47755">
          <rect fill="var(--fill-0, white)" height="44" rx="22" width="44" />
          <path d={svgPaths.p80d9900} fill="var(--fill-0, #555555)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function InputField() {
  return (
    <div className="basis-0 bg-white grow h-[44px] min-h-px min-w-px relative rounded-[23.321px] shrink-0" data-name="input field">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[20px] py-0 relative size-full">
          <p className="basis-0 font-['DM_Sans:Regular',sans-serif] grow leading-[20.522px] min-h-px min-w-px not-italic opacity-50 relative shrink-0 text-[13px] text-black">Ask anything</p>
          <div className="flex h-[18px] items-center justify-center relative shrink-0 w-[12px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
            <div className="flex-none rotate-[270deg]">
              <div className="h-[12px] relative w-[18px]" data-name="Vector">
                <div className="absolute inset-[-5%_-3.33%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 14">
                    <path d={svgPaths.p3344f200} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pb-0 pt-[12px] px-[16px] relative w-full">
          <IconContainer />
          <InputField />
        </div>
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="h-[34px] relative shrink-0 w-[375px]" data-name="Home Indicator">
      <div className="absolute bg-[#555555] bottom-[9px] h-[5px] left-[calc(50%+0.5px)] rounded-[100px] translate-x-[-50%] w-[134px]" />
    </div>
  );
}

function Container40() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container39 />
      <HomeIndicator />
    </div>
  );
}

function Container41() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col items-center left-1/2 translate-x-[-50%]" data-name="Container">
      <Container40 />
    </div>
  );
}

export default function HomeTodaysSummary() {
  return (
    <div className="bg-[#efede6] relative size-full" data-name="Home_Today\'s Summary">
      <Container38 />
      <Container41 />
    </div>
  );
}