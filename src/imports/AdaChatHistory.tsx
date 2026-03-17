import svgPaths from "./svg-qmkn27wu2g";

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

function Frame16() {
  return (
    <div className="h-[20px] relative shrink-0 w-[64px]">
      <div className="absolute bottom-[-2.5%] left-[-0.78%] right-0 top-[-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 65 21">
          <g id="Frame 47798">
            <path d="M10.5 20.5L0.5 10.5L10.5 0.5" id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame15() {
  return (
    <div className="h-[20px] relative shrink-0 w-[64px]">
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
      <Frame16 />
      <div className="flex flex-col font-['RL_Limo:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#441316] text-[35px] text-center w-[66px]">
        <p className="leading-[18px]">Ada</p>
      </div>
      <Frame15 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start px-[24px] py-0 relative w-full">
          <ProfileAndNotif />
        </div>
      </div>
    </div>
  );
}

function Frame11() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 pb-[16px] pt-0 px-0 top-0">
      <TopBar />
      <Frame13 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="absolute h-[1523px] left-0 top-0 w-[375px]">
      <Frame11 />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <g id="Frame">
          <path d={svgPaths.p316b9d00} id="Vector" stroke="var(--stroke-0, #CACACA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
          <path d={svgPaths.p220e9c00} id="Vector_2" stroke="var(--stroke-0, #CACACA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}

function Search() {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full" data-name="Search">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[22px] py-[8px] relative w-full">
          <Frame />
          <div className="flex flex-col font-['DM_Sans:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#cacaca] text-[14px] text-nowrap tracking-[-0.28px]">
            <p className="leading-[normal] whitespace-pre">Search Threads</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[30px]" />
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1556)" id="Frame">
          <path d="M6 3V6L8 7" id="Vector" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
          <path d={svgPaths.p3e7757b0} id="Vector_2" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        </g>
        <defs>
          <clipPath id="clip0_4_1556">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame17() {
  return (
    <div className="basis-0 content-stretch flex gap-[5px] grow items-center min-h-px min-w-px relative shrink-0 w-full">
      <Frame1 />
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#667085] text-[10px] text-nowrap tracking-[-0.2px]">
        <p className="leading-[normal] whitespace-pre">52m</p>
      </div>
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-[296px]">
      <div className="basis-0 flex flex-col font-['DM_Sans:SemiBold',sans-serif] grow justify-center leading-[0] min-h-px min-w-full not-italic relative shrink-0 text-[#667085] text-[14px] tracking-[-0.28px] w-[min-content]">
        <p className="leading-[normal]">Portfolio rebalancing and asset allocation</p>
      </div>
      <div className="basis-0 flex flex-col font-['DM_Sans:Light',sans-serif] font-light grow justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[#667085] text-[14px] tracking-[-0.28px] w-[274px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="leading-[normal]">If you want, I can estimate the new risk/return profile for you.</p>
      </div>
      <Frame17 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0 size-[17px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
        <g id="Frame">
          <path d={svgPaths.p21c6de00} fill="var(--fill-0, #667085)" id="Vector" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3ebb5800} fill="var(--fill-0, #667085)" id="Vector_2" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p199c7d00} fill="var(--fill-0, #667085)" id="Vector_3" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame8() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[20px] shrink-0">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[10px] items-start justify-center px-[22px] py-[14px] relative w-full">
          <Frame18 />
          <Frame2 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function Ada() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Ada">
      <Frame8 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1556)" id="Frame">
          <path d="M6 3V6L8 7" id="Vector" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
          <path d={svgPaths.p3e7757b0} id="Vector_2" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        </g>
        <defs>
          <clipPath id="clip0_4_1556">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame19() {
  return (
    <div className="basis-0 content-stretch flex gap-[5px] grow items-center min-h-px min-w-px relative shrink-0 w-full">
      <Frame3 />
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#667085] text-[10px] text-nowrap tracking-[-0.2px]">
        <p className="leading-[normal] whitespace-pre">2d</p>
      </div>
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-[296px]">
      <div className="basis-0 flex flex-col font-['DM_Sans:SemiBold',sans-serif] grow justify-center leading-[0] min-h-px min-w-full not-italic relative shrink-0 text-[#667085] text-[14px] tracking-[-0.28px] w-[min-content]">
        <p className="leading-[normal]">Portfolio concentration and risk management</p>
      </div>
      <div className="basis-0 flex flex-col font-['DM_Sans:Light',sans-serif] font-light grow justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[#667085] text-[14px] tracking-[-0.28px] w-[274px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="leading-[normal]">Your tech exposure is 48%, compared to your target range of 30–40%. Would you...</p>
      </div>
      <Frame19 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="relative shrink-0 size-[17px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
        <g id="Frame">
          <path d={svgPaths.p21c6de00} fill="var(--fill-0, #667085)" id="Vector" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3ebb5800} fill="var(--fill-0, #667085)" id="Vector_2" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p199c7d00} fill="var(--fill-0, #667085)" id="Vector_3" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame9() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[20px] shrink-0">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[10px] items-start justify-center px-[22px] py-[14px] relative w-full">
          <Frame20 />
          <Frame4 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function Ada1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Ada">
      <Frame9 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1556)" id="Frame">
          <path d="M6 3V6L8 7" id="Vector" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
          <path d={svgPaths.p3e7757b0} id="Vector_2" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        </g>
        <defs>
          <clipPath id="clip0_4_1556">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full">
      <Frame5 />
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#667085] text-[10px] text-nowrap tracking-[-0.2px]">
        <p className="leading-[normal] whitespace-pre">3d</p>
      </div>
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[296px]">
      <div className="basis-0 flex flex-col font-['DM_Sans:SemiBold',sans-serif] grow justify-center leading-[0] min-h-px min-w-full not-italic relative shrink-0 text-[#667085] text-[14px] tracking-[-0.28px] w-[min-content]">
        <p className="leading-[normal]">Portfolio diversification and hedging against macroeconomic risks</p>
      </div>
      <div className="basis-0 flex flex-col font-['DM_Sans:Light',sans-serif] font-light grow justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[#667085] text-[14px] tracking-[-0.28px] w-[274px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="leading-[normal]">
          S
          <span className="font-['DM_Sans:Light',sans-serif] font-light" style={{ fontVariationSettings: "'opsz' 14" }}>
            ilver jumps above $32/oz amid global debt concerns
          </span>
          <span>{`. `}</span>
          <span className="font-['DM_Sans:Light',sans-serif] font-light" style={{ fontVariationSettings: "'opsz' 14" }}>
            With 0% commodity exposure
          </span>
          ...
        </p>
      </div>
      <Frame21 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="relative shrink-0 size-[17px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
        <g id="Frame">
          <path d={svgPaths.p21c6de00} fill="var(--fill-0, #667085)" id="Vector" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3ebb5800} fill="var(--fill-0, #667085)" id="Vector_2" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p199c7d00} fill="var(--fill-0, #667085)" id="Vector_3" stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame10() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[20px] shrink-0">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[10px] items-start justify-center px-[22px] py-[14px] relative w-full">
          <Frame22 />
          <Frame6 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function Ada2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Ada">
      <Frame10 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="[grid-area:1_/_1] content-stretch flex flex-col gap-[8px] items-end ml-0 mt-0 relative w-[363px]">
      <Search />
      <Ada />
      <Ada1 />
      <Ada2 />
    </div>
  );
}

function Group() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative">
      <Frame7 />
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
      <Group />
    </div>
  );
}

function Frame14() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 pb-0 pt-[12px] px-[6px] top-[96px] w-[375px]">
      <Group1 />
    </div>
  );
}

export default function AdaChatHistory() {
  return (
    <div className="bg-[#efede6] relative size-full" data-name="Ada Chat - History">
      <Frame12 />
      <Frame14 />
    </div>
  );
}