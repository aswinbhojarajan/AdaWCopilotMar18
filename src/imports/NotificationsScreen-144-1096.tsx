import svgPaths from "./svg-d4bcih55b3";
import clsx from "clsx";

function Container53({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[32px] relative shrink-0 w-[371px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">{children}</div>
    </div>
  );
}

function Container52({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow h-[32px] min-h-px min-w-px relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">{children}</div>
    </div>
  );
}
type Wrapper3Props = {
  additionalClassNames?: string;
};

function Wrapper3({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper3Props>) {
  return (
    <div className={clsx("relative rounded-[1.67772e+07px] shrink-0 size-[32px]", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">{children}</div>
    </div>
  );
}
type Wrapper2Props = {
  additionalClassNames?: string;
};

function Wrapper2({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper2Props>) {
  return (
    <div className={clsx("h-[14.5px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">{children}</div>
    </div>
  );
}

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[371px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}

function Paragraph12({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper1>
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#667085] text-[13px] top-[0.5px] w-[367px]">{children}</p>
    </Wrapper1>
  );
}

function Paragraph11({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper1>
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#667085] text-[13px] top-[0.5px] w-[362px]">{children}</p>
    </Wrapper1>
  );
}

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}

function Container36() {
  return (
    <Wrapper2 additionalClassNames="w-[66.055px]">
      <Icon5 />
      <ParagraphText1 text="Yesterday" />
    </Wrapper2>
  );
}

function Container27() {
  return (
    <Wrapper3 additionalClassNames="bg-[#fce7e8]">
      <Icon8 />
    </Wrapper3>
  );
}

function Icon8() {
  return (
    <Wrapper>
      <path d="M5.33333 1.33333V4" id="Vector" stroke="var(--stroke-0, #441316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M10.6667 1.33333V4" id="Vector_2" stroke="var(--stroke-0, #441316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d={svgPaths.p3ee34580} id="Vector_3" stroke="var(--stroke-0, #441316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M2 6.66667H14" id="Vector_4" stroke="var(--stroke-0, #441316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Wrapper>
  );
}

function Container17() {
  return (
    <Wrapper3 additionalClassNames="bg-[#d1fae5]">
      <Icon6 />
    </Wrapper3>
  );
}

function Icon6() {
  return (
    <Wrapper>
      <path d={svgPaths.p18577c80} id="Vector" stroke="var(--stroke-0, #059669)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M6 12H10" id="Vector_2" stroke="var(--stroke-0, #059669)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M6.66667 14.6667H9.33333" id="Vector_3" stroke="var(--stroke-0, #059669)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Wrapper>
  );
}
type ParagraphText2Props = {
  text: string;
};

function ParagraphText2({ text }: ParagraphText2Props) {
  return (
    <div className="h-[20px] relative shrink-0 w-[371px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['DM_Sans:Medium',sans-serif] leading-[20px] left-0 not-italic text-[#3a3a3a] text-[14px] text-nowrap top-[-0.5px]">{text}</p>
      </div>
    </div>
  );
}
type ParagraphText1Props = {
  text: string;
};

function ParagraphText1({ text }: ParagraphText1Props) {
  return (
    <div className="basis-0 grow h-[14.5px] min-h-px min-w-px relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#98989d] text-[11px] text-nowrap">{text}</p>
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[12px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_144_1142)" id="Icon">
          <path d={svgPaths.p3e7757b0} id="Vector" stroke="var(--stroke-0, #98989D)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 3V6L8 7" id="Vector_2" stroke="var(--stroke-0, #98989D)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_144_1142">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
type ParagraphTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ParagraphText({ text, additionalClassNames = "" }: ParagraphTextProps) {
  return (
    <div className={clsx("absolute content-stretch flex h-[15.5px] items-start left-[8px] top-[4.25px]", additionalClassNames)}>
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#441316] text-[12px] text-center text-nowrap">{text}</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute content-stretch flex h-[17px] items-start left-[21px] top-[16px] w-[54px]" data-name="Paragraph">
      <p className="basis-0 font-['SF_Pro_Text:Semibold',sans-serif] grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[#3a3a3a] text-[14px] text-center tracking-[-0.28px]">9:41</p>
    </div>
  );
}

function Icon() {
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

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col h-[10.672px] items-start left-[336.73px] top-[17.66px] w-[19.492px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Icon1() {
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

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[10.969px] items-start left-[361.97px] top-[17.33px] w-[17.555px]" data-name="Container">
      <Icon1 />
    </div>
  );
}

function Group() {
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

function Icon2() {
  return (
    <div className="h-[11.328px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col h-[11.328px] items-start left-[391.02px] top-[17.33px] w-[24.32px]" data-name="Container">
      <Icon2 />
    </div>
  );
}

function TopBar() {
  return (
    <div className="absolute h-[44px] left-0 top-[16px] w-[430px]" data-name="TopBar">
      <Paragraph />
      <Container />
      <Container1 />
      <Container2 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-[2.38%_83.85%_2.38%_0.77%]" data-name="Group">
      <div className="absolute inset-[2.38%_83.85%_2.38%_0.77%]" data-name="Vector">
        <div className="absolute inset-[-2.54%_-4.92%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8145 20.016">
            <path d={svgPaths.p3682d300} id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.968364" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col h-[20px] items-start relative shrink-0 w-[64px]" data-name="Container">
      <Icon3 />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute content-stretch flex flex-col h-[20px] items-start left-0 top-[4px] w-[10px]" data-name="Button">
      <Container3 />
    </div>
  );
}

function Container4() {
  return <div className="absolute h-[20px] left-[318px] top-[4px] w-[64px]" data-name="Container" />;
}

function ChatHeader() {
  return (
    <div className="absolute h-[28px] left-[24px] top-[68px] w-[382px]" data-name="ChatHeader">
      <Button />
      <Container4 />
      <p className="absolute font-['RL_Limo:Regular',sans-serif] leading-[24px] left-[190.5px] not-italic text-[#441316] text-[16px] text-center text-nowrap top-0 translate-x-[-50%]">Notifications</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-[#f7f6f2] h-[101px] relative shrink-0 w-full" data-name="Container">
      <TopBar />
      <ChatHeader />
    </div>
  );
}

function Container6() {
  return <div className="absolute border-[#441316] border-[0.5px] border-solid h-[24px] left-0 rounded-[50px] top-0 w-[29.32px]" data-name="Container" />;
}

function Tag() {
  return (
    <div className="absolute h-[24px] left-[10px] rounded-[50px] top-0 w-[29.32px]" data-name="Tag">
      <Container6 />
      <ParagraphText text="All" additionalClassNames="w-[13.32px]" />
    </div>
  );
}

function Container7() {
  return <div className="absolute border-[#441316] border-[0.5px] border-solid h-[24px] left-0 rounded-[50px] top-0 w-[48.633px]" data-name="Container" />;
}

function Tag1() {
  return (
    <div className="absolute h-[24px] left-[47.32px] opacity-50 rounded-[50px] top-0 w-[48.633px]" data-name="Tag">
      <Container7 />
      <ParagraphText text="Alerts" additionalClassNames="w-[32.633px]" />
    </div>
  );
}

function Container8() {
  return <div className="absolute border-[#441316] border-[0.5px] border-solid h-[24px] left-0 rounded-[50px] top-0 w-[93.68px]" data-name="Container" />;
}

function Tag2() {
  return (
    <div className="absolute h-[24px] left-[103.95px] opacity-50 rounded-[50px] top-0 w-[93.68px]" data-name="Tag">
      <Container8 />
      <ParagraphText text="Opportunities" additionalClassNames="w-[77.68px]" />
    </div>
  );
}

function Container9() {
  return <div className="absolute border-[#441316] border-[0.5px] border-solid h-[24px] left-0 rounded-[50px] top-0 w-[62.656px]" data-name="Container" />;
}

function Tag3() {
  return (
    <div className="absolute h-[24px] left-[205.63px] opacity-50 rounded-[50px] top-0 w-[62.656px]" data-name="Tag">
      <Container9 />
      <ParagraphText text="Updates" additionalClassNames="w-[46.656px]" />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute h-[24px] left-0 overflow-clip top-0 w-[403px]" data-name="Container">
      <Tag />
      <Tag1 />
      <Tag2 />
      <Tag3 />
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[24px] relative shrink-0 w-[403px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <Container10 />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <Wrapper>
      <path d={svgPaths.p388158b0} id="Vector" stroke="var(--stroke-0, #D97706)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M8 6V8.66667" id="Vector_2" stroke="var(--stroke-0, #D97706)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M8 11.3333H8.00667" id="Vector_3" stroke="var(--stroke-0, #D97706)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Wrapper>
  );
}

function Container12() {
  return (
    <Wrapper3 additionalClassNames="bg-[#fef3c7]">
      <Icon4 />
    </Wrapper3>
  );
}

function Container13() {
  return <div className="bg-[#441316] rounded-[1.67772e+07px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container14() {
  return (
    <Container52>
      <Container12 />
      <Container13 />
    </Container52>
  );
}

function Container15() {
  return (
    <Wrapper2 additionalClassNames="w-[68.805px]">
      <Icon5 />
      <ParagraphText1 text="12 min ago" />
    </Wrapper2>
  );
}

function Container16() {
  return (
    <Container53>
      <Container14 />
      <Container15 />
    </Container53>
  );
}

function Paragraph1() {
  return (
    <Wrapper1>
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#667085] text-[13px] top-[0.5px] w-[349px]">Your tech sector allocation has reached 48%, which is 8% above your target range. Consider rebalancing to maintain your risk profile.</p>
    </Wrapper1>
  );
}

function NotificationItem() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[12px] h-[162px] items-start left-0 pl-[16px] pr-0 py-[16px] rounded-[12px] top-0 w-[403px]" data-name="NotificationItem">
      <Container16 />
      <ParagraphText2 text="Portfolio concentration exceeded target range" />
      <Paragraph1 />
    </div>
  );
}

function Container18() {
  return <div className="bg-[#441316] rounded-[1.67772e+07px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container19() {
  return (
    <Container52>
      <Container17 />
      <Container18 />
    </Container52>
  );
}

function Container20() {
  return (
    <Wrapper2 additionalClassNames="w-[66.938px]">
      <Icon5 />
      <ParagraphText1 text="1 hour ago" />
    </Wrapper2>
  );
}

function Container21() {
  return (
    <Container53>
      <Container19 />
      <Container20 />
    </Container53>
  );
}

function Paragraph2() {
  return <Paragraph11>{`We've identified $47,000 in unrealized losses that could offset your capital gains this year, potentially saving $12,000 in taxes.`}</Paragraph11>;
}

function NotificationItem1() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[12px] h-[162px] items-start left-0 pl-[16px] pr-0 py-[16px] rounded-[12px] top-[170px] w-[403px]" data-name="NotificationItem">
      <Container21 />
      <ParagraphText2 text="Tax-loss harvesting opportunity identified" />
      <Paragraph2 />
    </div>
  );
}

function Icon7() {
  return (
    <Wrapper>
      <path d={svgPaths.p1e6eff00} id="Vector" stroke="var(--stroke-0, #441316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d={svgPaths.p5baad20} id="Vector_2" stroke="var(--stroke-0, #441316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Wrapper>
  );
}

function Container22() {
  return (
    <Wrapper3 additionalClassNames="bg-[#fce7e8]">
      <Icon7 />
    </Wrapper3>
  );
}

function Container23() {
  return <div className="bg-[#441316] rounded-[1.67772e+07px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container24() {
  return (
    <Container52>
      <Container22 />
      <Container23 />
    </Container52>
  );
}

function Container25() {
  return (
    <Wrapper2 additionalClassNames="w-[75.359px]">
      <Icon5 />
      <ParagraphText1 text="2 hours ago" />
    </Wrapper2>
  );
}

function Container26() {
  return (
    <Container53>
      <Container24 />
      <Container25 />
    </Container53>
  );
}

function Paragraph3() {
  return <Paragraph12>{`Hi Sarah, I've reviewed your Q4 performance. Let's schedule a call to discuss rebalancing strategies for the new year.`}</Paragraph12>;
}

function NotificationItem2() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[12px] h-[144px] items-start left-0 pl-[16px] pr-0 py-[16px] rounded-[12px] top-[340px] w-[403px]" data-name="NotificationItem">
      <Container26 />
      <ParagraphText2 text="Message from your advisor" />
      <Paragraph3 />
    </div>
  );
}

function Container28() {
  return (
    <Wrapper2 additionalClassNames="w-[75.703px]">
      <Icon5 />
      <ParagraphText1 text="4 hours ago" />
    </Wrapper2>
  );
}

function Container29() {
  return (
    <Container53>
      <Container27 />
      <Container28 />
    </Container53>
  );
}

function Paragraph4() {
  return (
    <Wrapper1>
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#667085] text-[13px] top-[0.5px] w-[365px]">Join us tomorrow at 3:00 PM GST for an exclusive session on private equity opportunities in emerging markets.</p>
    </Wrapper1>
  );
}

function NotificationItem3() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[12px] h-[144px] items-start left-0 pl-[16px] pr-0 py-[16px] rounded-[12px] top-[492px] w-[403px]" data-name="NotificationItem">
      <Container29 />
      <ParagraphText2 text="Upcoming: Alternative Investments Webinar" />
      <Paragraph4 />
    </div>
  );
}

function Icon9() {
  return (
    <Wrapper>
      <path d={svgPaths.p3155f180} id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d={svgPaths.pea6a680} id="Vector_2" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Wrapper>
  );
}

function Container30() {
  return (
    <Wrapper3 additionalClassNames="bg-[#e5e5e5]">
      <Icon9 />
    </Wrapper3>
  );
}

function Container31() {
  return (
    <Wrapper2 additionalClassNames="w-[75.945px]">
      <Icon5 />
      <ParagraphText1 text="6 hours ago" />
    </Wrapper2>
  );
}

function Container32() {
  return (
    <Container53>
      <Container30 />
      <Container31 />
    </Container53>
  );
}

function Paragraph5() {
  return (
    <Wrapper1>
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#667085] text-[13px] top-[0.5px] w-[341px]">The Fed maintained its cautious stance, keeping rates unchanged through Q2 2026. This may impact your fixed income holdings.</p>
    </Wrapper1>
  );
}

function NotificationItem4() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[12px] h-[162px] items-start left-0 pl-[16px] pr-0 py-[16px] rounded-[12px] top-[644px] w-[403px]" data-name="NotificationItem">
      <Container32 />
      <ParagraphText2 text="Federal Reserve signals pause on rate cuts" />
      <Paragraph5 />
    </div>
  );
}

function Icon10() {
  return (
    <Wrapper>
      <path d={svgPaths.p19416e00} id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d={svgPaths.p3e059a80} id="Vector_2" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M6.66667 6H5.33333" id="Vector_3" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M10.6667 8.66667H5.33333" id="Vector_4" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M10.6667 11.3333H5.33333" id="Vector_5" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Wrapper>
  );
}

function Container33() {
  return (
    <Wrapper3 additionalClassNames="bg-[#e5e5e5]">
      <Icon10 />
    </Wrapper3>
  );
}

function Container34() {
  return (
    <Wrapper2 additionalClassNames="w-[75.727px]">
      <Icon5 />
      <ParagraphText1 text="8 hours ago" />
    </Wrapper2>
  );
}

function Container35() {
  return (
    <Container53>
      <Container33 />
      <Container34 />
    </Container53>
  );
}

function Paragraph6() {
  return (
    <Wrapper1>
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#667085] text-[13px] top-[0.5px] w-[352px]">Your quarterly performance report is now available. Review your returns, asset allocation, and personalized recommendations.</p>
    </Wrapper1>
  );
}

function NotificationItem5() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[12px] h-[162px] items-start left-0 pl-[16px] pr-0 py-[16px] rounded-[12px] top-[814px] w-[403px]" data-name="NotificationItem">
      <Container35 />
      <ParagraphText2 text="Q4 2025 Portfolio Report ready" />
      <Paragraph6 />
    </div>
  );
}

function Container37() {
  return (
    <Container53>
      <Container17 />
      <Container36 />
    </Container53>
  );
}

function Paragraph7() {
  return <Paragraph12>High-quality sovereign debt in stable economies now offers attractive income. Your current fixed income allocation could benefit from diversification.</Paragraph12>;
}

function NotificationItem6() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[12px] h-[162px] items-start left-0 pl-[16px] pr-0 py-[16px] rounded-[12px] top-[984px] w-[403px]" data-name="NotificationItem">
      <Container37 />
      <ParagraphText2 text="Emerging market bonds offer 6.8% yields" />
      <Paragraph7 />
    </div>
  );
}

function Icon11() {
  return (
    <Wrapper>
      <path d={svgPaths.p293dc0c0} id="Vector" stroke="var(--stroke-0, #D97706)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M8 6V8.66667" id="Vector_2" stroke="var(--stroke-0, #D97706)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M8 11.3333H8.00667" id="Vector_3" stroke="var(--stroke-0, #D97706)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Wrapper>
  );
}

function Container38() {
  return (
    <Wrapper3 additionalClassNames="bg-[#fef3c7]">
      <Icon11 />
    </Wrapper3>
  );
}

function Container39() {
  return (
    <Container53>
      <Container38 />
      <Container36 />
    </Container53>
  );
}

function Paragraph8() {
  return (
    <Wrapper1>
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#667085] text-[13px] top-[0.5px] w-[344px]">Your AI and semiconductor positions have outperformed. Consider taking profits to lock in gains while maintaining growth exposure.</p>
    </Wrapper1>
  );
}

function NotificationItem7() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[12px] h-[162px] items-start left-0 pl-[16px] pr-0 py-[16px] rounded-[12px] top-[1154px] w-[403px]" data-name="NotificationItem">
      <Container39 />
      <ParagraphText2 text="Tech sector holdings up 12% this quarter" />
      <Paragraph8 />
    </div>
  );
}

function Container40() {
  return (
    <Wrapper2 additionalClassNames="w-[70.648px]">
      <Icon5 />
      <ParagraphText1 text="2 days ago" />
    </Wrapper2>
  );
}

function Container41() {
  return (
    <Container53>
      <Container27 />
      <Container40 />
    </Container53>
  );
}

function Paragraph9() {
  return (
    <Wrapper1>
      <p className="absolute font-['DM_Sans:Regular',sans-serif] leading-[18px] left-0 not-italic text-[#667085] text-[13px] top-[0.5px] w-[356px]">Your scheduled consultation with our estate planning specialist is tomorrow at 2:00 PM. Meeting link sent to your email.</p>
    </Wrapper1>
  );
}

function NotificationItem8() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[12px] h-[162px] items-start left-0 pl-[16px] pr-0 py-[16px] rounded-[12px] top-[1324px] w-[403px]" data-name="NotificationItem">
      <Container41 />
      <ParagraphText2 text="Reminder: Estate planning consultation" />
      <Paragraph9 />
    </div>
  );
}

function Container42() {
  return (
    <Wrapper2 additionalClassNames="w-[70.82px]">
      <Icon5 />
      <ParagraphText1 text="3 days ago" />
    </Wrapper2>
  );
}

function Container43() {
  return (
    <Container53>
      <Container17 />
      <Container42 />
    </Container53>
  );
}

function Paragraph10() {
  return <Paragraph11>Private equity and infrastructure investments have demonstrated 23% lower correlation to public markets, ideal for portfolio diversification.</Paragraph11>;
}

function NotificationItem9() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[12px] h-[162px] items-start left-0 pl-[16px] pr-0 py-[16px] rounded-[12px] top-[1494px] w-[403px]" data-name="NotificationItem">
      <Container43 />
      <ParagraphText2 text="Alternative investments showing low correlation" />
      <Paragraph10 />
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[1656px] relative shrink-0 w-[403px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <NotificationItem />
        <NotificationItem1 />
        <NotificationItem2 />
        <NotificationItem3 />
        <NotificationItem4 />
        <NotificationItem5 />
        <NotificationItem6 />
        <NotificationItem7 />
        <NotificationItem8 />
        <NotificationItem9 />
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[1803px] relative shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start pl-[6px] pr-0 py-0 relative size-full">
          <Container11 />
          <Container44 />
        </div>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="h-[650px] relative shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pb-0 pl-0 pr-[15px] pt-[16px] relative size-full">
          <Container45 />
        </div>
      </div>
    </div>
  );
}

function Container47() {
  return <div className="absolute bg-[rgba(243,244,246,0.4)] h-[68px] left-[8px] rounded-[50px] top-0 w-[414px]" data-name="Container" />;
}

function Frame() {
  return (
    <div className="absolute contents inset-0">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <path d={svgPaths.p132def80} fill="var(--fill-0, white)" fillOpacity="0.9" id="Vector" />
      </svg>
      <div className="absolute inset-[30.63%_30.03%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.575 17.05">
          <path d={svgPaths.p38a73180} fill="var(--fill-0, #555555)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="h-[44px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Frame />
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[16px] size-[44px] top-[12px]" data-name="Button">
      <Icon12 />
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute content-stretch flex h-[24px] items-center left-[20px] opacity-50 overflow-clip top-[10px] w-[228px]" data-name="Text Input">
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.5)] text-nowrap">Ask anything</p>
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.p2a474700} id="Vector" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
          <path d={svgPaths.p2f421100} id="Vector_2" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
          <path d="M9 14.25V16.5" id="Vector_3" stroke="var(--stroke-0, #555555)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[256px] size-[18px] top-[13px]" data-name="Button">
      <Icon13 />
    </div>
  );
}

function Container48() {
  return (
    <div className="h-[44px] overflow-clip relative rounded-[23.321px] shrink-0 w-full" data-name="Container">
      <TextInput />
      <Button2 />
    </div>
  );
}

function Container49() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.9)] content-stretch flex flex-col h-[44px] items-start left-[68px] rounded-[23.321px] top-[12px] w-[294px]" data-name="Container">
      <Container48 />
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p32002100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 15.8333V4.16667" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-[#441316] content-stretch flex items-center justify-center left-[370px] opacity-50 rounded-[1.67772e+07px] size-[44px] top-[12px]" data-name="Button">
      <Icon14 />
    </div>
  );
}

function Container50() {
  return (
    <div className="absolute h-[68px] left-0 top-0 w-[430px]" data-name="Container">
      <Container47 />
      <Button1 />
      <Container49 />
      <Button3 />
    </div>
  );
}

function Container51() {
  return <div className="absolute bg-[#555] h-[5px] left-[148.5px] rounded-[100px] top-[88px] w-[134px]" data-name="Container" />;
}

function BottomBar() {
  return (
    <div className="h-[102px] relative shrink-0 w-full" data-name="BottomBar">
      <Container50 />
      <Container51 />
    </div>
  );
}

export default function NotificationsScreen() {
  return (
    <div className="bg-[#efede6] content-stretch flex flex-col items-start relative shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-full" data-name="NotificationsScreen">
      <Container5 />
      <Container46 />
      <BottomBar />
    </div>
  );
}