import svgPaths from "./svg-l36mk8ppv1";
import clsx from "clsx";
import { imgEllipse3627 } from "./svg-2zdn2";

function ButtonBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[41px] relative shrink-0 w-[60px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center relative size-full">{children}</div>
    </div>
  );
}

function IconBackgroundImage1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[22px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">{children}</div>
    </div>
  );
}
type ContainerBackgroundImage5Props = {
  text: string;
  additionalClassNames?: string;
};

function ContainerBackgroundImage5({ children, text, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage5Props>) {
  return (
    <div className="bg-[#f7f6f2] relative rounded-[1.67772e+07px] shrink-0 size-[42px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-0 pr-[0.008px] py-0 relative size-full">
        <BackgroundImage2 additionalClassNames={additionalClassNames}>
          <p className="absolute font-['DM_Sans:Bold',sans-serif] leading-[19.5px] left-0 not-italic text-[#2e3a59] text-[13px] text-nowrap top-px">{text}</p>
        </BackgroundImage2>
      </div>
    </div>
  );
}
type ContainerBackgroundImage4Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage4({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage4Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">{children}</div>
    </div>
  );
}
type ContainerBackgroundImage3Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage3({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage3Props>) {
  return (
    <div className={clsx("h-[42px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">{children}</div>
    </div>
  );
}
type BackgroundImage4Props = {
  additionalClassNames?: string;
};

function BackgroundImage4({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage4Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">{children}</div>
    </div>
  );
}
type BackgroundImage3Props = {
  additionalClassNames?: string;
};

function BackgroundImage3({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage3Props>) {
  return <BackgroundImage4 additionalClassNames={clsx("h-[41px] relative shrink-0", additionalClassNames)}>{children}</BackgroundImage4>;
}
type ContainerBackgroundImage2Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage2({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage2Props>) {
  return <BackgroundImage4 additionalClassNames={clsx("basis-0 grow min-h-px min-w-px relative shrink-0", additionalClassNames)}>{children}</BackgroundImage4>;
}
type ContainerBackgroundImage1Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage1({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage1Props>) {
  return (
    <div className={clsx("relative rounded-[1.67772e+07px] shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">{children}</div>
    </div>
  );
}
type Group1000011033BackgroundImageProps = {
  additionalClassNames?: string;
};

function Group1000011033BackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<Group1000011033BackgroundImageProps>) {
  return (
    <div style={{ maskImage: `url('${imgEllipse3627}')` }} className={clsx("absolute mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-size-[36px_36px]", additionalClassNames)}>
      <div className="absolute inset-[-2.66%]">{children}</div>
    </div>
  );
}

function BackgroundImage2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type BackgroundImage2Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[71px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#f7f6f2] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-px pt-0 px-[18px] relative size-full">{children}</div>
      </div>
    </div>
  );
}
type IconBackgroundImageProps = {
  additionalClassNames?: string;
};

function IconBackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<IconBackgroundImageProps>) {
  return (
    <div className={clsx("size-[14px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}
type BackgroundImage1Props = {
  additionalClassNames?: string;
};

function BackgroundImage1({ additionalClassNames = "" }: BackgroundImage1Props) {
  return (
    <div className={additionalClassNames}>
      <div className="absolute inset-[-50%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.66667 3.66667">
          <path d={svgPaths.p35284800} id="Vector" stroke="var(--stroke-0, #83848B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.83333" />
        </svg>
      </div>
    </div>
  );
}
type Icon16VectorBackgroundImageProps = {
  additionalClassNames?: string;
};

function Icon16VectorBackgroundImage({ additionalClassNames = "" }: Icon16VectorBackgroundImageProps) {
  return <BackgroundImage1 additionalClassNames={clsx("absolute bottom-[45.83%] top-[45.83%]", additionalClassNames)} />;
}
type ParagraphBackgroundImageAndText1Props = {
  text: string;
};

function ParagraphBackgroundImageAndText1({ text }: ParagraphBackgroundImageAndText1Props) {
  return (
    <div className="h-[21px] relative shrink-0 w-full">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[21px] left-0 not-italic text-[#2e3a59] text-[14px] text-nowrap top-0">{text}</p>
    </div>
  );
}

function TextBackgroundImageAndText({ text, additionalClassNames = "" }: TextBackgroundImageAndTextProps) {
  return (
    <BackgroundImage2 additionalClassNames={additionalClassNames}>
      <p className="absolute font-['DM_Sans:Bold',sans-serif] leading-[19.5px] left-0 not-italic text-[#2e3a59] text-[13px] text-nowrap top-px">{text}</p>
    </BackgroundImage2>
  );
}
type BackgroundImageProps = {
  additionalClassNames?: string;
};

function BackgroundImage({ additionalClassNames = "" }: BackgroundImageProps) {
  return (
    <div className={additionalClassNames}>
      <div className="absolute inset-[-50%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
          <path d={svgPaths.p216ece80} id="Vector" stroke="var(--stroke-0, #83848B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
type Icon5VectorBackgroundImageProps = {
  additionalClassNames?: string;
};

function Icon5VectorBackgroundImage({ additionalClassNames = "" }: Icon5VectorBackgroundImageProps) {
  return <BackgroundImage additionalClassNames={clsx("absolute bottom-[45.83%] top-[45.83%]", additionalClassNames)} />;
}
type ParagraphBackgroundImageAndTextProps = {
  text: string;
};

function ParagraphBackgroundImageAndText({ text }: ParagraphBackgroundImageAndTextProps) {
  return (
    <div className="h-[18px] relative shrink-0 w-full">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#83848b] text-[12px] text-nowrap top-0">{text}</p>
    </div>
  );
}

function Heading() {
  return (
    <BackgroundImage2 additionalClassNames="h-[21px] w-[181.438px]">
      <p className="absolute font-['DM_Sans:Bold',sans-serif] leading-[21px] left-0 not-italic text-[#2e3a59] text-[14px] text-nowrap top-[1.5px] tracking-[-0.3px] uppercase">PORTFOLIO MANAGEMENT</p>
    </BackgroundImage2>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[27.31%_26.65%_28.42%_28.48%]">
      <Group1000011033BackgroundImage additionalClassNames="inset-[27.31%_27.25%_28.42%_28.48%] mask-position-[-10.252px_-9.831px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7848 16.7848">
          <path d={svgPaths.p2537ed00} id="Ellipse 3627" stroke="var(--stroke-0, #FEFEF8)" strokeWidth="0.84746" />
        </svg>
      </Group1000011033BackgroundImage>
      <Group1000011033BackgroundImage additionalClassNames="inset-[27.31%_26.65%_28.42%_29.08%] mask-position-[-10.47px_-9.831px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7847 16.7848">
          <path d={svgPaths.p28a4f080} id="Ellipse 3628" stroke="var(--stroke-0, #FEFEF8)" strokeWidth="0.84746" />
        </svg>
      </Group1000011033BackgroundImage>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-0">
      <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-0.001px] mask-size-[36px_36px]" style={{ maskImage: `url('${imgEllipse3627}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 36">
          <path d={svgPaths.p11f24a00} fill="var(--fill-0, #441316)" id="Ellipse 3622" />
        </svg>
      </div>
      <Group3 />
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="absolute contents inset-0" data-name="Clip path group">
      <Group2 />
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[36px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <ClipPathGroup />
    </div>
  );
}

function Group() {
  return (
    <div className="content-stretch flex flex-col h-[36px] items-start relative shrink-0 w-full" data-name="Group">
      <Icon />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0)] relative rounded-[18px] shadow-[0px_0px_1.834px_0.55px_rgba(68,19,22,0)] shrink-0 size-[36px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Group />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[87.5%_42.78%_8.33%_42.78%]" data-name="Vector">
        <div className="absolute inset-[-100.03%_-28.87%_-100.01%_-28.87%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.55361 2.50007">
            <path d={svgPaths.p1f8ebe00} id="Vector" stroke="var(--stroke-0, #2E3A59)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.33%_12.5%_29.17%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-6.67%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6664 14.1667">
            <path d={svgPaths.p259fd370} id="Vector" stroke="var(--stroke-0, #2E3A59)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="basis-0 grow h-[36px] min-h-px min-w-px relative rounded-[10px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[8px] px-[8px] relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[36px] relative shrink-0 w-[80px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Button />
        <Button1 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bg-white content-stretch flex h-[100px] items-center justify-between left-0 px-[20px] py-0 top-0 w-[430px]" data-name="Container">
      <Heading />
      <Container />
    </div>
  );
}

function Icon2() {
  return (
    <IconBackgroundImage additionalClassNames="relative shrink-0">
      <path d={svgPaths.p3fb08a80} id="Vector" stroke="var(--stroke-0, #83848B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
      <path d="M12.25 1.75V4.66667H9.33333" id="Vector_2" stroke="var(--stroke-0, #83848B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
      <path d={svgPaths.p32253d00} id="Vector_3" stroke="var(--stroke-0, #83848B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
      <path d="M4.66667 9.33333H1.75V12.25" id="Vector_4" stroke="var(--stroke-0, #83848B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
    </IconBackgroundImage>
  );
}

function Paragraph() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[#a8a9ae] text-[11px] text-nowrap top-0">3:24 PM EST, 12 Jan 2026</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="basis-0 grow h-[34.5px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <ParagraphBackgroundImageAndText text="Portfolio last updated" />
        <Paragraph />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[34.5px] items-center left-[141px] top-[188.25px] w-[148px]" data-name="Container">
      <Icon2 />
      <Container2 />
    </div>
  );
}

function Button2() {
  return (
    <div className="[grid-area:1_/_1] bg-white place-self-stretch relative rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] shrink-0" data-name="Button">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[21px] left-[93.91px] not-italic text-[#2e3a59] text-[14px] text-center text-nowrap top-[10px] translate-x-[-50%]">HOLDINGS</p>
    </div>
  );
}

function Button3() {
  return (
    <div className="[grid-area:1_/_2] place-self-stretch relative rounded-[8px] shrink-0" data-name="Button">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[21px] left-[93.55px] not-italic text-[#83848b] text-[14px] text-center text-nowrap top-[10px] translate-x-[-50%]">PERFORMANCE</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute bg-[#f7f6f2] gap-[8px] grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[49px] left-[20px] p-[4px] rounded-[12px] top-[242.75px] w-[390px]" data-name="Container">
      <Button2 />
      <Button3 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_2051_1173)" id="Icon">
          <path d={svgPaths.p5b7598} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p1a015a00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M3 16.5H15" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p1058cb10} id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p17060880} id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p2d3c5f00} id="Vector_6" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
        <defs>
          <clipPath id="clip0_2051_1173">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="bg-[#441316] size-[36px]">
      <Icon3 />
    </ContainerBackgroundImage1>
  );
}

function Paragraph1() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[19.5px] left-0 not-italic text-[#2e3a59] text-[13px] text-nowrap top-0">Invite friends, earn rewards</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[#83848b] text-[11px] text-nowrap top-0">Get up to $100 per referral</p>
    </div>
  );
}

function Container6() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="h-[38px]">
      <Paragraph1 />
      <Paragraph2 />
    </ContainerBackgroundImage2>
  );
}

function Container7() {
  return (
    <div className="basis-0 grow h-[38px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">
        <Container5 />
        <Container6 />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-10.42%_-20.83%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.66667 9.66667">
            <path d={svgPaths.p290eb380} id="Vector" stroke="var(--stroke-0, #6B1F24)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 size-[32px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[8px] px-[8px] relative size-full">
        <Icon4 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <Button4 />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col h-[72px] items-start left-[20px] pb-px pt-[17px] px-[17px] rounded-[16px] top-[307.75px] w-[390px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container8 />
    </div>
  );
}

function Heading1() {
  return (
    <BackgroundImage2 additionalClassNames="h-[24px] w-[132.75px]">
      <p className="absolute font-['DM_Sans:Bold',sans-serif] leading-[24px] left-0 not-italic text-[#2e3a59] text-[16px] top-[1.5px] tracking-[-0.3px] w-[133px]">AAPL PORTFOLIO</p>
    </BackgroundImage2>
  );
}

function Icon5() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <BackgroundImage additionalClassNames="absolute inset-[45.83%]" />
      <Icon5VectorBackgroundImage additionalClassNames="left-3/4 right-[16.67%]" />
      <Icon5VectorBackgroundImage additionalClassNames="left-[16.67%] right-3/4" />
    </div>
  );
}

function Button5() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[30px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[6px] px-[6px] relative size-full">
        <Icon5 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex h-[30px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Button5 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.pe6b10c0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p4c21d00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container11() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="bg-[#441316] size-[40px]">
      <Icon6 />
    </ContainerBackgroundImage1>
  );
}

function Paragraph3() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Bold',sans-serif] leading-[22.5px] left-0 not-italic text-[#2e3a59] text-[15px] text-nowrap top-[1.5px]">ALL STOCKS</p>
    </div>
  );
}

function Container12() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="h-[42.5px]">
      <Paragraph3 />
      <ParagraphBackgroundImageAndText text="Investment portfolio" />
    </ContainerBackgroundImage2>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex gap-[10px] h-[42.5px] items-center left-[18px] top-[16px] w-[162.586px]" data-name="Container">
      <Container11 />
      <Container12 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[#83848b] text-[11px] text-nowrap top-0 tracking-[0.5px] uppercase">Current Value</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[33px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[33px] left-0 not-italic text-[#2e3a59] text-[22px] top-0 w-[113px]">$131,230.19</p>
    </div>
  );
}

function Container14() {
  return (
    <ContainerBackgroundImage4 additionalClassNames="h-[53.5px] w-[112.867px]">
      <Paragraph4 />
      <Paragraph5 />
    </ContainerBackgroundImage4>
  );
}

function Paragraph6() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-[100.27px] not-italic text-[#83848b] text-[11px] text-nowrap text-right top-0 tracking-[0.5px] translate-x-[-100%] uppercase">Total Returns</p>
    </div>
  );
}

function Icon7() {
  return (
    <IconBackgroundImage additionalClassNames="relative shrink-0">
      <path d={svgPaths.p3471a100} id="Vector" stroke="var(--stroke-0, #441316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45833" />
      <path d={svgPaths.p1977ee80} id="Vector_2" stroke="var(--stroke-0, #441316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45833" />
    </IconBackgroundImage>
  );
}

function Paragraph7() {
  return (
    <BackgroundImage2 additionalClassNames="h-[24px] w-[81.656px]">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[24px] left-[82px] not-italic text-[#441316] text-[16px] text-right top-[0.5px] translate-x-[-100%] w-[82px]">$18,969.95</p>
    </BackgroundImage2>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex gap-[4px] h-[24px] items-center justify-end relative shrink-0 w-full" data-name="Container">
      <Icon7 />
      <Paragraph7 />
    </div>
  );
}

function Container16() {
  return (
    <ContainerBackgroundImage4 additionalClassNames="h-[44.5px] w-[99.656px]">
      <Paragraph6 />
      <Container15 />
    </ContainerBackgroundImage4>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex h-[53.5px] items-start justify-between left-[18px] top-[70.5px] w-[352px]" data-name="Container">
      <Container14 />
      <Container16 />
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[141px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f7f6f2] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Container13 />
      <Container17 />
    </div>
  );
}

function Container19() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="bg-[#f7f6f2] size-[42px]">
      <TextBackgroundImageAndText text="AA" additionalClassNames="h-[19.5px] w-[17.344px]" />
    </ContainerBackgroundImage1>
  );
}

function Paragraph8() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[#83848b] text-[11px] top-0 w-[81px]">45 shares • 6.1%</p>
    </div>
  );
}

function Container20() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="h-[39.5px]">
      <ParagraphBackgroundImageAndText1 text="AAPL" />
      <Paragraph8 />
    </ContainerBackgroundImage2>
  );
}

function Container21() {
  return (
    <ContainerBackgroundImage3 additionalClassNames="w-[134.102px]">
      <Container19 />
      <Container20 />
    </ContainerBackgroundImage3>
  );
}

function Paragraph9() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[21px] left-[69px] not-italic text-[#2e3a59] text-[14px] text-right top-0 translate-x-[-100%] w-[69px]">$8,029.00</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[18px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] leading-[18px] left-[69.28px] not-italic text-[#441316] text-[12px] text-right top-0 translate-x-[-100%] w-[57px]">↑ +18.77%</p>
    </div>
  );
}

function Container22() {
  return (
    <BackgroundImage3 additionalClassNames="w-[68.703px]">
      <Paragraph9 />
      <Paragraph10 />
    </BackgroundImage3>
  );
}

function Container23() {
  return (
    <ContainerBackgroundImage>
      <Container21 />
      <Container22 />
    </ContainerBackgroundImage>
  );
}

function Container24() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="bg-[#f7f6f2] size-[42px]">
      <TextBackgroundImageAndText text="MS" additionalClassNames="size-[19.5px]" />
    </ContainerBackgroundImage1>
  );
}

function Paragraph11() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[#83848b] text-[11px] top-0 w-[94px]">120 shares • 34.6%</p>
    </div>
  );
}

function Container25() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="h-[39.5px]">
      <ParagraphBackgroundImageAndText1 text="MSFT" />
      <Paragraph11 />
    </ContainerBackgroundImage2>
  );
}

function Container26() {
  return (
    <ContainerBackgroundImage3 additionalClassNames="w-[147.805px]">
      <Container24 />
      <Container25 />
    </ContainerBackgroundImage3>
  );
}

function Paragraph12() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[21px] left-[78px] not-italic text-[#2e3a59] text-[14px] text-right top-0 translate-x-[-100%] w-[78px]">$45,462.00</p>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="h-[18px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] leading-[18px] left-[77.88px] not-italic text-[#441316] text-[12px] text-right top-0 translate-x-[-100%] w-[59px]">↑ +22.01%</p>
    </div>
  );
}

function Container27() {
  return (
    <BackgroundImage3 additionalClassNames="w-[77.078px]">
      <Paragraph12 />
      <Paragraph13 />
    </BackgroundImage3>
  );
}

function Container28() {
  return (
    <ContainerBackgroundImage>
      <Container26 />
      <Container27 />
    </ContainerBackgroundImage>
  );
}

function Paragraph14() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[#83848b] text-[11px] top-0 w-[84px]">85 shares • 9.2%</p>
    </div>
  );
}

function Container29() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="h-[39.5px]">
      <ParagraphBackgroundImageAndText1 text="GOOGL" />
      <Paragraph14 />
    </ContainerBackgroundImage2>
  );
}

function Container30() {
  return (
    <ContainerBackgroundImage3 additionalClassNames="w-[137.383px]">
      <ContainerBackgroundImage5 text="GO" additionalClassNames="h-[19.5px] w-[20.227px]" />
      <Container29 />
    </ContainerBackgroundImage3>
  );
}

function Paragraph15() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[21px] left-[67px] not-italic text-[#2e3a59] text-[14px] text-right top-0 translate-x-[-100%] w-[67px]">$12,125.25</p>
    </div>
  );
}

function Paragraph16() {
  return (
    <div className="h-[18px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] leading-[18px] left-[67.08px] not-italic text-[#441316] text-[12px] text-right top-0 translate-x-[-100%] w-[59px]">↑ +13.39%</p>
    </div>
  );
}

function Container31() {
  return (
    <BackgroundImage3 additionalClassNames="w-[66.125px]">
      <Paragraph15 />
      <Paragraph16 />
    </BackgroundImage3>
  );
}

function Container32() {
  return (
    <ContainerBackgroundImage>
      <Container30 />
      <Container31 />
    </ContainerBackgroundImage>
  );
}

function Paragraph17() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[#83848b] text-[11px] top-0 w-[83px]">72 shares • 13.1%</p>
    </div>
  );
}

function Container33() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="h-[39.5px]">
      <ParagraphBackgroundImageAndText1 text="TSLA" />
      <Paragraph17 />
    </ContainerBackgroundImage2>
  );
}

function Container34() {
  return (
    <ContainerBackgroundImage3 additionalClassNames="w-[136.078px]">
      <ContainerBackgroundImage5 text="TS" additionalClassNames="h-[19.5px] w-[16.617px]" />
      <Container33 />
    </ContainerBackgroundImage3>
  );
}

function Paragraph18() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[21px] left-[66px] not-italic text-[#2e3a59] text-[14px] text-right top-0 translate-x-[-100%] w-[66px]">$17,172.00</p>
    </div>
  );
}

function Paragraph19() {
  return (
    <div className="h-[18px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] leading-[18px] left-[65.94px] not-italic text-[#d93654] text-[12px] text-right top-0 translate-x-[-100%] w-[54px]">↓ -2.65%</p>
    </div>
  );
}

function Container35() {
  return (
    <BackgroundImage3 additionalClassNames="w-[65.75px]">
      <Paragraph18 />
      <Paragraph19 />
    </BackgroundImage3>
  );
}

function Container36() {
  return (
    <ContainerBackgroundImage>
      <Container34 />
      <Container35 />
    </ContainerBackgroundImage>
  );
}

function Container37() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="bg-[#f7f6f2] size-[42px]">
      <TextBackgroundImageAndText text="AM" additionalClassNames="size-[19.5px]" />
    </ContainerBackgroundImage1>
  );
}

function Paragraph20() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[#83848b] text-[11px] top-0 w-[91px]">165 shares • 21.6%</p>
    </div>
  );
}

function Container38() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="h-[39.5px]">
      <ParagraphBackgroundImageAndText1 text="AMZN" />
      <Paragraph20 />
    </ContainerBackgroundImage2>
  );
}

function Container39() {
  return (
    <ContainerBackgroundImage3 additionalClassNames="w-[144.063px]">
      <Container37 />
      <Container38 />
    </ContainerBackgroundImage3>
  );
}

function Paragraph21() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[21px] left-[74px] not-italic text-[#2e3a59] text-[14px] text-right top-0 translate-x-[-100%] w-[74px]">$28,355.25</p>
    </div>
  );
}

function Paragraph22() {
  return (
    <div className="h-[18px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] leading-[18px] left-[74.84px] not-italic text-[#441316] text-[12px] text-right top-0 translate-x-[-100%] w-[58px]">↑ +18.27%</p>
    </div>
  );
}

function Container40() {
  return (
    <BackgroundImage3 additionalClassNames="w-[73.953px]">
      <Paragraph21 />
      <Paragraph22 />
    </BackgroundImage3>
  );
}

function Container41() {
  return (
    <ContainerBackgroundImage>
      <Container39 />
      <Container40 />
    </ContainerBackgroundImage>
  );
}

function Container42() {
  return (
    <ContainerBackgroundImage1 additionalClassNames="bg-[#f7f6f2] size-[42px]">
      <TextBackgroundImageAndText text="NV" additionalClassNames="h-[19.5px] w-[18.063px]" />
    </ContainerBackgroundImage1>
  );
}

function Paragraph23() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[#83848b] text-[11px] top-0 w-[87px]">48 shares • 18.7%</p>
    </div>
  );
}

function Container43() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="h-[39.5px]">
      <ParagraphBackgroundImageAndText1 text="NVDA" />
      <Paragraph23 />
    </ContainerBackgroundImage2>
  );
}

function Container44() {
  return (
    <ContainerBackgroundImage3 additionalClassNames="w-[140.094px]">
      <Container42 />
      <Container43 />
    </ContainerBackgroundImage3>
  );
}

function Paragraph24() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[21px] left-[76px] not-italic text-[#2e3a59] text-[14px] text-right top-0 translate-x-[-100%] w-[76px]">$24,592.80</p>
    </div>
  );
}

function Paragraph25() {
  return (
    <div className="h-[18px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['DM_Sans:Medium',sans-serif] leading-[18px] left-[76.01px] not-italic text-[#441316] text-[12px] text-right top-0 translate-x-[-100%] w-[62px]">↑ +20.33%</p>
    </div>
  );
}

function Container45() {
  return (
    <BackgroundImage3 additionalClassNames="w-[75.336px]">
      <Paragraph24 />
      <Paragraph25 />
    </BackgroundImage3>
  );
}

function Container46() {
  return (
    <div className="h-[70px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[18px] py-0 relative size-full">
          <Container44 />
          <Container45 />
        </div>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="bg-white h-[568px] relative rounded-[20px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container18 />
          <Container23 />
          <Container28 />
          <Container32 />
          <Container36 />
          <Container41 />
          <Container46 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[20px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Container48() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] h-[610px] items-start left-[20px] top-[395.75px] w-[390px]" data-name="Container">
      <Container10 />
      <Container47 />
    </div>
  );
}

function Container49() {
  return <div className="absolute blur-2xl filter left-[268px] rounded-[1.67772e+07px] size-[160px] top-[-40px]" data-name="Container" style={{ backgroundImage: "linear-gradient(135deg, rgba(232, 228, 223, 0.3) 0%, rgba(0, 0, 0, 0) 100%)" }} />;
}

function Container50() {
  return <div className="absolute blur-xl filter left-[-30px] rounded-[1.67772e+07px] size-[140px] top-[56.25px]" data-name="Container" style={{ backgroundImage: "linear-gradient(45deg, rgba(212, 206, 197, 0.25) 0%, rgba(0, 0, 0, 0) 100%)" }} />;
}

function Container51() {
  return <div className="absolute bg-[rgba(240,237,232,0.2)] blur-3xl filter left-[94px] rounded-[1.67772e+07px] size-[200px] top-[-16.88px]" data-name="Container" />;
}

function Container52() {
  return (
    <div className="absolute h-[166.25px] left-0 overflow-clip top-0 w-[388px]" data-name="Container">
      <Container49 />
      <Container50 />
      <Container51 />
    </div>
  );
}

function Paragraph26() {
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

function Icon8() {
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

function Container53() {
  return (
    <div className="absolute h-[52px] left-0 top-[30px] w-[340px]" data-name="Container">
      <Text />
      <Text1 />
      <Icon8 />
    </div>
  );
}

function Icon9() {
  return (
    <IconBackgroundImage additionalClassNames="absolute left-0 top-[4.25px]">
      <path d={svgPaths.p3471a100} id="Vector" stroke="var(--stroke-0, #16A34A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45833" />
      <path d={svgPaths.p1977ee80} id="Vector_2" stroke="var(--stroke-0, #16A34A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45833" />
    </IconBackgroundImage>
  );
}

function Text2() {
  return (
    <div className="absolute h-[22.5px] left-[20px] top-0 w-[71.305px]" data-name="Text">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[22.5px] left-[36px] not-italic text-[#16a34a] text-[15px] text-center top-[0.5px] translate-x-[-50%] w-[72px]">$1,090.00</p>
    </div>
  );
}

function Container54() {
  return (
    <div className="absolute h-[22.5px] left-[124.34px] top-[94px] w-[91.305px]" data-name="Container">
      <Icon9 />
      <Text2 />
    </div>
  );
}

function Container55() {
  return (
    <div className="absolute h-[118.25px] left-[24px] top-[24px] w-[340px]" data-name="Container">
      <Paragraph26 />
      <Container53 />
      <Container54 />
    </div>
  );
}

function Container56() {
  return (
    <div className="absolute border border-[#e5e5e5] border-solid h-[168.25px] left-[20px] overflow-clip rounded-[24px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-0 w-[390px]" data-name="Container" style={{ backgroundImage: "linear-gradient(rgb(250, 250, 250) 0%, rgb(255, 255, 255) 100%), linear-gradient(90deg, rgba(46, 58, 89, 0) 0%, rgba(46, 58, 89, 0) 100%)" }}>
      <Container52 />
      <Container55 />
    </div>
  );
}

function Container57() {
  return (
    <div className="absolute h-[830px] left-0 top-[100px] w-[430px]" data-name="Container">
      <Container3 />
      <Container4 />
      <Container9 />
      <Container48 />
      <Container56 />
    </div>
  );
}

function Paragraph27() {
  return (
    <div className="absolute content-stretch flex h-[17px] items-start left-[21px] top-[16px] w-[54px]" data-name="Paragraph">
      <p className="basis-0 font-['SF_Pro_Text:Semibold',sans-serif] grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[#3a3a3a] text-[14px] text-center tracking-[-0.28px]">9:41</p>
    </div>
  );
}

function Icon10() {
  return (
    <div className="h-[10.672px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[0_0_3.03%_0]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.4922 10.3488">
          <path d={svgPaths.p19fae100} fill="var(--fill-0, #3A3A3A)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="absolute content-stretch flex flex-col h-[10.672px] items-start left-[336.73px] top-[17.66px] w-[19.492px]" data-name="Container">
      <Icon10 />
    </div>
  );
}

function Icon11() {
  return (
    <div className="h-[10.969px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[0_4.55%_0.31%_0]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7565 10.9349">
          <path d={svgPaths.p913040} fill="var(--fill-0, #3A3A3A)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="absolute content-stretch flex flex-col h-[10.969px] items-start left-[361.97px] top-[17.33px] w-[17.555px]" data-name="Container">
      <Icon11 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-[4.17%_2.69%_9.72%_2%]" data-name="Group">
      <div className="absolute inset-[4.17%_14%_9.72%_2%]" data-name="Vector">
        <div className="absolute inset-[-4.91%_-2.35%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.3874 10.713">
            <path d={svgPaths.p1f1b4680} id="Vector" opacity="0.35" stroke="var(--stroke-0, #3A3A3A)" strokeWidth="0.958302" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[30.56%_2.69%_36.11%_92%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.29189 3.77603">
          <path d={svgPaths.p22bf180} fill="var(--fill-0, #3A3A3A)" id="Vector" opacity="0.4" />
        </svg>
      </div>
      <div className="absolute inset-[16.67%_20%_22.22%_8%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5106 6.92272">
          <path d={svgPaths.p300e3780} fill="var(--fill-0, #3A3A3A)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="h-[11.328px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group1 />
    </div>
  );
}

function Container60() {
  return (
    <div className="absolute content-stretch flex flex-col h-[11.328px] items-start left-[391.02px] top-[17.33px] w-[24.32px]" data-name="Container">
      <Icon12 />
    </div>
  );
}

function TopBar() {
  return (
    <div className="absolute h-[44px] left-0 top-0 w-[430px]" data-name="TopBar">
      <Paragraph27 />
      <Container58 />
      <Container59 />
      <Container60 />
    </div>
  );
}

function Icon13() {
  return (
    <IconBackgroundImage1>
      <div className="absolute bottom-[12.5%] left-[37.5%] right-[37.5%] top-1/2" data-name="Vector">
        <div className="absolute inset-[-11.11%_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.33333 10.0833">
            <path d={svgPaths.p2f8014c0} id="Vector" stroke="var(--stroke-0, #83848B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.83333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.34%_12.5%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-5.26%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 19.2495">
            <path d={svgPaths.p38776500} id="Vector" stroke="var(--stroke-0, #83848B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.83333" />
          </svg>
        </div>
      </div>
    </IconBackgroundImage1>
  );
}

function Paragraph28() {
  return (
    <BackgroundImage2 additionalClassNames="h-[15px] opacity-70 w-[31.836px]">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[15px] left-[16px] not-italic text-[#83848b] text-[10px] text-center text-nowrap top-0 tracking-[0.8px] translate-x-[-50%] uppercase">HOME</p>
    </BackgroundImage2>
  );
}

function Button6() {
  return (
    <ButtonBackgroundImage>
      <Icon13 />
      <Paragraph28 />
    </ButtonBackgroundImage>
  );
}

function Icon14() {
  return (
    <IconBackgroundImage1>
      <div className="absolute inset-[29.17%_8.33%_45.83%_66.67%]" data-name="Vector">
        <div className="absolute inset-[-20.83%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.79167 7.79167">
            <path d={svgPaths.p1fa97440} id="Vector" stroke="var(--stroke-0, #441316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.29167" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.17%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-12.5%_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.625 11.4583">
            <path d={svgPaths.p34389da0} id="Vector" stroke="var(--stroke-0, #441316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.29167" />
          </svg>
        </div>
      </div>
    </IconBackgroundImage1>
  );
}

function Paragraph29() {
  return (
    <BackgroundImage2 additionalClassNames="h-[15px] w-[44.82px]">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] leading-[15px] left-[22.5px] not-italic text-[#441316] text-[10px] text-center text-nowrap top-0 tracking-[0.8px] translate-x-[-50%] uppercase">WEALTH</p>
    </BackgroundImage2>
  );
}

function Button7() {
  return (
    <ButtonBackgroundImage>
      <Icon14 />
      <Paragraph29 />
    </ButtonBackgroundImage>
  );
}

function Icon15() {
  return (
    <IconBackgroundImage1>
      <div className="absolute inset-[32.33%]" data-name="Vector">
        <div className="absolute inset-[-11.79%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.60672 9.60672">
            <path d={svgPaths.p168c32f0} id="Vector" stroke="var(--stroke-0, #83848B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.83333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.1667 20.1667">
            <path d={svgPaths.p18832700} id="Vector" stroke="var(--stroke-0, #83848B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.83333" />
          </svg>
        </div>
      </div>
    </IconBackgroundImage1>
  );
}

function Paragraph30() {
  return (
    <BackgroundImage2 additionalClassNames="h-[15px] opacity-70 w-[54.352px]">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[15px] left-[27px] not-italic text-[#83848b] text-[10px] text-center text-nowrap top-0 tracking-[0.8px] translate-x-[-50%] uppercase">DISCOVER</p>
    </BackgroundImage2>
  );
}

function Button8() {
  return (
    <ButtonBackgroundImage>
      <Icon15 />
      <Paragraph30 />
    </ButtonBackgroundImage>
  );
}

function Icon16() {
  return (
    <IconBackgroundImage1>
      <BackgroundImage1 additionalClassNames="absolute inset-[45.83%]" />
      <Icon16VectorBackgroundImage additionalClassNames="left-3/4 right-[16.67%]" />
      <Icon16VectorBackgroundImage additionalClassNames="left-[16.67%] right-3/4" />
    </IconBackgroundImage1>
  );
}

function Paragraph31() {
  return (
    <BackgroundImage2 additionalClassNames="h-[15px] opacity-70 w-[30.961px]">
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[15px] left-[15.5px] not-italic text-[#83848b] text-[10px] text-center text-nowrap top-0 tracking-[0.8px] translate-x-[-50%] uppercase">MORE</p>
    </BackgroundImage2>
  );
}

function Button9() {
  return (
    <ButtonBackgroundImage>
      <Icon16 />
      <Paragraph31 />
    </ButtonBackgroundImage>
  );
}

function Container61() {
  return (
    <div className="h-[65px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[38.75px] py-0 relative size-full">
          <Button6 />
          <Button7 />
          <Button8 />
          <Button9 />
        </div>
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col h-[66px] items-start left-0 pb-0 pt-px px-0 top-[866px] w-[430px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e5e5] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <Container61 />
    </div>
  );
}

export default function ClientEnvironment() {
  return (
    <div className="bg-white relative shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-full" data-name="ClientEnvironment">
      <Container1 />
      <Container57 />
      <TopBar />
      <Container62 />
    </div>
  );
}