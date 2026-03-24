import React from 'react';
import svgPaths from '../../imports/svg-npbkfwfylb';

export function TopBar() {
  return (
    <div className="h-[44px] relative shrink-0 w-full">
      {/* Time */}
      <div className="absolute h-[21px] left-[21px] top-[13px] w-[54px]">
        <p className="absolute font-['DM_Sans',sans-serif] font-semibold leading-[normal] left-[27px] not-italic text-[#3a3a3a] text-[14px] text-center top-[calc(50%-7.5px)] tracking-[-0.28px] translate-x-[-50%] w-[54px]">
          9:41
        </p>
      </div>

      {/* Cellular Connection */}
      <div className="absolute inset-[40.15%_17.16%_35.61%_78.31%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 11">
          <path d={svgPaths.p26d17600} fill="#3A3A3A" />
        </svg>
      </div>

      {/* Wifi */}
      <div className="absolute inset-[39.39%_11.74%_35.69%_84.18%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
          <path d={svgPaths.p3d78f640} fill="#3A3A3A" />
        </svg>
      </div>

      {/* Battery */}
      <div className="absolute h-[11.333px] right-[14.67px] top-[17.33px] w-[24.328px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 12">
          <g>
            <rect
              height="10.3333"
              opacity="0.35"
              rx="2.16667"
              stroke="#3A3A3A"
              width="21"
              x="0.5"
              y="0.5"
            />
            <path d={svgPaths.p9ed9280} fill="#3A3A3A" opacity="0.4" />
            <rect fill="#3A3A3A" height="7.33333" rx="1.33333" width="18" x="2" y="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}
