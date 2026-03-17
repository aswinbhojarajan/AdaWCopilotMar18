import svgPaths from "./svg-u0p05n5mld";

function Paragraph() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[256.13px]" data-name="Paragraph">
      <p className="absolute css-4hzbpn font-['DM_Sans:Regular',sans-serif] h-[26px] leading-[14.777px] left-0 not-italic text-[#555] text-[10px] top-[0.08px] w-[256px]">Renewed demand in GCC bonds. Yields remain attractive, particularly in short-dated issuances.</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="h-[43px] relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] h-full items-start relative">
        <p className="css-ew64yg font-['DM_Sans:SemiBold',sans-serif] leading-[14.777px] not-italic relative shrink-0 text-[#441316] text-[8.209px] tracking-[0.6567px] uppercase">OPPORTUNITY</p>
        <Paragraph />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[13.545px] relative shrink-0 w-[256.13px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['DM_Sans:SemiBold',sans-serif] leading-[13.545px] left-0 not-italic text-[#555] text-[9px] top-0">Explore</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] h-[75px] items-start left-[38px] top-[12.92px] w-[256px]" data-name="Container">
      <Frame />
      <Button />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[94px] left-[0.13px] top-0 w-[327px]" data-name="Container">
      <Container />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[11.493px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.493 11.493">
        <g id="Icon">
          <path d={svgPaths.p1b611080} id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.957752" />
          <path d={svgPaths.p36196600} id="Vector_2" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.957752" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[298.82px] size-[16.419px] top-[11.49px]" data-name="Button">
      <Icon />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[17.02%_91.7%_70.73%_4.73%]">
      <div className="absolute inset-[-3.68%_-3.63%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.518 12.3601">
          <g id="Group 1000011033">
            <path d={svgPaths.p3d650680} id="Ellipse 3627" stroke="var(--stroke-0, #441316)" strokeWidth="0.84746" />
            <path d={svgPaths.p6b70180} id="Ellipse 3628" stroke="var(--stroke-0, #441316)" strokeWidth="0.84746" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function SlideNotification() {
  return (
    <div className="bg-[#dad1d2] relative rounded-[13.135px] shadow-[0px_3.284px_4.926px_-3.284px_rgba(0,0,0,0.1)] size-full" data-name="SlideNotification">
      <Container1 />
      <Button1 />
      <Group />
    </div>
  );
}