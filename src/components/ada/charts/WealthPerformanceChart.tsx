import React, { useState, useRef, useEffect } from 'react';
import { Tag } from '../Tag';

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y';

interface WealthPerformanceChartProps {
  /** Chart title displayed in header */
  title?: string;

  /** Summary metric to display in top-right of header (e.g., "+2.4%") */
  summaryMetric?: {
    value: string;
    isPositive: boolean;
  };

  /** Performance data for each time frame */
  data: Record<string, { value: number; label: string }[]>;

  /** Default time frame to show */
  defaultTimeFrame?: TimeFrame;

  /** Chart height in pixels */
  height?: number;

  /** Line color */
  color?: string;

  /** Fill color (deprecated - use fillGradient instead) */
  fillColor?: string;

  /** Fill gradient colors */
  fillGradient?: {
    startColor: string;
    endColor: string;
  };

  /** Loading state */
  loading?: boolean;

  /** Benchmark comparison value (e.g., "+1.2% vs S&P 500") */
  benchmarkComparison?: string;

  /** Callback when hovering over a data point */
  onHoverData?: (data: { value: number; label: string } | null) => void;
}

// Time frame descriptions
const timeFrameDescriptions: Record<TimeFrame, string> = {
  '1D': 'Showing today',
  '1W': 'Showing last 7 days',
  '1M': 'Showing last month',
  '3M': 'Showing last 3 months',
  '1Y': 'Showing last 12 months',
};

export function WealthPerformanceChart({
  title = 'Performance',
  summaryMetric,
  data,
  defaultTimeFrame = '1M',
  height = 220,
  color = '#441316',
  fillColor = 'rgba(68, 19, 22, 0.05)',
  fillGradient,
  loading = false,
  benchmarkComparison: _benchmarkComparison,
  onHoverData,
}: WealthPerformanceChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(defaultTimeFrame);
  const _timeFrameDescriptions = timeFrameDescriptions;
  const timeFrames: TimeFrame[] = ['1D', '1W', '1M', '3M', '1Y'];

  // Crosshair state
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const currentData = data[timeFrame];

  useEffect(() => {
    if (onHoverData) {
      const point = hoveredPoint !== null && currentData ? currentData[hoveredPoint] : null;
      onHoverData(point ?? null);
    }
  }, [hoveredPoint, currentData, onHoverData]);

  // Loading state
  if (loading) {
    return (
      <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
        {/* Header */}
        {(title || summaryMetric) && (
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
            {title && (
              <p className="font-['rl-limo',sans-serif] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.2px] uppercase">
                {title}
              </p>
            )}
          </div>
        )}

        {/* Time Frame Selector */}
        <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full flex-wrap">
          {timeFrames.map((tf) => (
            <Tag key={tf} active={false} onClick={() => {}}>
              {tf}
            </Tag>
          ))}
        </div>

        {/* Loading State */}
        <div
          className="content-stretch relative shrink-0 w-full flex items-center justify-center bg-[rgba(68,19,22,0.02)] rounded-[8px]"
          style={{ height: `${height}px` }}
        >
          <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[12px] opacity-50">
            Loading chart data...
          </p>
        </div>
      </div>
    );
  }

  // No data or insufficient data state
  if (!currentData || currentData.length < 2) {
    return (
      <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
        {/* Header */}
        {(title || summaryMetric) && (
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
            {title && (
              <p className="font-['rl-limo',sans-serif] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.2px] uppercase">
                {title}
              </p>
            )}
          </div>
        )}

        {/* Time Frame Selector */}
        <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full flex-wrap">
          {timeFrames.map((tf) => (
            <Tag key={tf} active={timeFrame === tf} onClick={() => setTimeFrame(tf)}>
              {tf}
            </Tag>
          ))}
        </div>

        {/* No Data State */}
        <div
          className="content-stretch relative shrink-0 w-full flex items-center justify-center bg-[rgba(68,19,22,0.02)] rounded-[8px]"
          style={{ height: `${height}px` }}
        >
          <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[12px] opacity-50">
            Insufficient data for this time range
          </p>
        </div>
      </div>
    );
  }

  const padding = { top: 20, right: 0, bottom: 30, left: 76 }; // 26px gap between Y-axis labels and chart area
  const chartWidth = 1000; // SVG viewBox width
  const chartHeight = height - padding.top - padding.bottom;

  const values = currentData.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Add 8% padding above max and below min for visual breathing room
  const paddingPercent = 0.08;
  const paddedMin = min - range * paddingPercent;
  const paddedMax = max + range * paddingPercent;
  const paddedRange = paddedMax - paddedMin;

  // Check for flat performance
  const isFlat = range < min * 0.001; // Less than 0.1% variation

  // Generate path for sparkline - anchored to bottom-left with proper SVG coordinates
  const pathPoints = currentData.map((point, index) => {
    const x =
      padding.left +
      (index / (currentData.length - 1)) * (chartWidth - padding.left - padding.right);
    const y = padding.top + (1 - (point.value - paddedMin) / paddedRange) * chartHeight;
    return { x, y };
  });

  const linePath = pathPoints
    .map((point, i) => (i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
    .join(' ');

  const areaPath = `${linePath} L ${chartWidth} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  // Last point for marker
  const lastPoint = pathPoints[pathPoints.length - 1];

  // Y-axis values
  const midValue = (min + max) / 2;
  const formatValue = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  // Calculate exact Y-axis label positions to align with grid lines
  const yAxisLabels = [
    { value: max, top: padding.top },
    { value: midValue, top: padding.top + chartHeight * 0.5 },
    { value: min, top: padding.top + chartHeight * 1.0 },
  ];

  // X-axis labels - show all data points for accurate representation
  // For 1Y, only show first and last labels
  const xAxisLabels = currentData
    .map((dataPoint, index) => {
      const pointIndex = index;
      return {
        data: dataPoint,
        left: (pathPoints[pointIndex].x / chartWidth) * 100,
        index,
      };
    })
    .filter((label, _, arr) => {
      if (timeFrame === '1Y') {
        // Only show first and last for 1Y
        return label.index === 0 || label.index === arr.length - 1;
      }
      if (timeFrame === '1D') {
        // Only show 9am (0), 12pm (3), 3pm (6), and 6pm (9)
        return label.index === 0 || label.index === 3 || label.index === 6 || label.index === 9;
      }
      // Show all labels for other time frames
      return true;
    });

  // Mouse/Touch event handlers for crosshair
  const handleChartInteraction = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!chartContainerRef.current) return;

    const rect = chartContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const xPercent = x / rect.width;

    // Convert to SVG coordinates
    const svgX = xPercent * chartWidth;

    // Find the closest data point
    if (svgX >= padding.left && svgX <= chartWidth - padding.right) {
      const chartXRange = chartWidth - padding.left - padding.right;
      const dataX = (svgX - padding.left) / chartXRange;
      const dataIndex = Math.round(dataX * (currentData.length - 1));
      const clampedIndex = Math.max(0, Math.min(currentData.length - 1, dataIndex));

      setHoveredPoint(clampedIndex);
    }
  };

  const handleChartLeave = () => {
    setHoveredPoint(null);
  };

  // Get the currently displayed data point (hovered or last)
  const displayedPoint =
    hoveredPoint !== null ? currentData[hoveredPoint] : currentData[currentData.length - 1];
  const displayedPathPoint = hoveredPoint !== null ? pathPoints[hoveredPoint] : lastPoint;

  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      {/* Header - Title and Summary */}
      {(title || summaryMetric) && (
        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
          {title && (
            <p className="font-['DM_Sans',sans-serif] font-semibold not-italic relative shrink-0 text-[rgba(85,85,85,0.8)] text-[10px] tracking-[0.8px] uppercase">
              {title}
            </p>
          )}
          {summaryMetric && (
            <div
              className={`px-[8px] py-[4px] rounded-[50px] ${summaryMetric.isPositive ? 'bg-[#c6ff6a]' : 'bg-[#ffcccb]'}`}
            >
              <p
                className={`font-['DM_Sans',sans-serif] font-semibold text-[12px] ${summaryMetric.isPositive ? 'text-[#03561a]' : 'text-[#992929]'}`}
              >
                {summaryMetric.value}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Time Frame Selector */}
      <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full flex-wrap">
        {timeFrames.map((tf) => (
          <Tag key={tf} active={timeFrame === tf} onClick={() => setTimeFrame(tf)}>
            {tf}
          </Tag>
        ))}
      </div>

      {/* Chart Container - Properly Bounded */}
      <div
        ref={chartContainerRef}
        className="content-stretch relative shrink-0 w-full cursor-crosshair"
        style={{ height: `${height}px` }}
        onMouseMove={handleChartInteraction}
        onMouseLeave={handleChartLeave}
        onTouchMove={handleChartInteraction}
        onTouchEnd={handleChartLeave}
      >
        {/* Y-axis labels - Absolutely positioned to align with grid lines */}
        {yAxisLabels.map((label, i) => (
          <p
            key={i}
            className={`absolute left-0 font-['DM_Sans',sans-serif] text-[#555555] text-[9px] opacity-30 pointer-events-none ${
              i === 0 ? '' : i === yAxisLabels.length - 1 ? '-translate-y-full' : '-translate-y-1/2'
            }`}
            style={{ top: `${label.top}px` }}
          >
            {formatValue(label.value)}
          </p>
        ))}

        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${height}`}
          preserveAspectRatio="none"
          className="overflow-hidden pointer-events-none"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Clip path to ensure sparkline stays within bounds */}
          <defs>
            <clipPath id="chart-clip">
              <rect
                x={padding.left}
                y={padding.top}
                width={chartWidth - padding.left}
                height={chartHeight}
              />
            </clipPath>
            {/* Gradient fill */}
            {fillGradient && (
              <linearGradient id={`fill-gradient-${timeFrame}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={fillGradient.startColor} />
                <stop offset="100%" stopColor={fillGradient.endColor} />
              </linearGradient>
            )}
          </defs>

          {/* Grid lines - Horizontal only */}
          <g opacity="0.1">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = padding.top + chartHeight * ratio;
              return (
                <line
                  key={i}
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="#555555"
                  strokeWidth="0.5"
                />
              );
            })}
          </g>

          {/* Baseline indicator (start point) */}
          <line
            x1={pathPoints[0].x}
            y1={padding.top}
            x2={pathPoints[0].x}
            y2={height - padding.bottom}
            stroke="#555555"
            strokeWidth="0.5"
            opacity="0.15"
            strokeDasharray="2,2"
          />

          {/* Clipped chart content */}
          <g clipPath="url(#chart-clip)">
            {/* Area fill */}
            <path
              d={areaPath}
              fill={fillGradient ? `url(#fill-gradient-${timeFrame})` : fillColor}
            />

            {/* Sparkline - Anchored and scaled to grid */}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth={isFlat ? '1' : '2'}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isFlat ? '0.5' : '1'}
              vectorEffect="non-scaling-stroke"
            />

            {/* Crosshair vertical line */}
            {hoveredPoint !== null && (
              <line
                x1={displayedPathPoint.x}
                y1={padding.top}
                x2={displayedPathPoint.x}
                y2={height - padding.bottom}
                stroke={color}
                strokeWidth="1"
                opacity="0.5"
                strokeDasharray="4,4"
              />
            )}
          </g>
        </svg>

        {/* Data point indicator - rendered separately to maintain circular shape */}
        {hoveredPoint !== null && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${(displayedPathPoint.x / chartWidth) * 100}%`,
              top: `${displayedPathPoint.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" className="overflow-visible">
              <circle cx="6" cy="6" r="4" fill="white" stroke={color} strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* Tooltip - Shows value and label at hovered point */}
        {hoveredPoint !== null && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${(displayedPathPoint.x / chartWidth) * 100}%`,
              top: `${displayedPathPoint.y - 40}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-[#a87174] rounded-[8px] px-[10px] py-[6px] shadow-lg">
              <p className="font-['DM_Sans',sans-serif] font-semibold text-white text-[11px] leading-tight whitespace-nowrap">
                {formatValue(displayedPoint.value)}
              </p>
              <p className="font-['DM_Sans',sans-serif] text-white text-[9px] opacity-70 leading-tight whitespace-nowrap">
                {displayedPoint.label}
              </p>
            </div>
          </div>
        )}

        {/* X-axis labels - Absolutely positioned to align with data points */}
        {xAxisLabels.map((label, i) => (
          <p
            key={i}
            className={`absolute bottom-0 font-['DM_Sans',sans-serif] text-[#555555] text-[10px] opacity-50 pointer-events-none ${
              i === 0 ? '' : i === xAxisLabels.length - 1 ? '-translate-x-full' : '-translate-x-1/2'
            }`}
            style={{ left: `${label.left}%` }}
          >
            {label.data.label}
          </p>
        ))}

        {/* Flat performance indicator */}
        {isFlat && (
          <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
            <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[10px] opacity-40">
              Flat performance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
