import svgPaths from "./svg-yrvdsff9a8";

export default function Frame() {
  return (
    <div className="bg-[#ff7e7e] relative rounded-[50px] size-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[6px] items-center justify-center px-[8px] py-[10px] relative size-full">
          <div className="flex items-center justify-center relative shrink-0 size-[8px]" style={{ "--transform-inner-width": "300", "--transform-inner-height": "150" } as React.CSSProperties}>
            <div className="flex-none rotate-[90deg]">
              <div className="relative size-[8px]" data-name="Vector">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                  <path d={svgPaths.pa98f300} fill="var(--fill-0, #560303)" id="Vector" />
                </svg>
              </div>
            </div>
          </div>
          <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#560303] text-[12px] text-nowrap">$2,210.1 (+2.44%)</p>
        </div>
      </div>
    </div>
  );
}