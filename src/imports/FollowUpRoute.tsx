import svgPaths from "./svg-8tlp24sanx";

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

function Frame15() {
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

function Frame13() {
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
      <Frame15 />
      <div className="flex flex-col font-['RL_Limo:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#441316] text-[35px] text-center w-[66px]">
        <p className="leading-[18px]">Ada</p>
      </div>
      <Frame13 />
    </div>
  );
}

function Frame9() {
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

function Frame5() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 pb-[16px] pt-0 px-0 top-0">
      <TopBar />
      <Frame9 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="absolute h-[1523px] left-0 top-0 w-[375px]">
      <Frame5 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#f7f6f2] relative rounded-[30px] shrink-0">
      <div className="content-stretch flex items-center justify-center overflow-clip px-[22px] py-[14px] relative rounded-[inherit]">
        <div className="flex flex-col font-['DM_Sans:Light',sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#667085] text-[14px] text-nowrap tracking-[-0.28px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          <p className="leading-[normal] whitespace-pre">Okay, let’s go ahead.</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[30px]" />
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[#f7f6f2] relative rounded-[30px] shrink-0">
      <div className="content-stretch flex items-center justify-center overflow-clip px-[22px] py-[14px] relative rounded-[inherit]">
        <div className="flex flex-col font-['DM_Sans:Light',sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#667085] text-[14px] text-nowrap tracking-[-0.28px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          <p className="leading-[normal] whitespace-pre">Would this change make a noticeable difference to my risk level?</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[30px]" />
    </div>
  );
}

function Frame14() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center pb-[8px] pt-0 px-[16px] relative w-full">
          <Frame1 />
          <Frame2 />
        </div>
      </div>
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

function Frame7() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pb-0 pt-[12px] px-[16px] relative w-full">
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

function Frame12() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame7 />
      <HomeIndicator />
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame12 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col gap-[8px] items-center left-0 w-[375px]">
      <Frame14 />
      <Frame16 />
    </div>
  );
}

function You() {
  return (
    <div className="bg-[#e4e4e4] relative rounded-[20px] shrink-0" data-name="You">
      <div className="content-stretch flex items-center justify-center overflow-clip px-[22px] py-[14px] relative rounded-[inherit]">
        <div className="flex flex-col font-['DM_Sans:Light',sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#667085] text-[14px] text-nowrap tracking-[-0.28px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          <p className="leading-[normal] whitespace-pre">How would this impact my portfolio?</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function Frame3() {
  return (
    <div className="bg-white relative rounded-[20px] shrink-0 w-full">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center px-[22px] py-[14px] relative w-full">
          <div className="basis-0 flex flex-col font-['DM_Sans:Light',sans-serif] font-light grow justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[#667085] text-[14px] tracking-[-0.28px]" style={{ fontVariationSettings: "'opsz' 14" }}>
            <p className="leading-[normal]">Moving 5% from equities to bonds would make your portfolio more conservative. Historically, bonds experience lower short-term fluctuations but also offer lower returns. This shift could reduce your portfolio’s expected volatility by a small margin while slightly lowering projected long-term growth.</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-white relative rounded-[20px] shrink-0 w-full">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center px-[22px] py-[14px] relative w-full">
          <div className="basis-0 flex flex-col font-['DM_Sans:Light',sans-serif] font-light grow justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[#667085] text-[14px] tracking-[-0.28px]" style={{ fontVariationSettings: "'opsz' 14" }}>
            <p className="leading-[normal]">If you want, I can estimate the new risk/return profile for you.</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function Ada() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Ada">
      <Frame3 />
      <Frame4 />
    </div>
  );
}

function Frame() {
  return (
    <div className="[grid-area:1_/_1] content-stretch flex flex-col gap-[8px] items-end ml-0 mt-0 relative w-[347px]">
      <You />
      <Ada />
    </div>
  );
}

function Group() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative">
      <Frame />
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

function Frame11() {
  return (
    <div className="bg-[#efede6] relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-[8px] relative w-full">
          <Group1 />
        </div>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[5px] items-center left-0 pb-0 pt-[12px] px-[6px] top-[96px] w-[375px]">
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Today</p>
      <Frame11 />
    </div>
  );
}

export default function FollowUpRoute() {
  return (
    <div className="bg-[#efede6] relative size-full" data-name="Follow up Route">
      <Frame8 />
      <Frame6 />
      <Frame10 />
    </div>
  );
}