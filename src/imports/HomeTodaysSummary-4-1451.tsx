import svgPaths from "./svg-4rfis4h4ec";

function Frame3() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
      <p className="font-['RL_Limo:Regular',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#c0180c] text-[10px] text-center tracking-[0.2px] uppercase w-[138px]">WELCOME TO ADA</p>
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0 w-full">
      <Frame3 />
      <div className="h-0 relative shrink-0 w-[128px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 128 1">
            <line id="Line 14" stroke="var(--stroke-0, #555555)" strokeWidth="0.5" x2="128" y1="0.25" y2="0.25" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame16 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
      <p className="font-['Crimson_Pro:Light',sans-serif] font-light leading-[40px] relative shrink-0 text-[#555555] text-[42px] text-center tracking-[-0.84px] w-full">Let’s make Ada truly yours.</p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Frame8 />
      <Frame9 />
    </div>
  );
}

function TotalBalance() {
  return (
    <div className="content-stretch flex flex-col items-start relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="Total Balance">
      <Frame13 />
    </div>
  );
}

function PurpleSparkle() {
  return (
    <div className="overflow-clip relative shrink-0 size-[58px]" data-name="Purple Sparkle 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 58 58">
        <g id="Layer 1">
          <path d={svgPaths.p3269c100} fill="url(#paint0_radial_4_1541)" id="Purple Sparkle" />
        </g>
        <defs>
          <radialGradient cx="0" cy="0" gradientTransform="translate(29 29) scale(29)" gradientUnits="userSpaceOnUse" id="paint0_radial_4_1541" r="1">
            <stop stopColor="#D9C6ED" />
            <stop offset="0.197115" stopColor="#C9AEE5" />
            <stop offset="0.725962" stopColor="#441316" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[#f7f6f2] content-stretch flex h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Get started</p>
    </div>
  );
}

function Frame18() {
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
        <p className="leading-[18px] whitespace-pre">2–3 minutes</p>
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full">
      <Frame2 />
      <Frame18 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[14px] items-center p-[24px] relative w-full">
          <TotalBalance />
          <PurpleSparkle />
          <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[14px] text-center tracking-[-0.28px] w-[239px]">A quick assessment helps Ada understand your financial preferences and tailor guidance to you.</p>
          <Frame19 />
        </div>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 px-[6px] py-0 top-[133px] w-[375px]">
      <Frame7 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <p className="[text-underline-position:from-font] decoration-solid font-['DM_Sans:SemiBold',sans-serif] h-[10px] leading-[1.3] not-italic relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] underline uppercase w-[39px]">HOME</p>
    </div>
  );
}

function Filter() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex gap-[32px] h-[40px] items-center left-0 px-[24px] py-0 top-[88px] w-[409px]" data-name="Filter">
      <Frame12 />
      <p className="font-['DM_Sans:Regular',sans-serif] h-[10px] leading-[1.3] not-italic opacity-60 relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[45px]">Wealth</p>
      <p className="font-['DM_Sans:Regular',sans-serif] h-[10px] leading-[1.3] not-italic opacity-60 relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[57px]">Discover</p>
      <p className="font-['DM_Sans:Regular',sans-serif] h-[10px] leading-[1.3] not-italic opacity-60 relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[46px]">Lounge</p>
      <p className="font-['DM_Sans:Regular',sans-serif] h-[10px] leading-[1.3] not-italic opacity-40 relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[46px]">Profile</p>
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

function Frame17() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[191.5px]">
      <div className="flex flex-col font-['RL_Limo:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#441316] text-[35px] text-center w-[66px]">
        <p className="leading-[18px]">Ada</p>
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
      <Frame17 />
      <Frame15 />
    </div>
  );
}

function Frame6() {
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

function Frame() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 pb-[16px] pt-0 px-0 top-0">
      <TopBar />
      <Frame6 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute h-[2125px] left-0 top-0 w-[375px]">
      <Frame10 />
      <Filter />
      <Frame />
    </div>
  );
}

function Frame14() {
  return (
    <div className="relative shrink-0 size-[44px]">
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

function Frame4() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pb-0 pt-[12px] px-[16px] relative w-full">
          <Frame14 />
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

function Frame11() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame4 />
      <HomeIndicator />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col items-center left-1/2 translate-x-[-50%]">
      <Frame11 />
    </div>
  );
}

export default function HomeTodaysSummary() {
  return (
    <div className="bg-[#efede6] relative size-full" data-name="Home_Today\'s Summary">
      <Frame5 />
      <Frame1 />
    </div>
  );
}