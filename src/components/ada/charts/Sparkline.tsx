import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function Sparkline({
  data,
  width = 60,
  height = 24,
  color = '#555555',
  strokeWidth = 1.5,
  className = '',
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Add generous padding to prevent stroke clipping and overflow
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data
    .map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + (chartHeight - ((value - min) / range) * chartHeight);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
