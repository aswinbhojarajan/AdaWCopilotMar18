import React from 'react';

interface GoalHealthGaugeProps {
  score: number;
  label: string;
}

export function GoalHealthGauge({ score, label }: GoalHealthGaugeProps) {
  const getColor = (s: number) => {
    if (s > 70) return '#4ade80';
    if (s >= 40) return '#facc15';
    return '#f87171';
  };

  const color = getColor(score);
  const radius = 34;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-[16px] w-full py-[4px]">
      <div className="shrink-0 relative" style={{ width: 80, height: 80 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-['DM_Sans:SemiBold',sans-serif] text-[20px]"
            style={{ color }}
          >
            {score}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-[2px] min-w-0">
        <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#992929] text-[10px] tracking-[0.8px] uppercase">
          PLAN HEALTH
        </p>
        <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[13px] leading-[1.4]">
          {label}
        </p>
      </div>
    </div>
  );
}
