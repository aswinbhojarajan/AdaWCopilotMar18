import svgPaths from "./svg-ogddv3enmi";
import clsx from "clsx";
import { imgGroup } from "./svg-n3lf9";
type Paragraph9Props = {
  additionalClassNames?: string;
};

function Paragraph9({ children, additionalClassNames = "" }: React.PropsWithChildren<Paragraph9Props>) {
  return (
    <div className={clsx("relative shrink-0 w-full", additionalClassNames)}>
      <div className="absolute font-['DM_Sans:Light',sans-serif] font-light leading-[20.8px] left-0 text-[#555] text-[13px] top-[-0.5px] w-[193px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        {children}
      </div>
    </div>
  );
}

function SparkIcon4({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[16px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">{children}</div>
    </div>
  );
}
type ParagraphTextProps = {
  text: string;
};

function ParagraphText({ text }: ParagraphTextProps) {
  return (
    <div className="h-[20.797px] relative shrink-0 w-full">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[20.8px] left-0 not-italic text-[13px] text-nowrap text-white top-[-0.5px]">{text}</p>
    </div>
  );
}

function Group() {
  return (
    <div style={{ maskImage: `url('${imgGroup}')` }} className="absolute inset-[13.73%_13.23%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.117px] mask-size-[16px_15.841px]">
      <div className="absolute inset-[-1.99%_-1.96%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.2263 12.0671">
          <g id="Group">
            <path d={svgPaths.p145a9300} id="Vector" stroke="var(--stroke-0, #D8D8D8)" strokeWidth="0.461211" />
            <path d={svgPaths.p2235a200} id="Vector_2" stroke="var(--stroke-0, #D8D8D8)" strokeWidth="0.461211" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[41.594px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[20.8px] left-0 not-italic text-[13px] text-white top-[-0.5px] w-[178px]">Prepare me for my next client meeting</p>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-[#441316] content-stretch flex flex-col h-[65.594px] items-start left-[73px] pb-0 pt-[12px] px-[16px] rounded-[16px] top-0 w-[219px]" data-name="Container">
      <Paragraph />
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="absolute contents inset-[0.5%_0]" data-name="Clip path group">
      <Group />
    </div>
  );
}

function SparkIcon() {
  return (
    <SparkIcon4>
      <ClipPathGroup />
    </SparkIcon4>
  );
}

function Container1() {
  return (
    <div className="absolute bg-[#441316] content-stretch flex items-center justify-center left-0 rounded-[1.67772e+07px] size-[28px] top-[4px]" data-name="Container">
      <SparkIcon />
    </div>
  );
}

function Paragraph1() {
  return (
    <Paragraph9 additionalClassNames="h-[915.063px]">
      <p className="mb-0">{`I'll help you prepare for your client meeting. Let me gather the key information:`}</p>
      <p className="mb-0">&nbsp;</p>
      <p className="mb-0">**Meeting Preparation Summary**</p>
      <p className="mb-0">&nbsp;</p>
      <p className="mb-0">**Portfolio Status:**</p>
      <p className="mb-0">- Current net worth: $2.85M (down 2.4% this week)</p>
      <p className="mb-0">- Target: $3.0M by end of year</p>
      <p className="mb-0">- Risk profile: Moderate Growth (aligned with target)</p>
      <p className="mb-0">&nbsp;</p>
      <p className="mb-0">**Key Discussion Points:**</p>
      <p className="mb-0">1. **Technology concentration** — 58% exposure needs attention</p>
      <p className="mb-0">2. **Tax-loss harvesting opportunity** — $18K potential tax savings available</p>
      <p className="mb-0">3. **Alternative allocation** — Now at 12%, above 10% target</p>
      <p className="mb-0">4. **Retirement timeline confirmation** — Still on track?</p>
      <p className="mb-0">&nbsp;</p>
      <p className="mb-0">**Talking Points Script:**</p>
      <p className="mb-0">{`"Your portfolio has performed well this year, but I've identified three areas where we can improve your positioning..."`}</p>
      <p className="mb-0">&nbsp;</p>
      <p className="mb-0">**Ada Insights:**</p>
      <p className="mb-0">- Tech sector concentration creates vulnerability to corrections</p>
      <p className="mb-0">- Two specific positions could be harvested for tax efficiency</p>
      <p className="mb-0">- Overall portfolio health remains solid at 68/100</p>
      <p className="mb-0">&nbsp;</p>
      <p>Would you like me to expand on any of these areas or generate a full meeting script?</p>
    </Paragraph9>
  );
}

function Container2() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col h-[939.063px] items-start left-[38px] pb-0 pt-[12px] px-[16px] rounded-[16px] top-0 w-[224.797px]" data-name="Container">
      <Paragraph1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[939.063px] left-0 top-[81.59px] w-[262.797px]" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[41.594px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[20.8px] left-0 not-italic text-[13px] text-white top-[-0.5px] w-[187px]">Hello, I need help, what do I say to Sarah Chen TODAY</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute bg-[#441316] content-stretch flex flex-col h-[65.594px] items-start left-[73px] pb-0 pt-[12px] px-[16px] rounded-[16px] top-[1036.66px] w-[219px]" data-name="Container">
      <Paragraph2 />
    </div>
  );
}

function ClipPathGroup1() {
  return (
    <div className="absolute contents inset-[0.5%_0]" data-name="Clip path group">
      <Group />
    </div>
  );
}

function SparkIcon1() {
  return (
    <SparkIcon4>
      <ClipPathGroup1 />
    </SparkIcon4>
  );
}

function Container5() {
  return (
    <div className="absolute bg-[#441316] content-stretch flex items-center justify-center left-0 rounded-[1.67772e+07px] size-[28px] top-[4px]" data-name="Container">
      <SparkIcon1 />
    </div>
  );
}

function Paragraph3() {
  return (
    <Paragraph9 additionalClassNames="h-[187.172px]">
      <p className="mb-0">{`I understand you're asking about "Hello, I need help, what do I say to Sarah Chen TODAY". I can help you with that using your client portfolio data and market intelligence.`}</p>
      <p className="mb-0">&nbsp;</p>
      <p>What specific aspect would you like me to focus on?</p>
    </Paragraph9>
  );
}

function Container6() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col h-[211.172px] items-start left-[38px] pb-0 pt-[12px] px-[16px] rounded-[16px] top-0 w-[224.797px]" data-name="Container">
      <Paragraph3 />
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[211.172px] left-0 top-[1118.25px] w-[262.797px]" data-name="Container">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute bg-[#441316] content-stretch flex flex-col h-[44.797px] items-start left-[133.7px] pb-0 pt-[12px] px-[16px] rounded-[16px] top-[1345.42px] w-[158.297px]" data-name="Container">
      <ParagraphText text="Generate action plan" />
    </div>
  );
}

function ClipPathGroup2() {
  return (
    <div className="absolute contents inset-[0.5%_0]" data-name="Clip path group">
      <Group />
    </div>
  );
}

function SparkIcon2() {
  return (
    <SparkIcon4>
      <ClipPathGroup2 />
    </SparkIcon4>
  );
}

function Container9() {
  return (
    <div className="absolute bg-[#441316] content-stretch flex items-center justify-center left-0 rounded-[1.67772e+07px] size-[28px] top-[4px]" data-name="Container">
      <SparkIcon2 />
    </div>
  );
}

function Paragraph4() {
  return (
    <Paragraph9 additionalClassNames="h-[166.375px]">
      <p className="mb-0">{`I understand you're asking about "Generate action plan". I can help you with that using your client portfolio data and market intelligence.`}</p>
      <p className="mb-0">&nbsp;</p>
      <p>What specific aspect would you like me to focus on?</p>
    </Paragraph9>
  );
}

function Container10() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col h-[190.375px] items-start left-[38px] pb-0 pt-[12px] px-[16px] rounded-[16px] top-0 w-[224.797px]" data-name="Container">
      <Paragraph4 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute h-[190.375px] left-0 top-[1406.22px] w-[262.797px]" data-name="Container">
      <Container9 />
      <Container10 />
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute bg-[#441316] content-stretch flex flex-col h-[44.797px] items-start left-[160.73px] pb-0 pt-[12px] px-[16px] rounded-[16px] top-[1612.59px] w-[131.273px]" data-name="Container">
      <ParagraphText text="Export summary" />
    </div>
  );
}

function ClipPathGroup3() {
  return (
    <div className="absolute contents inset-[0.5%_0]" data-name="Clip path group">
      <Group />
    </div>
  );
}

function SparkIcon3() {
  return (
    <SparkIcon4>
      <ClipPathGroup3 />
    </SparkIcon4>
  );
}

function Container13() {
  return (
    <div className="absolute bg-[#441316] content-stretch flex items-center justify-center left-0 rounded-[1.67772e+07px] size-[28px] top-[4px]" data-name="Container">
      <SparkIcon3 />
    </div>
  );
}

function Paragraph5() {
  return (
    <Paragraph9 additionalClassNames="h-[166.375px]">
      <p className="mb-0">{`I understand you're asking about "Export summary". I can help you with that using your client portfolio data and market intelligence.`}</p>
      <p className="mb-0">&nbsp;</p>
      <p>What specific aspect would you like me to focus on?</p>
    </Paragraph9>
  );
}

function Container14() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col h-[190.375px] items-start left-[38px] pb-0 pt-[12px] px-[16px] rounded-[16px] top-0 w-[224.797px]" data-name="Container">
      <Paragraph5 />
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute h-[190.375px] left-0 top-[1673.39px] w-[262.797px]" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-[55px] not-italic text-[#555] text-[11px] text-center text-nowrap top-0 translate-x-[-50%]">Show affected clients</p>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col h-[29.5px] items-start left-0 pb-[0.5px] pt-[6.5px] px-[12.5px] rounded-[50px] top-0 w-[134.984px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <Paragraph6 />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-[53.5px] not-italic text-[#555] text-[11px] text-center text-nowrap top-0 translate-x-[-50%]">Generate action plan</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col h-[29.5px] items-start left-[140.98px] pb-[0.5px] pt-[6.5px] px-[12.5px] rounded-[50px] top-0 w-[131.867px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <Paragraph7 />
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-[42px] not-italic text-[#555] text-[11px] text-center text-nowrap top-0 translate-x-[-50%]">Export summary</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col h-[29.5px] items-start left-0 pb-[0.5px] pt-[6.5px] px-[12.5px] rounded-[50px] top-[35.5px] w-[109px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[50px]" />
      <Paragraph8 />
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute h-[65px] left-0 top-[1879.77px] w-[292px]" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[1944.766px] relative shrink-0 w-full" data-name="Container">
      <Container />
      <Container3 />
      <Container4 />
      <Container7 />
      <Container8 />
      <Container11 />
      <Container12 />
      <Container15 />
      <Container16 />
    </div>
  );
}

function Container18() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[340px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pt-[-1392.5px] px-[24px] relative rounded-[inherit] size-full">
        <Container17 />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="basis-0 grow h-[773px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container18 />
      </div>
    </div>
  );
}

export default function AdvisorLayout() {
  return (
    <div className="bg-white content-stretch flex items-start pl-px pr-0 py-0 relative size-full" data-name="AdvisorLayout">
      <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0px_0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Container19 />
    </div>
  );
}