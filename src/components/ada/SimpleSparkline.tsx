import React from 'react';

/**
 * Data point interface for sparkline
 */
export interface SparklineDataPoint {
  value: number;
  label?: string;
}

/**
 * SimpleSparkline Component
 * 
 * A minimal, non-interactive sparkline for visual trend indication.
 * Shows only the path with optional gradient fill - no axes, labels, or interactions.
 * 
 * @component
 * @example
 * ```tsx
 * <SimpleSparkline
 *   data={[
 *     { value: 100 },
 *     { value: 120 },
 *     { value: 115 },
 *     { value: 130 }
 *   ]}
 *   color="#992929"
 *   height={60}
 * />
 * ```
 */
interface SimpleSparklineProps {
  /** Array of data points to plot */
  data: SparklineDataPoint[];
  /** Line color (default: #992929) */
  color?: string;
  /** Fill color for area under line (default: transparent) */
  fillColor?: string;
  /** Optional gradient configuration for fill */
  fillGradient?: {
    startColor: string;
    endColor: string;
  };
  /** Height in pixels (default: 60) */
  height?: number;
  /** Width as CSS value (default: 100%) */
  width?: string;
}

export function SimpleSparkline({
  data,
  color = '#992929',
  fillColor = 'transparent',
  fillGradient,
  height = 60,
  width = '100%'
}: SimpleSparklineProps) {
  // Calculate min/max for scaling
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;
  
  // Determine if flat (less than 0.1% variation)
  const isFlat = valueRange / minValue < 0.001;
  
  // Simple padding
  const padding = { top: 8, right: 4, bottom: 8, left: 4 };
  const chartWidth = 100; // viewBox width
  const chartHeight = height - padding.top - padding.bottom;
  
  // Generate path points
  const pathPoints = data.map((point, i) => {
    const x = padding.left + (i / (data.length - 1)) * (chartWidth - padding.left - padding.right);
    
    let y: number;
    if (isFlat) {
      y = padding.top + chartHeight / 2;
    } else {
      const normalizedValue = (point.value - minValue) / valueRange;
      y = padding.top + chartHeight * (1 - normalizedValue);
    }
    
    return { x, y };
  });
  
  // Create SVG path for line
  const linePath = pathPoints.reduce((path, point, i) => {
    if (i === 0) {
      return `M ${point.x},${point.y}`;
    }
    return `${path} L ${point.x},${point.y}`;
  }, '');
  
  // Create area path (for fill)
  const areaPath = pathPoints.reduce((path, point, i) => {
    if (i === 0) {
      return `M ${point.x},${height - padding.bottom} L ${point.x},${point.y}`;
    }
    if (i === pathPoints.length - 1) {
      return `${path} L ${point.x},${point.y} L ${point.x},${height - padding.bottom} Z`;
    }
    return `${path} L ${point.x},${point.y}`;
  }, '');
  
  const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div 
      className="content-stretch relative shrink-0" 
      style={{ height: `${height}px`, width }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${chartWidth} ${height}`}
        preserveAspectRatio="none"
        className="overflow-hidden"
      >
        <defs>
          {fillGradient && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={fillGradient.startColor} />
              <stop offset="100%" stopColor={fillGradient.endColor} />
            </linearGradient>
          )}
        </defs>

        {/* Baseline for grounding */}
        <line
          x1="0"
          y1={height}
          x2={chartWidth}
          y2={height}
          stroke="#d8d8d8"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />

        {/* Area fill */}
        {(fillGradient || fillColor !== 'transparent') && (
          <path
            d={areaPath}
            fill={fillGradient ? `url(#${gradientId})` : fillColor}
          />
        )}

        {/* Sparkline */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={isFlat ? "0.5" : "1.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isFlat ? "0.3" : "1"}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      
      {/* Flat performance indicator */}
      {isFlat && (
        <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
          <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[10px] opacity-40">
            Flat
          </p>
        </div>
      )}
    </div>
  );
}