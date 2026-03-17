import svgPaths from "./svg-ru8qefcvp5";

function Container() {
  return <div className="absolute blur-2xl filter left-[268px] rounded-[1.67772e+07px] size-[160px] top-[-40px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgba(232, 228, 223, 0.3) 0%, rgba(0, 0, 0, 0) 100%)" }} />;
}

function Container1() {
  return <div className="absolute blur-xl filter left-[-30px] rounded-[1.67772e+07px] size-[140px] top-[56.25px]" data-name="Container" style={{ backgroundImage: "linear-gradient(45deg, rgba(212, 206, 197, 0.25) 0%, rgba(0, 0, 0, 0) 100%)" }} />;
}

function Container2() {
  return <div className="absolute bg-[rgba(240,237,232,0.2)] blur-3xl filter left-[94px] rounded-[1.67772e+07px] size-[200px] top-[-16.88px]" data-name="Container" />;
}

function Container3() {
  return (
    <div className="absolute h-[166.25px] left-0 overflow-clip top-0 w-[388px]" data-name="Container">
      <Container />
      <Container1 />
      <Container2 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[18px] left-0 top-0 w-[340px]" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[18px] left-[170.9px] not-italic text-[#83848b] text-[12px] text-center text-nowrap top-0 tracking-[1px] translate-x-[-50%] uppercase">CURRENT VALUE</p>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[30px] left-[27.19px] top-[8px] w-[9.359px]" data-name="Text">
      <p className="absolute font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[30px] left-[5px] text-[#2e3a59] text-[20px] text-center text-nowrap top-[-0.5px] translate-x-[-50%]">$</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute h-[52px] left-[40.55px] top-0 w-[240.258px]" data-name="Text">
      <p className="absolute font-['Crimson_Pro:SemiBold',sans-serif] font-semibold leading-[52px] left-[120px] text-[#2e3a59] text-[52px] text-center text-nowrap top-[-1px] tracking-[-2px] translate-x-[-50%]">131,230.19</p>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[288.8px] size-[24px] top-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d="M9 18L15 12L9 6" id="Vector" stroke="var(--stroke-0, #83848B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute h-[52px] left-0 top-[30px] w-[340px]" data-name="Container">
      <Text />
      <Text1 />
      <Icon />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-0 size-[14px] top-[4.25px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d={svgPaths.p3471a100} id="Vector" stroke="var(--stroke-0, #16A34A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45833" />
          <path d={svgPaths.p1977ee80} id="Vector_2" stroke="var(--stroke-0, #16A34A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45833" />
        </g>
      </svg>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute h-[22.5px] left-[20px] top-0 w-[71.305px]" data-name="Text">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[22.5px] left-[36px] not-italic text-[#16a34a] text-[15px] text-center top-[0.5px] translate-x-[-50%] w-[72px]">$1,090.00</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute h-[22.5px] left-[124.34px] top-[94px] w-[91.305px]" data-name="Container">
      <Icon1 />
      <Text2 />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[118.25px] left-[24px] top-[24px] w-[340px]" data-name="Container">
      <Paragraph />
      <Container4 />
      <Container5 />
    </div>
  );
}

export default function Container7() {
  return (
    <div className="border border-[#e5e5e5] border-solid overflow-clip relative rounded-[24px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] size-full" data-name="Container" style={{ backgroundImage: "linear-gradient(rgb(250, 250, 250) 0%, rgb(255, 255, 255) 100%), linear-gradient(90deg, rgba(46, 58, 89, 0) 0%, rgba(46, 58, 89, 0) 100%)" }}>
      <Container3 />
      <Container6 />
    </div>
  );
}