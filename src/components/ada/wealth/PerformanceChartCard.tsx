import React, { useState } from 'react';
import { LineChart } from '../charts/LineChart';
import { Tag } from '../Tag';

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y';

interface PerformanceChartCardProps {
  defaultTimeFrame?: TimeFrame;
}

// Mock performance data
const performanceData = {
  '1D': [
    { value: 130200, label: '9am' },
    { value: 130500, label: '12pm' },
    { value: 130800, label: '3pm' },
    { value: 131230, label: '6pm' },
  ],
  '1W': [
    { value: 128500, label: 'Mon' },
    { value: 129100, label: 'Tue' },
    { value: 129800, label: 'Wed' },
    { value: 130500, label: 'Thu' },
    { value: 131230, label: 'Fri' },
  ],
  '1M': [
    { value: 125000, label: '11/12' },
    { value: 126500, label: '11/19' },
    { value: 125800, label: '11/26' },
    { value: 127200, label: '12/03' },
    { value: 128500, label: '12/10' },
    { value: 131230, label: '12/12' },
  ],
  '3M': [
    { value: 115000, label: 'Sep' },
    { value: 118500, label: 'Oct' },
    { value: 125000, label: 'Nov' },
    { value: 131230, label: 'Dec' },
  ],
  '1Y': [
    { value: 98000, label: 'Jan' },
    { value: 102000, label: 'Mar' },
    { value: 108000, label: 'May' },
    { value: 115000, label: 'Jul' },
    { value: 122000, label: 'Sep' },
    { value: 131230, label: 'Dec' },
  ],
};

export function PerformanceChartCard({ defaultTimeFrame = '1M' }: PerformanceChartCardProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(defaultTimeFrame);
  const timeFrames: TimeFrame[] = ['1D', '1W', '1M', '3M', '1Y'];

  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          {/* Header */}
          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <p className="font-['DM_Sans',sans-serif] font-semibold not-italic relative shrink-0 text-[#992929] text-[0.625rem] tracking-[0.8px] uppercase">
              PORTFOLIO PERFORMANCE
            </p>

            <p className="font-['Crimson_Pro',sans-serif] relative shrink-0 text-[#555555] tracking-[-0.48px] w-full">
              Track your wealth growth over time
            </p>
          </div>

          {/* Time Frame Selector */}
          <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full flex-wrap">
            {timeFrames.map((tf) => (
              <Tag key={tf} active={timeFrame === tf} onClick={() => setTimeFrame(tf)}>
                {tf}
              </Tag>
            ))}
          </div>

          {/* Chart */}
          <div className="content-stretch relative shrink-0 w-full">
            <LineChart
              data={performanceData[timeFrame]}
              height={220}
              color="#441316"
              fillColor="rgba(68, 19, 22, 0.05)"
              showGrid={true}
              showLabels={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
