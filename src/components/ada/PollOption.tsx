import React from 'react';

/**
 * PollOption Component
 *
 * A radio button option for polls with grey outline styling that changes to burgundy when selected.
 * After voting, displays percentage results with visual bar indicators.
 * Follows the Ada design system typography and color patterns.
 *
 * @component
 * @example
 * ```tsx
 * // Before voting
 * <PollOption name="region-poll" value="north-america" label="North America" />
 *
 * // After voting (showing results)
 * <PollOption
 *   name="region-poll"
 *   value="north-america"
 *   label="North America"
 *   showResults={true}
 *   percentage={32}
 *   isUserSelection={true}
 * />
 * ```
 */

export interface PollOptionProps {
  /** The name attribute for the radio button group */
  name: string;
  /** The value for this specific option */
  value: string;
  /** The label text to display next to the radio button */
  label: string;
  /** Optional onChange handler */
  onChange?: (value: string) => void;
  /** Optional checked state for controlled components */
  checked?: boolean;
  /** Whether to show results mode with percentage bar */
  showResults?: boolean;
  /** The percentage value to display (0-100) */
  percentage?: number;
  /** Whether this was the user's selection */
  isUserSelection?: boolean;
}

export function PollOption({
  name,
  value,
  label,
  onChange,
  checked,
  showResults = false,
  percentage = 0,
  isUserSelection = false,
}: PollOptionProps) {
  // Results view
  if (showResults) {
    return (
      <div className="content-stretch flex flex-col gap-[4px] relative shrink-0 w-full">
        <div className="flex items-center justify-between">
          <p className="font-['Crimson_Pro:ExtraLight',sans-serif] text-[12px] text-[#555555]">
            {label}
          </p>
          <p
            className={`font-['DM_Sans:Medium',sans-serif] text-[12px] ${isUserSelection ? 'text-[#992929]' : 'text-[#555555] opacity-60'}`}
          >
            {percentage}%
          </p>
        </div>
        <div className="flex gap-[2px] h-[24px]">
          <div
            className={`${isUserSelection ? 'bg-[#992929]' : 'bg-[#d9b3b5]'} rounded-[2px] transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
          <div className="flex-1" />
        </div>
      </div>
    );
  }

  // Voting view
  return (
    <label className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full cursor-pointer group">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-[20px] h-[20px] accent-[#992929] cursor-pointer appearance-none border-[0.75px] border-[#999999] rounded-full checked:border-[#992929] checked:bg-[#992929] checked:shadow-[inset_0_0_0_3px_white] transition-all"
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none',
        }}
      />
      <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] text-[#555555] text-[14px] group-hover:text-[#992929] transition-colors">
        {label}
      </p>
    </label>
  );
}
