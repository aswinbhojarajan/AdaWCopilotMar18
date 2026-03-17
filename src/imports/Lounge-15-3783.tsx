import svgPaths from "./svg-njo1xhaulo";

function Frame2() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center px-[8px] py-[10px] relative rounded-[50px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#441316] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#441316] text-[12px] text-nowrap whitespace-pre">Weekly Highlights</p>
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center opacity-50 px-[8px] py-[10px] relative rounded-[50px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#441316] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#441316] text-[12px] text-nowrap whitespace-pre">Trends</p>
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center opacity-50 px-[8px] py-[10px] relative rounded-[50px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#441316] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#441316] text-[12px] text-nowrap whitespace-pre">Benchmarks</p>
    </div>
  );
}

function Frame32() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-start justify-center px-[24px] py-[16px] relative w-full">
          <Frame2 />
          <Frame28 />
          <Frame29 />
        </div>
      </div>
    </div>
  );
}

function DateContainer() {
  return (
    <div className="content-stretch flex items-end justify-between not-italic relative shrink-0 w-full" data-name="Date Container">
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] h-[7px] justify-center leading-[0] relative shrink-0 text-[#555555] text-[9px] w-[75px]">
        <p className="leading-[18px]">Updated 6:00 AM</p>
      </div>
      <p className="font-['RL_Limo:Regular',sans-serif] h-[12px] leading-[18px] relative shrink-0 text-[#c0180c] text-[10px] text-center tracking-[0.2px] uppercase w-[138px]">WEEKLY INSIGHTS</p>
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
      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[18px] text-center tracking-[-0.36px] w-full">
        {`What investors like you `}
        <br aria-hidden="true" />
        are focusing on this week.
      </p>
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

function Frame23() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center opacity-70 relative shrink-0">
      <div className="relative shrink-0 size-[7px]" data-name="Vector">
        <div className="absolute inset-[-3.57%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <path d={svgPaths.p22baaf00} id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[9px] text-nowrap">
        <p className="leading-[18px] whitespace-pre">Insights refreshing in 4 days.</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center justify-end size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-center justify-end px-[24px] py-[16px] relative w-full">
          <TotalBalance />
          <Frame23 />
        </div>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="h-[12px] relative shrink-0 w-[13.332px]">
      <div className="absolute inset-[-2.08%_-1.88%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 13">
          <g id="Group 37160">
            <path d={svgPaths.p2e002350} id="Vector" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p29349800} id="Vector_2" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p1795e100} id="Vector_3" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p39c32380} id="Vector_4" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
      <Group />
      <p className="font-['RL_Limo:Regular',sans-serif] h-[14px] leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] tracking-[0.2px] uppercase w-[105px]">Investors like you</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
      <Frame18 />
      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] tracking-[-0.48px] w-full">Types of investors</p>
      <p className="font-['DM_Sans:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[#555555] text-[12px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        2751 members benchmarked
      </p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame6 />
    </div>
  );
}

function Frame20() {
  return (
    <div className="bg-[#441316] h-[184px] overflow-clip relative rounded-[8px] shrink-0 w-full">
      <div className="absolute bg-[#d9c6ed] h-[184px] left-0 top-0 w-[143px]" />
      <div className="absolute flex h-[77px] items-center justify-center left-[144px] top-0 w-[183px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[270deg]">
          <div className="bg-[#d9c6ed] h-[183px] w-[77px]" />
        </div>
      </div>
      <div className="absolute flex h-[32px] items-center justify-center left-[144px] top-[152px] w-[183px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[270deg]">
          <div className="bg-[#d9c6ed] h-[183px] w-[32px]" />
        </div>
      </div>
      <div className="absolute flex h-[73px] items-center justify-center left-[144px] top-[78px] w-[183px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[270deg]">
          <div className="bg-[#d9c6ed] h-[183px] w-[73px]" />
        </div>
      </div>
      <p className="absolute font-['DM_Sans:Regular',sans-serif] h-[12px] leading-[normal] left-[154px] not-italic text-[#555555] text-[12px] top-[55px] w-[142px]">New Investment Ventures</p>
      <p className="absolute font-['DM_Sans:Regular',sans-serif] h-[12px] leading-[normal] left-[10px] not-italic text-[#555555] text-[12px] top-[162px] w-[89px]">Retirement nest</p>
      <p className="absolute font-['DM_Sans:Regular',sans-serif] h-[12px] leading-[normal] left-[179px] not-italic text-[#555555] text-[12px] top-[162px] w-[71px]">Career Move</p>
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[normal] left-[154px] not-italic text-[#555555] text-[12px] text-nowrap top-[129px] whitespace-pre">Home Ownership</p>
      <p className="absolute font-['Spalla:Regular',sans-serif] leading-[28px] left-[10px] not-italic text-[#555555] text-[40px] text-nowrap top-[13px] whitespace-pre">74%</p>
      <div className="absolute flex flex-col font-['Spalla:Regular',sans-serif] h-[11px] justify-center leading-[0] left-[154px] not-italic text-[#555555] text-[16px] top-[168.5px] translate-y-[-50%] w-[25px]">
        <p className="leading-[28px]">4%</p>
      </div>
      <div className="absolute flex flex-col font-['Spalla:Regular',sans-serif] justify-center leading-[0] left-[154px] not-italic text-[#555555] text-[20px] text-nowrap top-[96px] translate-y-[-50%]">
        <p className="leading-[28px] whitespace-pre">9%</p>
      </div>
      <div className="absolute flex flex-col font-['Spalla:Regular',sans-serif] justify-center leading-[0] left-[154px] not-italic text-[#555555] text-[20px] text-nowrap top-[19px] translate-y-[-50%]">
        <p className="leading-[28px] whitespace-pre">13%</p>
      </div>
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Frame8 />
      <Frame20 />
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame16 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Ask Ada</p>
    </div>
  );
}

function Frame34() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame />
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center opacity-70 relative shrink-0">
      <div className="relative shrink-0 size-[7px]" data-name="Vector">
        <div className="absolute inset-[-3.57%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <path d={svgPaths.p22baaf00} id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[9px] text-nowrap">
        <p className="leading-[18px] whitespace-pre">4 days remaining</p>
      </div>
    </div>
  );
}

function Frame35() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <Frame34 />
      <Frame25 />
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <Frame17 />
      <Frame35 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          <Frame14 />
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
      <p className="font-['RL_Limo:Regular',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] text-center tracking-[0.2px] uppercase w-[138px]">INSIGHT | PEER SNAPSHOT</p>
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0 w-full">
      <Frame3 />
      <div className="h-0 relative shrink-0 w-[162px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 162 1">
            <line id="Line 14" stroke="var(--stroke-0, #555555)" strokeWidth="0.5" x2="162" y1="0.25" y2="0.25" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame38() {
  return (
    <div className="relative shrink-0 size-[42px]">
      <div className="absolute inset-[-0.6%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 43 43">
          <g id="Frame 47795">
            <path d={svgPaths.p22a3bc80} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full">
      <Frame21 />
      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] text-center tracking-[-0.48px] w-[277px]">You allocate more to long-term growth assets than 62% of investors with similar AUM.</p>
      <Frame38 />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[14px] text-center tracking-[-0.28px] w-[273px]">Your peers lean slightly more conservative while you lean more ambitious.</p>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame10 />
    </div>
  );
}

function TotalBalance1() {
  return (
    <div className="bg-white relative rounded-tl-[32px] rounded-tr-[32px] shrink-0 w-full" data-name="Total Balance">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start px-[16px] py-[24px] relative w-full">
          <Frame15 />
        </div>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center opacity-70 relative shrink-0">
      <div className="relative shrink-0 size-[7px]" data-name="Vector">
        <div className="absolute inset-[-3.57%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <path d={svgPaths.p22baaf00} id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[9px] text-nowrap">
        <p className="leading-[18px] whitespace-pre">13h:31m:47s</p>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame24 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-white h-[40px] relative rounded-bl-[32px] rounded-br-[32px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.5px_0px_0px] border-solid inset-0 pointer-events-none rounded-bl-[32px] rounded-br-[32px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[16px] py-[8px] relative size-full">
          <Frame5 />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <TotalBalance1 />
      <Frame4 />
    </div>
  );
}

function Group1() {
  return (
    <div className="h-[11px] relative shrink-0 w-[10.5px]">
      <div className="absolute inset-[-2.27%_-2.38%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 12">
          <g id="Group 37161">
            <path d={svgPaths.p1b2c5400} id="Vector" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p221c91f0} id="Vector_2" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p1b95d9c0} id="Vector_3" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p1c82280} id="Vector_4" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p1177c9b0} id="Vector_5" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p3e240e00} id="Vector_6" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function SectionTitleContainer() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Section Title Container">
      <Group1 />
      <p className="font-['RL_Limo:Regular',sans-serif] h-full leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] tracking-[0.2px] uppercase w-[36px]">TREND</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Container">
      <SectionTitleContainer />
      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[14px] tracking-[-0.28px] w-full">
        {`Investors are showing increased interest in global equity funds `}
        <br aria-hidden="true" />
        this week.
      </p>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container5 />
    </div>
  );
}

function ActionButton() {
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
      <ActionButton />
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center opacity-70 relative shrink-0">
      <div className="relative shrink-0 size-[7px]" data-name="Vector">
        <div className="absolute inset-[-3.57%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <path d={svgPaths.p22baaf00} id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[9px] text-nowrap">
        <p className="leading-[18px] whitespace-pre">4 days remaining</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <ActionButtonContainer />
      <Frame27 />
    </div>
  );
}

function Balance() {
  return (
    <div className="basis-0 bg-white grow h-[192px] min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Balance">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start justify-between px-[24px] py-[12px] relative size-full">
          <Container6 />
          <Container7 />
        </div>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="h-[11px] relative shrink-0 w-[10.5px]">
      <div className="absolute inset-[-2.27%_-2.38%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 12">
          <g id="Group 37161">
            <path d={svgPaths.p1b2c5400} id="Vector" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p221c91f0} id="Vector_2" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p1b95d9c0} id="Vector_3" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p1c82280} id="Vector_4" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p1177c9b0} id="Vector_5" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p3e240e00} id="Vector_6" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function SectionTitleContainer1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Section Title Container">
      <Group3 />
      <p className="font-['RL_Limo:Regular',sans-serif] h-full leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] tracking-[0.2px] uppercase w-[113px]">TREND</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Container">
      <SectionTitleContainer1 />
      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[14px] tracking-[-0.28px] w-full">Searches for technology-themed ETFs rose by 18% this week.</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container8 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Ask Ada</p>
    </div>
  );
}

function Frame37() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame1 />
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center opacity-70 relative shrink-0">
      <div className="relative shrink-0 size-[7px]" data-name="Vector">
        <div className="absolute inset-[-3.57%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <path d={svgPaths.p22baaf00} id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[9px] text-nowrap">
        <p className="leading-[18px] whitespace-pre">4 days remaining</p>
      </div>
    </div>
  );
}

function Frame36() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <Frame37 />
      <Frame30 />
    </div>
  );
}

function Balance1() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[16px] self-stretch shrink-0" data-name="Balance">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start justify-between px-[24px] py-[12px] relative size-full">
          <Container9 />
          <Frame36 />
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex gap-[5px] items-start relative shrink-0 w-full" data-name="Container">
      <Balance />
      <Balance1 />
    </div>
  );
}

function Group2() {
  return (
    <div className="h-[10px] relative shrink-0 w-[14.286px]">
      <div className="absolute inset-[-2.5%_-1.75%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 11">
          <g id="Group 37162">
            <path d={svgPaths.p30ec6820} id="Vector" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d={svgPaths.p29c2a72} id="Vector_2" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
            <path d="M14.5357 10.25H0.25" id="Vector_3" stroke="var(--stroke-0, #C0180C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex gap-[12px] items-end relative shrink-0 w-full">
      <Group2 />
      <div className="flex flex-col font-['RL_Limo:Regular',sans-serif] h-[11px] justify-center leading-[0] not-italic relative shrink-0 text-[#c0180c] text-[10px] tracking-[0.2px] uppercase w-[113px]">
        <p className="leading-[18px]">POLL OF THE WEEK</p>
      </div>
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0 w-full">
      <Frame19 />
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

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start leading-[normal] relative shrink-0 text-[#555555] w-full">
      <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal min-w-full relative shrink-0 text-[24px] tracking-[-0.48px] w-[min-content]">Which region do you feel most confident investing in?</p>
      <p className="font-['DM_Sans:Light',sans-serif] font-light relative shrink-0 text-[12px] w-[225px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        Vote to reveal where investor sentiment is strongest across the community.
      </p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame7 />
    </div>
  );
}

function Frame31() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center opacity-70 relative shrink-0">
      <div className="relative shrink-0 size-[7px]" data-name="Vector">
        <div className="absolute inset-[-3.57%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
            <path d={svgPaths.p22baaf00} id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[9px] text-nowrap">
        <p className="leading-[18px] whitespace-pre">4 days remaining</p>
      </div>
    </div>
  );
}

function Frame33() {
  return (
    <div className="relative shrink-0 size-[38px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38 38">
        <g id="Frame 47776">
          <rect height="37.5" rx="18.75" stroke="var(--stroke-0, #555555)" strokeWidth="0.5" width="37.5" x="0.25" y="0.25" />
          <path d={svgPaths.p1ebbfac0} id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
      <Frame31 />
      <Frame33 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-end justify-end relative shrink-0 w-full">
      <Frame22 />
      <Frame11 />
      <Frame26 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="bg-white relative rounded-[24px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          <Frame12 />
        </div>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[5px] items-start left-0 px-[6px] py-0 top-[128px] w-[375px]" data-name="Container">
      <Frame32 />
      <Container3 />
      <Frame13 />
      <Container4 />
      <Container10 />
      <Frame9 />
    </div>
  );
}

function FilterOptionContainer() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Filter Option Container">
      <p className="font-['DM_Sans:Regular',sans-serif] h-[10px] leading-[1.3] not-italic opacity-60 relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[39px]">HOME</p>
    </div>
  );
}

function Filter() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex gap-[32px] h-[40px] items-center left-0 px-[24px] py-0 top-[88px] w-[409px]" data-name="Filter">
      <FilterOptionContainer />
      <p className="font-['DM_Sans:Regular',sans-serif] h-[10px] leading-[1.3] not-italic opacity-60 relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[45px]">Wealth</p>
      <p className="font-['DM_Sans:Regular',sans-serif] h-[10px] leading-[1.3] not-italic opacity-60 relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[57px]">Discover</p>
      <p className="[text-underline-position:from-font] decoration-solid font-['DM_Sans:SemiBold',sans-serif] h-[10px] leading-[1.3] not-italic relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] underline uppercase w-[47px]">Lounge</p>
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

function Container12() {
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

function Container13() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 pb-[16px] pt-0 px-0 top-0" data-name="Container">
      <TopBar />
      <Container12 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[1493px] left-0 top-0 w-[375px]" data-name="Container">
      <Container11 />
      <Filter />
      <Container13 />
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

function Container15() {
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

function Container16() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container15 />
      <HomeIndicator />
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col items-center left-1/2 translate-x-[-50%]" data-name="Container">
      <Container16 />
    </div>
  );
}

export default function Lounge() {
  return (
    <div className="bg-[#efede6] relative size-full" data-name="Lounge">
      <Container14 />
      <Container17 />
    </div>
  );
}