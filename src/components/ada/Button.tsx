import React from 'react';
import { SparkIcon } from './SparkIcon';

/**
 * Button Component - Ada Design System
 *
 * A reusable button component following the established button hierarchy:
 *
 * BUTTON VARIANTS:
 *
 * 1. 'primary' - Deep burgundy (#441316) background with white text
 *    Use for: Primary actions that don't involve AI chat
 *
 * 2. 'secondary' - Transparent/clear button with gray text and gray border
 *    Use for: Secondary actions that don't involve AI chat
 *
 * 3. 'ai-chat' - Transparent/clear button with gray text, gray border, and spark icon
 *    Use for: Encouraging engagement with AI chat (secondary emphasis)
 *
 * 4. 'ai-primary' - Deep burgundy background with white text and white spark icon
 *    Use for: Primary AI chat engagement buttons (highest emphasis)
 *
 * SPARK ICON RULE:
 * - Spark icon is added when a button is meant to encourage engagement with AI chat
 * - Without spark icon, clear button = secondary button
 * - Deep burgundy = primary button
 * - Deep burgundy with spark icon = primary AI chat engagement
 *
 * ALIGNMENT:
 * - Buttons are left-aligned by default (intrinsic width based on content)
 * - DO NOT use w-full or width classes unless specifically required
 * - Buttons naturally size to their content
 */

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ai-chat' | 'ai-primary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    'content-stretch flex items-center justify-center relative rounded-[50px] shrink-0';

  const variantStyles = {
    primary: 'bg-[#441316]',
    secondary: '',
    'ai-chat': '',
    'ai-primary': 'bg-[#441316]',
  };

  const sizeStyles = {
    sm: 'h-[48px] px-[8px] py-[10px]',
    md: 'h-[48px] px-[14px] py-[10px]',
    lg: 'h-[52px] px-[20px] py-[12px]',
  };

  const textColor =
    variant === 'primary' || variant === 'ai-primary' ? 'text-white' : 'text-[#555555]';
  const showBorder = variant === 'secondary' || variant === 'ai-chat';
  const showSparkIcon = variant === 'ai-chat' || variant === 'ai-primary';
  const sparkIconColor = variant === 'ai-primary' ? '#ffffff' : '#d8d8d8';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} transition-all duration-200 hover:brightness-110 active:scale-[0.98] cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {showBorder && (
        <div
          aria-hidden="true"
          className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]"
        />
      )}
      <div className="flex gap-[6px] items-center justify-center">
        {showSparkIcon && (
          <div className="relative shrink-0 size-[24px] flex items-center justify-center">
            <SparkIcon size={18} color={sparkIconColor} />
          </div>
        )}
        <p
          className={`${variant === 'primary' || variant === 'ai-primary' ? "font-['DM_Sans',sans-serif] font-semibold" : "font-['DM_Sans',sans-serif]"} not-italic relative shrink-0 ${textColor} text-[0.75rem] text-nowrap whitespace-pre`}
        >
          {children}
        </p>
      </div>
    </button>
  );
}
