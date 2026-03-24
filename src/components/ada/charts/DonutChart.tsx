import React from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  segments,
  size = 140,
  strokeWidth = 20,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  // Calculate angular compensation for rounded linecaps
  // Rounded caps extend by strokeWidth/2 in the perpendicular direction
  // We need to reduce arc length to prevent visual overlap
  const capCompensation = (strokeWidth / (2 * radius)) * (180 / Math.PI);

  // Helper function to convert polar to cartesian coordinates
  const polarToCartesian = (angleInDegrees: number, r: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: center + r * Math.cos(angleInRadians),
      y: center + r * Math.sin(angleInRadians),
    };
  };

  // Helper function to create an arc path
  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(' ');
  };

  let currentAngle = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        {/* Segments as distinct arcs with rounded ends */}
        {segments.map((segment, index) => {
          const percentage = segment.value / total;
          const segmentDegrees = percentage * 360;

          // For small segments, use minimal compensation to ensure visibility
          const compensation = segmentDegrees < 10 ? capCompensation * 0.5 : capCompensation;

          // Add extra reduction to the first segment (Stocks) to prevent overlap with last segment
          const extraReduction = index === 0 ? 2 : 0;
          const adjustedSegmentDegrees = Math.max(
            segmentDegrees - 2 * compensation - extraReduction,
            1,
          );

          const startAngle = currentAngle + compensation;
          const endAngle = startAngle + adjustedSegmentDegrees;

          currentAngle += segmentDegrees;

          return (
            <path
              key={index}
              d={describeArc(startAngle, endAngle)}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{
                transition: 'all 0.3s ease',
              }}
            />
          );
        })}
      </svg>

      {/* Center content */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <p className="font-['Crimson_Pro',sans-serif] font-extralight text-[#555555] tracking-[-0.48px] text-[1.5rem]">
              {centerValue}
            </p>
          )}
          {centerLabel && (
            <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.75rem] opacity-60">
              {centerLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
