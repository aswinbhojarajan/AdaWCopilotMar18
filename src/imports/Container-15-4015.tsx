import svgPaths from "./svg-bjaq71pa6v";

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

function Container() {
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

function Container1() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container />
      <HomeIndicator />
    </div>
  );
}

export default function Container2() {
  return (
    <div className="content-stretch flex flex-col items-center relative size-full" data-name="Container">
      <Container1 />
    </div>
  );
}