import svgPaths from "./svg-0exu9iqdrk";
import clsx from "clsx";
import { imgEllipse3627 } from "./svg-u4znp";
type Group1000011033HelperProps = {
  additionalClassNames?: string;
};

function Group1000011033Helper({ children, additionalClassNames = "" }: React.PropsWithChildren<Group1000011033HelperProps>) {
  return (
    <div style={{ maskImage: `url('${imgEllipse3627}')` }} className={clsx("absolute mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-size-[36px_36px]", additionalClassNames)}>
      <div className="absolute inset-[-2.66%]">{children}</div>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[27.31%_26.65%_28.42%_28.48%]">
      <Group1000011033Helper additionalClassNames="inset-[27.31%_27.25%_28.42%_28.48%] mask-position-[-10.252px_-9.831px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7848 16.7848">
          <path d={svgPaths.p2537ed00} id="Ellipse 3627" stroke="var(--stroke-0, #FEFEF8)" strokeWidth="0.84746" />
        </svg>
      </Group1000011033Helper>
      <Group1000011033Helper additionalClassNames="inset-[27.31%_26.65%_28.42%_29.08%] mask-position-[-10.47px_-9.831px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7847 16.7848">
          <path d={svgPaths.p28a4f080} id="Ellipse 3628" stroke="var(--stroke-0, #FEFEF8)" strokeWidth="0.84746" />
        </svg>
      </Group1000011033Helper>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-0">
      <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-0.001px] mask-size-[36px_36px]" style={{ maskImage: `url('${imgEllipse3627}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 36">
          <path d={svgPaths.p11f24a00} fill="var(--fill-0, #441316)" id="Ellipse 3622" />
        </svg>
      </div>
      <Group2 />
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="absolute contents inset-0" data-name="Clip path group">
      <Group1 />
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

export default function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col items-start relative rounded-[18px] shadow-[0px_0px_1.834px_0.55px_rgba(68,19,22,0)] size-full" data-name="Button">
      <Group />
    </div>
  );
}