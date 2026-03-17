import svgPaths from "./svg-6n4klv0x1u";

function Container() {
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

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container1 />
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
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">{`Explore adjusting this `}</p>
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

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <EventDetailsContainer />
      <ActionButtonsContainer />
    </div>
  );
}

export default function Container4() {
  return (
    <div className="bg-white relative rounded-[30px] size-full" data-name="Container">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative size-full">
          <Container3 />
        </div>
      </div>
    </div>
  );
}