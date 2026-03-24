import React, { useState } from 'react';

interface LineChartProps {
  data: { value: number; label: string }[];
  height?: number;
  color?: string;
  fillColor?: string;
  showGrid?: boolean;
  showLabels?: boolean;
}

export function LineChart({
  data,
  height = 200,
  color = '#441316',
  fillColor = 'rgba(68, 19, 22, 0.05)',
  showGrid = true,
  showLabels = true,
}: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length < 2) return null;

  const _width = 100; // percentage
  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Generate path for line
  const pathPoints = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = padding.top + (1 - (point.value - min) / range) * chartHeight;
    return `${x}% ${y}px`;
  });

  const linePath = pathPoints.map((point, i) => (i === 0 ? `M ${point}` : `L ${point}`)).join(' ');

  const areaPath = `${linePath} L 100% ${height - padding.bottom}px L 0% ${height - padding.bottom}px Z`;

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <svg
        width="100%"
        height="100%"
        className="overflow-visible"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Grid lines */}
        {showGrid && (
          <g opacity="0.1">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = padding.top + chartHeight * ratio;
              return (
                <line key={i} x1="0%" y1={y} x2="100%" y2={y} stroke="#555555" strokeWidth="0.5" />
              );
            })}
          </g>
        )}

        {/* Area fill */}
        <path d={areaPath} fill={fillColor} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = padding.top + (1 - (point.value - min) / range) * chartHeight;
          const isHovered = hoveredIndex === index;

          return (
            <g key={index}>
              <circle
                cx={`${x}%`}
                cy={y}
                r={isHovered ? 5 : 0}
                fill="#ffffff"
                stroke={color}
                strokeWidth="2"
                style={{ transition: 'r 0.2s' }}
              />
            </g>
          );
        })}
      </svg>

      {/* Interactive overlay for hover */}
      <div className="absolute inset-0 flex">
        {data.map((point, index) => (
          <div
            key={index}
            className="flex-1 relative cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {hoveredIndex === index && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-[8px] px-[8px] py-[4px] shadow-lg whitespace-nowrap z-10">
                <p className="font-['DM_Sans',sans-serif] font-semibold text-[#555555] text-[0.75rem]">
                  ${point.value.toLocaleString()}
                </p>
                <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.625rem] opacity-60">
                  {point.label}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      {showLabels && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-[10px]">
          {[data[0], data[Math.floor(data.length / 2)], data[data.length - 1]].map((point, i) => (
            <p
              key={i}
              className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.625rem] opacity-50"
            >
              {point.label}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
